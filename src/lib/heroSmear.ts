import { drawCover, seeded, type Pt } from './smear'

// The hero's picture is never shown whole. It lives inside one enormous
// dry-brush stroke laid across the screen, and the cursor drags a trail
// through the dark that lets the room show for a moment before it sinks back into shadow.

type Options = {
  /** Called when the stroke has been fully laid down. */
  onLaid?: () => void
}

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

/** Smooth 1D value noise in [-1, 1]: stable for a given seed, so the edge looks the same on every redraw. */
function noise(v: number, seed: number) {
  const hash = (i: number) => {
    const n = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1
  }
  const i = Math.floor(v)
  const f = v - i
  const t = f * f * (3 - 2 * f)
  return hash(i) + (hash(i + 1) - hash(i)) * t
}

function layer() {
  const c = document.createElement('canvas')
  return { c, x: c.getContext('2d')! }
}

export class HeroSmear {
  private ctx: CanvasRenderingContext2D
  private stroke = layer()
  private trail = layer()
  private combo = layer()
  private w = 0
  private h = 0
  private dpr = 1
  private raf = 0
  private ro: ResizeObserver
  private io: IntersectionObserver
  private visible = true
  private last: Pt | null = null
  private fadeUntil = 0
  private fadeStep = 0.04
  private trailLive = false
  private laidTo = 0
  private laying: { start: number; ms: number } | null = null
  private fade = { from: -1, to: 0, start: 0 }
  private canvas: HTMLCanvasElement
  private images: HTMLImageElement[]
  private opts: Options

