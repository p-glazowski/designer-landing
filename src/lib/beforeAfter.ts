import { drawCover, seeded, type Pt } from './smear'

// The finished room lies under the bare one. Smudges wander across it by themselves,
// and the cursor drags its own, trailing slightly behind. Each shows the finished room
// only inside, and closes up again behind it.

const FOLLOW_MS = 70
const CLOSE_MS = 700
const CLEAR_AFTER_MS = 2500
/** Fading in larger, rarer steps keeps the faint values it stalls at as low as possible. */
const FADE_EVERY_MS = 50
/** How long a mask layer takes new dabs before the older one, faded out by then, is wiped and takes over. */
const SWAP_EVERY_MS = 3000
const MAX_STROKES = 4

/** A smudge dragged by itself, in 0–1 coordinates of the picture. */
type Stroke = { start: number; ms: number; from: Pt; to: Pt; bend: number; scale: number; last: Pt | null; angle: number }

function layer() {
  const c = document.createElement('canvas')
  return { c, x: c.getContext('2d')! }
}

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
  // A fade can never quite reach zero, and with smudges painting constantly the mask would
  // never get the moment to be cleared. So there are two layers, and the older is wiped in turn.
  private layers = [layer(), layer()]
  private union = layer()
  private active = 0
  private lastSwap = 0
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
  private ambient = false
  private strokes: Stroke[] = []
  private nextStroke = 0
  /** Places left to visit before any repeats, so the smudges keep to different parts of the room. */
  private cells: Pt[] = []
  private fadeOwed = 0
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
    for (const { c, x } of [{ c: this.canvas, x: this.ctx }, ...this.layers, this.union]) {
      c.width = Math.round(this.w * dpr)
      c.height = Math.round(this.h * dpr)
      x.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    this.live = false
  }

  /** Track the pointer, given in viewport pixels. */
  point(p: Pt) {
    this.pointer = p
    this.wake()
  }

  lift() {
    this.pointer = null
  }

  /** Start or stop the smudges that wander by themselves. */
  setAmbient(on: boolean) {
    this.ambient = on
    if (on) this.wake()
  }

  private nextCell(): Pt {
    if (!this.cells.length) {
      const [cols, rows] = this.w > this.h ? [3, 2] : [2, 3]
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) this.cells.push({ x: c / cols, y: r / rows })
      this.cells.sort(() => Math.random() - 0.5)
      this.cells.forEach((cell) => {
        cell.x += (0.2 + Math.random() * 0.6) / cols
        cell.y += (0.2 + Math.random() * 0.6) / rows
      })
    }
    return this.cells.pop()!
  }

  private spawn(now: number) {
    const mid = this.nextCell()
    const dir = Math.random() * Math.PI * 2
    const reach = (0.32 + Math.random() * 0.28) * Math.min(this.w, this.h)
    const dx = (Math.cos(dir) * reach) / this.w
    const dy = (Math.sin(dir) * reach) / this.h
    this.strokes.push({
      start: now,
      ms: 1000 + Math.random() * 600,
      from: { x: mid.x - dx, y: mid.y - dy },
      to: { x: mid.x + dx, y: mid.y + dy },
      bend: (Math.random() - 0.5) * 0.5,
      scale: 0.7 + Math.random() * 0.4,
      last: null,
      angle: dir,
    })
  }

  private wake() {
    if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.tick)
  }

  /** Where the smudge is heading this frame, in element pixels. */
  private target(): Pt | null {
    if (!this.pointer) return null
    const r = this.canvas.getBoundingClientRect()
    const p = { x: this.pointer.x - r.left, y: this.pointer.y - r.top }
    return p.x < 0 || p.y < 0 || p.x > r.width || p.y > r.height ? null : p
  }

  /** Move every wandering smudge along its arc, and let a new one in when it is due. */
  private drive(now: number) {
    if (this.ambient && now >= this.nextStroke && this.strokes.length < MAX_STROKES) {
      this.spawn(now)
      this.nextStroke = now + 500 + Math.random() * 500
    }
    this.strokes = this.strokes.filter((s) => {
      const k = Math.min((now - s.start) / s.ms, 1)
      const u = (1 - Math.cos(k * Math.PI)) / 2
      const dx = s.to.x - s.from.x
      const dy = s.to.y - s.from.y
      const arc = Math.sin(u * Math.PI) * s.bend
      const p = { x: (s.from.x + dx * u - dy * arc) * this.w, y: (s.from.y + dy * u + dx * arc) * this.h }
      const from = s.last ?? p
      if (Math.hypot(p.x - from.x, p.y - from.y) > 1) s.angle = Math.atan2(p.y - from.y, p.x - from.x)
      this.stamp(from, p, s.angle, s.scale)
      s.last = p
      this.live = true
      this.lastStamp = now
      return k < 1
    })
  }

  private stamp(from: Pt, to: Pt, angle: number, scale = 1) {
    const d = Math.hypot(to.x - from.x, to.y - from.y)
    const size = Math.max(Math.min(this.w, this.h) * 0.3, 150) * scale
    const n = Math.max(1, Math.ceil(d / 8))
    const x = this.layers[this.active].x
    for (let i = 1; i <= n; i++) {
      x.save()
      x.translate(from.x + ((to.x - from.x) * i) / n, from.y + ((to.y - from.y) * i) / n)
      x.rotate(angle)
      x.drawImage(this.dab, -size / 2, -size / 2, size, size)
      x.restore()
    }
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min(now - this.prev, 64)
    this.prev = now

    // Close up behind the smudge first, so the spot under the cursor is always fully open.
    if (this.live) {
      if (now - this.lastStamp < CLEAR_AFTER_MS) {
        this.fadeOwed += dt
        if (this.fadeOwed >= FADE_EVERY_MS) {
          for (const { x } of this.layers) {
            x.globalCompositeOperation = 'destination-out'
            x.globalAlpha = 1 - Math.exp(-this.fadeOwed / CLOSE_MS)
            x.fillStyle = '#000'
            x.fillRect(0, 0, this.w, this.h)
            x.globalAlpha = 1
            x.globalCompositeOperation = 'source-over'
          }
          this.fadeOwed = 0
        }
        if (now - this.lastSwap >= SWAP_EVERY_MS) {
          this.active = 1 - this.active
          this.layers[this.active].x.clearRect(0, 0, this.w, this.h)
          this.lastSwap = now
        }
      } else {
        for (const { x } of this.layers) x.clearRect(0, 0, this.w, this.h)
        this.live = false
      }
    }

    this.drive(now)
    const to = this.target()

    if (to) {
      const from = this.pos ?? to
      const k = 1 - Math.exp(-dt / FOLLOW_MS)
      const next = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }
      if (Math.hypot(next.x - from.x, next.y - from.y) > 1) this.angle = Math.atan2(next.y - from.y, next.x - from.x)
      this.stamp(from, next, this.angle)
      this.pos = next
      this.live = true
      this.lastStamp = now
    } else {
      this.pos = null
    }

    this.render()
    if (to || this.live || this.ambient || this.strokes.length) this.wake()
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
    const u = this.union
    u.x.setTransform(1, 0, 0, 1, 0, 0)
    u.x.clearRect(0, 0, u.c.width, u.c.height)
    for (const { c } of this.layers) u.x.drawImage(c, 0, 0)
    ctx.drawImage(u.c, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
  }
}
