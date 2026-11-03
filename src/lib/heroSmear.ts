import { drawCover, seeded, type Pt } from './smear'

// The hero's picture is never shown whole. It lives inside one enormous
// dry-brush stroke laid across the screen, and the cursor drags smoke
// through the dark that lets the room show for a moment before it drifts away.

type Options = {
  /** Called when the stroke has been fully laid down. */
  onLaid?: () => void
}

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

function layer() {
  const c = document.createElement('canvas')
  return { c, x: c.getContext('2d')! }
}

export class HeroSmear {
  private ctx: CanvasRenderingContext2D
  private stroke = layer()
  private smokeA = layer()
  private smokeB = layer()
  private combo = layer()
  private w = 0
  private h = 0
  private dpr = 1
  private raf = 0
  private ro: ResizeObserver
  private io: IntersectionObserver
  private visible = true
  private last: Pt | null = null
  private lastMove = 0
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

  /** The path of the great stroke, in 0–1 coordinates: low on the left, rising to the right. */
  private path(u: number): Pt {
    const x = -0.06 + u * 1.12
    // On a tall screen the stroke climbs more steeply, through the lit middle of the room.
    const tall = this.h > this.w
    const y = tall
      ? 0.42 - u * 0.26 + Math.sin(u * Math.PI * 1.4 + 0.3) * 0.02
      : 0.4 - u * 0.18 + Math.sin(u * Math.PI * 1.4 + 0.3) * 0.035
    return { x: x * this.w, y: y * this.h }
  }

  private width(u: number) {
    const base = this.h > this.w ? this.w * 0.5 : Math.min(this.h * 0.4, this.w * 0.34)
    // Loaded at the start, thinning towards the end.
    return base * (u < 0.05 ? 0.75 + (u / 0.05) * 0.25 : 1 - 0.25 * u)
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
    for (const l of [this.stroke, this.smokeA, this.smokeB, this.combo]) {
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

  // Every bristle keeps its own place, weight and dry-out point for the whole
  // stroke, so the texture runs as continuous streaks the way a real brush leaves them.
  private hairs = (() => {
    const r = seeded(17)
    return Array.from({ length: 260 }, () => {
      const off = (r() - 0.5) * (r() < 0.8 ? 0.9 : 1.04)
      const edge = Math.abs(off) * 2
      const gaps: [number, number][] = []
      for (let g = 0; g < 3; g++) {
        if (r() < 0.25 + edge * 0.4) {
          const at = 0.15 + r() * 0.85
          gaps.push([at, at + 0.02 + r() * 0.09 * (0.5 + at)])
        }
      }
      return {
        off,
        weight: 0.0025 + r() * r() * 0.016,
        end: 1.04 - edge * edge * (0.25 + r() * 0.6) - r() * 0.08,
        phase: r() * Math.PI * 2,
        gaps,
      }
    })
  })()

  private layTo(u: number) {
    const x = this.stroke.x
    x.strokeStyle = '#fff'
    x.lineCap = 'butt'
    x.globalAlpha = 1
    const step = 0.0035
    for (let a = this.laidTo; a < u - 1e-6; a += step) {
      const b = Math.min(u, a + step)
      const pa = this.path(a)
      const pb = this.path(b)
      const na = this.normal(a)
      const nb = this.normal(b)
      const wa = this.width(a)
      const wb = this.width(b)
      // The loaded heart of the stroke, ending before the hairs do.
      if (b < 0.86) {
        const core = 0.5 * (1 - b * 0.35)
        x.lineWidth = wb * core
        x.beginPath()
        x.moveTo(pa.x, pa.y)
        x.lineTo(pb.x, pb.y)
        x.stroke()
      }
      for (const h of this.hairs) {
        if (b > h.end || h.gaps.some(([g0, g1]) => b > g0 && b < g1)) continue
        const oa = (h.off + Math.sin(a * 9 + h.phase) * 0.006) * wa
        const ob = (h.off + Math.sin(b * 9 + h.phase) * 0.006) * wb
        x.lineWidth = Math.max(0.6, h.weight * wb)
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

  /** Drag smoke from the previous point to p (element pixels). */
  smoke(p: Pt, fresh = false) {
    const from = fresh || !this.last ? p : this.last
    const x = this.smokeA.x
    const d = Math.hypot(p.x - from.x, p.y - from.y)
    const n = Math.max(1, Math.ceil(d / 10))
    const r = Math.min(this.w, this.h) * 0.1
    for (let i = 1; i <= n; i++) {
      const cx = from.x + ((p.x - from.x) * i) / n
      const cy = from.y + ((p.y - from.y) * i) / n
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, 'rgba(255,255,255,0.5)')
      g.addColorStop(0.45, 'rgba(255,255,255,0.22)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.beginPath()
      x.arc(cx, cy, r, 0, Math.PI * 2)
      x.fill()
    }
    this.last = p
    this.lastMove = performance.now()
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

    // Smoke rises a little, spreads and thins each frame.
    if (now - this.lastMove < 5000) {
      const b = this.smokeB
      b.x.setTransform(1, 0, 0, 1, 0, 0)
      b.x.clearRect(0, 0, b.c.width, b.c.height)
      b.x.filter = 'blur(2px)'
      b.x.globalAlpha = 0.978
      const sway = Math.sin(now / 900) * 0.4 * this.dpr
      b.x.drawImage(this.smokeA.c, sway, -1.1 * this.dpr)
      b.x.filter = 'none'
      b.x.globalAlpha = 1
      b.x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
      const t = this.smokeA
      this.smokeA = b
      this.smokeB = t
      busy = true
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
    combo.x.drawImage(this.stroke.c, 0, 0)
    combo.x.drawImage(this.smokeA.c, 0, 0)

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
    // The smoke has a body of its own: a pale haze, so it reads even over the dark.
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.4
    ctx.drawImage(this.smokeA.c, 0, 0, w, h)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
  }
}