  constructor(canvas: HTMLCanvasElement, images: HTMLImageElement[], opts: Options = {}) {
    this.canvas = canvas
    this.images = images
    this.opts = opts
    this.ctx = canvas.getContext('2d')!
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) this.wake()
    })
    this.io.observe(canvas)
    this.resize()
  }

  /** The path of the great stroke, in 0–1 coordinates: a wrist's arc, low on the left, rising to the right. */
  private path(u: number): Pt {
    const x = -0.06 + u * 1.12
    // On a tall screen the stroke climbs more steeply, through the lit middle of the room.
    const y =
      this.h > this.w
        ? 0.44 - u * 0.28 + Math.sin(u * Math.PI * 1.1 + 0.2) * 0.04 + Math.sin(u * Math.PI * 3.1) * 0.008
        : 0.42 - u * 0.17 + Math.sin(u * Math.PI * 1.1 + 0.2) * 0.06 + Math.sin(u * Math.PI * 3.1) * 0.012
    return { x: x * this.w, y: y * this.h }
  }

  private width(u: number) {
    const base = this.h > this.w ? this.w * 0.52 : Math.min(this.h * 0.42, this.w * 0.36)
    // The pressure of a hand: loaded at the start, swelling and easing, lifting off at the end.
    const pressure = 0.8 + 0.18 * Math.sin(u * Math.PI * 0.9 + 0.15) + 0.05 * Math.sin(u * Math.PI * 4.3)
    const touch = u < 0.05 ? 0.7 + (u / 0.05) * 0.3 : 1
    const lift = u > 0.82 ? 1 - Math.pow((u - 0.82) / 0.18, 2) * 0.55 : 1
    return base * pressure * touch * lift
  }

  /** On a tall screen the room is zoomed from its bottom edge, matching the CSS underlay. */
  private frame(): [number, number, number] {
    return this.h > this.w ? [1.35, 0.5, 1] : [1, 0.5, 0.5]
  }

  /** Unit normal of the path at u. */
  private normal(u: number): Pt {
    const a = this.path(Math.max(0, u - 0.002))
    const b = this.path(Math.min(1, u + 0.002))
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    return { x: -dy / len, y: dx / len }
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.w = r.width
    this.h = r.height
    for (const l of [this.stroke, this.trail, this.combo]) {
      l.c.width = Math.round(this.w * this.dpr)
      l.c.height = Math.round(this.h * this.dpr)
      l.x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    }
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    // The stroke is redrawn at the new size up to wherever it had reached.
    const reached = this.laidTo
    this.laidTo = 0
    this.layTo(reached)
    this.wake()
  }

  // Bristles only fray the outer edge of the stroke; inside it the room shows evenly.
  // Each keeps its own place, weight and dry-out point and drifts slowly, as hairs do under a moving brush.
  private hairs = (() => {
    const r = seeded(17)
    return Array.from({ length: 220 }, () => {
      const off = (r() < 0.5 ? -1 : 1) * (0.4 + r() * r() * 0.2)
      const edge = (Math.abs(off) - 0.4) / 0.2
      const gaps: [number, number][] = []
      for (let g = 0; g < 2; g++) {
        if (r() < 0.2 + edge * 0.5) {
          const at = 0.2 + r() * 0.8
          gaps.push([at, at + 0.02 + r() * 0.08 * (0.5 + at)])
        }
      }
      return {
        off,
        // Mostly fine hairs, with the odd clump where several stuck together.
        weight: r() < 0.12 ? 0.02 + r() * 0.025 : 0.003 + r() * r() * 0.012,
        end: 1.02 - edge * (0.2 + r() * 0.5) - r() * 0.06,
        drift: 0.008 + r() * 0.014,
        phase: r() * Math.PI * 2,
        gaps,
      }
    })
  })()

  private layTo(u: number) {
    const x = this.stroke.x
    x.strokeStyle = '#fff'
    x.fillStyle = '#fff'
    x.lineCap = 'round'
    x.globalAlpha = 1
    const step = 0.0025
    for (let a = this.laidTo; a < u - 1e-6; a += step) {
      const b = Math.min(u, a + step)
      const pa = this.path(a)
      const pb = this.path(b)
      const na = this.normal(a)
      const nb = this.normal(b)
      const wa = this.width(a)
      const wb = this.width(b)

      // The loaded heart of the stroke: one solid band. Each piece starts a little behind
      // the last so no seam is left between them, and each edge is torn on its own.
      if (b < 0.95) {
        const fade = (v: number) => 1 - Math.max(0, v - 0.72) * 1.4
        const rough = (v: number, seed: number) =>
          0.44 + noise(v * 14, seed) * 0.05 + noise(v * 55, seed + 1) * 0.035 + noise(v * 190, seed + 2) * 0.022 + noise(v * 600, seed + 3) * 0.012
        const a0 = Math.max(0, a - step * 0.6)
        const p0 = this.path(a0)
        const n0 = this.normal(a0)
        const w0 = this.width(a0)
        const top0 = w0 * rough(a0, 3) * fade(a0)
        const bot0 = w0 * rough(a0, 7) * fade(a0)
        const top1 = wb * rough(b, 3) * fade(b)
        const bot1 = wb * rough(b, 7) * fade(b)
        x.beginPath()
        x.moveTo(p0.x + n0.x * top0, p0.y + n0.y * top0)
        x.lineTo(pb.x + nb.x * top1, pb.y + nb.y * top1)
        x.lineTo(pb.x - nb.x * bot1, pb.y - nb.y * bot1)
        x.lineTo(p0.x - n0.x * bot0, p0.y - n0.y * bot0)
        x.closePath()
        x.fill()
      }

      for (const h of this.hairs) {
        if (b > h.end || h.gaps.some(([g0, g1]) => b > g0 && b < g1)) continue
        const oa = (h.off + Math.sin(a * 2.6 + h.phase) * h.drift) * wa
        const ob = (h.off + Math.sin(b * 2.6 + h.phase) * h.drift) * wb
        x.lineWidth = Math.max(0.8, h.weight * wb)
        x.beginPath()
        x.moveTo(pa.x + na.x * oa, pa.y + na.y * oa)
        x.lineTo(pb.x + nb.x * ob, pb.y + nb.y * ob)
        x.stroke()
      }
    }
    this.laidTo = Math.max(this.laidTo, u)
  }

  /** Lay the stroke across the screen over `ms`; 0 lays it at once. */
  lay(ms: number) {
    if (ms <= 0) {
      this.layTo(1)
      this.opts.onLaid?.()
      this.wake()
      return
    }
    this.laying = { start: performance.now(), ms }
    this.wake()
  }

  /** Cross-fade the picture inside the stroke to image `i`. */
  show(i: number) {
    const current = this.fade.to
    if (i === current) return
    this.fade = { from: current, to: i, start: performance.now() }
    this.wake()
  }

  /**
   * Uncover the room from the previous point to p (element pixels), as brightly as the stroke shows it.
   * Below full `strength` the brush narrows and thins, so the trail tapers off near clickable text.
   */
  reveal(p: Pt, fresh = false, strength = 1) {
    if (strength <= 0) {
      this.lift()
      return
    }
    const from = fresh || !this.last ? p : this.last
    const x = this.trail.x
    const d = Math.hypot(p.x - from.x, p.y - from.y)
    const n = Math.max(1, Math.ceil(d / 10))
    const r = Math.min(this.w, this.h) * 0.1 * (0.35 + 0.65 * strength)
    // Dabs overlap heavily along the path, so opacity falls off much faster than strength.
    const a = strength * strength * strength
    for (let i = 1; i <= n; i++) {
      const cx = from.x + ((p.x - from.x) * i) / n
      const cy = from.y + ((p.y - from.y) * i) / n
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, `rgba(255,255,255,${a})`)
      g.addColorStop(0.55, `rgba(255,255,255,${a})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.beginPath()
      x.arc(cx, cy, r, 0, Math.PI * 2)
      x.fill()
    }
    this.last = p
    this.fadeUntil = performance.now() + 3000
    this.fadeStep = 0.04
    this.trailLive = true
    this.wake()
  }

  /** Fade the trail out quickly, so nothing lingers behind text the visitor has reached. */
  hush() {
    if (!this.trailLive) return
    this.fadeUntil = Math.min(this.fadeUntil, performance.now() + 400)
    this.fadeStep = 0.18
    this.wake()
  }

  lift() {
    this.last = null
  }

  private wake() {
    if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.raf = 0
    let busy = false

    if (this.laying) {
      const t = (now - this.laying.start) / this.laying.ms
      this.layTo(ease(t))
      if (t >= 1) {
        this.laying = null
        this.opts.onLaid?.()
      } else busy = true
    }

    // Where the cursor has passed, the room sinks back into shadow, in place.
    // A fractional fade stalls at faint 8-bit values, so once it has run its
    // course the trail is cleared outright and leaves nothing behind.
    if (this.trailLive) {
      const x = this.trail.x
      if (now < this.fadeUntil) {
        x.globalCompositeOperation = 'destination-out'
        x.globalAlpha = this.fadeStep
        x.fillStyle = '#000'
        x.fillRect(0, 0, this.w, this.h)
        x.globalAlpha = 1
        x.globalCompositeOperation = 'source-over'
        busy = true
      } else {
        x.clearRect(0, 0, this.w, this.h)
        this.trailLive = false
      }
    }

    const f = this.fade.from >= 0 ? (now - this.fade.start) / 700 : 1
    if (f < 1) busy = true
    this.render(Math.min(f, 1))
    if (f >= 1) this.fade.from = -1

    if (busy) this.wake()
  }

  private render(f: number) {
    const { ctx, w, h, combo } = this
    if (!w || !h) return
    const to = this.images[this.fade.to]
    const from = this.fade.from >= 0 ? this.images[this.fade.from] : null
    if (!to?.complete || !to.naturalWidth) return

    combo.x.setTransform(1, 0, 0, 1, 0, 0)
    combo.x.clearRect(0, 0, combo.c.width, combo.c.height)
    combo.x.filter = 'blur(0.8px)'
    combo.x.drawImage(this.stroke.c, 0, 0)
    combo.x.filter = 'none'
    combo.x.drawImage(this.trail.c, 0, 0)

    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, w, h)
    if (from && f < 1 && from.complete) {
      drawCover(ctx, from, w, h, ...this.frame())
      ctx.globalAlpha = ease(f)
    }
    drawCover(ctx, to, w, h, ...this.frame())
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(combo.c, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
  }
}
