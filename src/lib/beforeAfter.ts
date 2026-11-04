import { drawCover, seeded, type Pt } from './smear'

// The finished room lies under the bare one. The cursor drags a smudge that trails
// slightly behind it, shows the finished room only inside, and closes up again behind it.

const FOLLOW_MS = 70
const CLOSE_MS = 420
const CLEAR_AFTER_MS = 1500

/** One dab of the brush: solid inside, torn at the rim, with loose hairs that streak as it travels. */
function makeDab(size: number) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const x = c.getContext('2d')!
  const r = seeded(29)
  const mid = size / 2
  const radius = size * 0.38
  const waves = [5, 11, 23, 47].map((freq, i) => ({ freq, phase: r() * Math.PI * 2, amp: 0.05 / (i * 0.7 + 1) }))

  x.fillStyle = '#fff'
  x.strokeStyle = '#fff'
  x.lineCap = 'round'
  x.beginPath()
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * Math.PI * 2
    const rim = radius * (1 + waves.reduce((sum, w) => sum + Math.sin(a * w.freq + w.phase) * w.amp, 0) + (r() - 0.5) * 0.025)
    x.lineTo(mid + Math.cos(a) * rim, mid + Math.sin(a) * rim)
  }
  x.closePath()
  x.fill()

  for (let i = 0; i < 110; i++) {
    const a = r() * Math.PI * 2
    const from = radius * 0.9
    const to = radius * (1.04 + r() * r() * 0.26)
    x.lineWidth = 0.6 + r() * r() * 3
    x.beginPath()
    x.moveTo(mid + Math.cos(a) * from, mid + Math.sin(a) * from)
    x.lineTo(mid + Math.cos(a) * to, mid + Math.sin(a) * to)
    x.stroke()
  }
  return c
}

export class BeforeAfterSmear {
  private ctx: CanvasRenderingContext2D
  private mask = document.createElement('canvas')
  private mctx: CanvasRenderingContext2D
  private dab = makeDab(320)
  private w = 0
  private h = 0
  private raf = 0
  private prev = 0
  private ro: ResizeObserver
  private io: IntersectionObserver
  private visible = false
  /** Where the visitor's pointer is, in viewport pixels: the section can scroll under a still cursor. */
  private pointer: Pt | null = null
  private demoRun: { start: number; ms: number } | null = null
  private pos: Pt | null = null
  private angle = 0
  private live = false
  private lastStamp = 0
  private canvas: HTMLCanvasElement
  private before: HTMLImageElement
  private after: HTMLImageElement

  constructor(canvas: HTMLCanvasElement, before: HTMLImageElement, after: HTMLImageElement) {
    this.canvas = canvas
    this.before = before
    this.after = after
    this.ctx = canvas.getContext('2d')!
    this.mctx = this.mask.getContext('2d')!
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) this.wake()
    })
    this.io.observe(canvas)
    this.resize()
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.w = r.width
    this.h = r.height
    for (const [c, x] of [
      [this.canvas, this.ctx],
      [this.mask, this.mctx],
    ] as const) {
      c.width = Math.round(this.w * dpr)
      c.height = Math.round(this.h * dpr)
      x.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    this.live = false
  }

  /** Track the pointer, given in viewport pixels. */
  point(p: Pt) {
    this.pointer = p
    this.demoRun = null
    this.wake()
  }

  lift() {
    this.pointer = null
  }

  /** Drag the smudge across the room once by itself, so the effect is seen before it is tried. */
  demo(ms: number) {
    if (this.pointer) return
    this.demoRun = { start: performance.now(), ms }
    this.wake()
  }

  private wake() {
    if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.tick)
  }

  /** Where the smudge is heading this frame, in element pixels. */
  private target(now: number): Pt | null {
    if (this.pointer) {
      const r = this.canvas.getBoundingClientRect()
      const p = { x: this.pointer.x - r.left, y: this.pointer.y - r.top }
      return p.x < 0 || p.y < 0 || p.x > r.width || p.y > r.height ? null : p
    }
    if (!this.demoRun) return null
    const k = (now - this.demoRun.start) / this.demoRun.ms
    if (k >= 1) {
      this.demoRun = null
      return null
    }
    return {
      x: (0.08 + k * 0.84) * this.w,
      y: (0.62 - k * 0.16 + Math.sin(k * Math.PI * 2.4) * 0.12) * this.h,
    }
  }

  private stamp(from: Pt, to: Pt) {
    const d = Math.hypot(to.x - from.x, to.y - from.y)
    if (d > 1) this.angle = Math.atan2(to.y - from.y, to.x - from.x)
    const size = Math.max(Math.min(this.w, this.h) * 0.56, 240)
    const n = Math.max(1, Math.ceil(d / 8))
    const x = this.mctx
    for (let i = 1; i <= n; i++) {
      x.save()
      x.translate(from.x + ((to.x - from.x) * i) / n, from.y + ((to.y - from.y) * i) / n)
      x.rotate(this.angle)
      x.drawImage(this.dab, -size / 2, -size / 2, size, size)
      x.restore()
    }
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min(now - this.prev, 64)
    this.prev = now
    const x = this.mctx

    // Close up behind the smudge first, so the spot under the cursor is always fully open.
    if (this.live) {
      if (now - this.lastStamp < CLEAR_AFTER_MS) {
        x.globalCompositeOperation = 'destination-out'
        x.globalAlpha = 1 - Math.exp(-dt / CLOSE_MS)
        x.fillStyle = '#000'
        x.fillRect(0, 0, this.w, this.h)
        x.globalAlpha = 1
        x.globalCompositeOperation = 'source-over'
      } else {
        // A fractional fade stalls at faint 8-bit values, so the tail is cleared outright.
        x.clearRect(0, 0, this.w, this.h)
        this.live = false
      }
    }

    const to = this.target(now)
    if (to) {
      const from = this.pos ?? to
      const k = 1 - Math.exp(-dt / FOLLOW_MS)
      const next = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }
      this.stamp(from, next)
      this.pos = next
      this.live = true
      this.lastStamp = now
    } else {
      this.pos = null
    }

    this.render()
    if (to || this.live || this.demoRun) this.wake()
  }

  private render() {
    const { ctx, w, h, before, after } = this
    if (!w || !h) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    // No smudge until both rooms are in, or it would float on an empty stage.
    if (!this.live || !before.complete || !before.naturalWidth || !after.complete || !after.naturalWidth) return
    drawCover(ctx, after, w, h)
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(this.mask, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
  }
}
