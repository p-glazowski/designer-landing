import type { Pt } from './smear'

// The hero's room is shown whole, and rose paint is smeared across it: the cursor
// drags a long smooth smudge, and others sweep through on their own. Every smudge
// is the same thing, a line of points that each thin away a fixed time after they
// were laid, so a stroke draws itself forward and retracts from its tail.

type Point = Pt & { born: number; width: number }

type Stroke = {
  points: Point[]
  /** How long each point stays on the canvas, in ms. */
  life: number
  /** Distance travelled so far, for swelling in from a fine start. */
  travelled: number
  /** False once nothing will add to the stroke any more. */
  open: boolean
  /** Present on a smudge that draws itself. */
  auto?: { from: Pt; c1: Pt; c2: Pt; to: Pt; width: number; start: number; ms: number; u: number; step: number }
}

const SPACING = 9
const MAX_AUTO = 4

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b)
const smooth = (t: number) => t * t * (3 - 2 * t)
const between = (a: number, b: number) => a + Math.random() * (b - a)

function bezier(s: NonNullable<Stroke['auto']>, u: number): Pt {
  const v = 1 - u
  const [a, b, c, d] = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u]
  return {
    x: a * s.from.x + b * s.c1.x + c * s.c2.x + d * s.to.x,
    y: a * s.from.y + b * s.c1.y + c * s.c2.y + d * s.to.y,
  }
}

export class HeroSmear {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private color: string
  private layer = document.createElement('canvas')
  private lx = this.layer.getContext('2d')!
  private w = 0
  private h = 0
  private dpr = 1
  private raf = 0
  private ro: ResizeObserver
  private io: IntersectionObserver
  private visible = true
  private strokes: Stroke[] = []
  private auto = false
  private nextAuto = 0
  private lastTick = 0
  // The brush follows the pointer with a little lag, which is what irons out the hand's jitter.
  private target: Pt | null = null
  private brush: Pt = { x: 0, y: 0 }
  private brushWidth = 0
  private current: Stroke | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.color = getComputedStyle(canvas).getPropertyValue('--accent').trim()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) {
        this.nextAuto = performance.now() + 300
        this.wake()
      }
    })
    this.io.observe(canvas)
    this.resize()
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.w = r.width
    this.h = r.height
    for (const [c, x] of [
      [this.canvas, this.ctx],
      [this.layer, this.lx],
    ] as const) {
      c.width = Math.round(this.w * this.dpr)
      c.height = Math.round(this.h * this.dpr)
      x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    }
    this.wake()
  }

  private get baseWidth() {
    return Math.min(this.w, this.h) * 0.055
  }

  /** Begin the smudges that sweep through on their own. */
  start() {
    this.auto = true
    this.nextAuto = performance.now()
    this.wake()
  }

  /** The pointer came onto the hero at p (element pixels): a new smudge starts there. */
  enter(p: Pt) {
    this.leave()
    this.target = p
    this.brush = { ...p }
    this.brushWidth = this.baseWidth
    this.current = { points: [], life: 1800, travelled: 0, open: true }
    this.strokes.push(this.current)
    this.wake()
  }

  move(p: Pt) {
    if (!this.target) {
      this.enter(p)
      return
    }
    this.target = p
    this.wake()
  }

  leave() {
    if (this.current) this.current.open = false
    this.current = null
    this.target = null
  }

  /** A long curve across the room, mostly along the screen's longer side so it reads as a sweep of the arm. */
  private spawnAuto(now: number) {
    const long = Math.max(this.w, this.h)
    const length = long * between(0.75, 1.25)
    const axis = this.h > this.w ? Math.PI / 2 : 0
    const spread = Math.random() < 0.75 ? 0.65 : Math.PI / 2
    const angle = axis + between(-spread, spread) + (Math.random() < 0.5 ? Math.PI : 0)
    const dir = { x: Math.cos(angle), y: Math.sin(angle) }
    const side = { x: -dir.y, y: dir.x }
    const mid = { x: this.w * between(0.15, 0.85), y: this.h * between(0.12, 0.88) }
    const at = (along: number, off: number) => ({
      x: mid.x + dir.x * along * length + side.x * off * length,
      y: mid.y + dir.y * along * length + side.y * off * length,
    })
    // Bends both handles one way for an arc, or opposite ways for a lazy S.
    const bend = between(0.12, 0.3) * (Math.random() < 0.5 ? -1 : 1)
    const c2Bend = Math.random() < 0.6 ? bend : -bend
    this.strokes.push({
      points: [],
      life: between(1200, 1900),
      travelled: 0,
      open: true,
      auto: {
        from: at(-0.5, 0),
        c1: at(-0.17, bend),
        c2: at(0.17, c2Bend),
        to: at(0.5, 0),
        width: Math.min(this.w, this.h) * between(0.03, 0.08),
        start: now,
        ms: between(1300, 2200),
        u: 0,
        step: SPACING / length,
      },
    })
  }

  private advanceAuto(s: Stroke, now: number) {
    const a = s.auto!
    const t = clamp((now - a.start) / a.ms)
    const head = 0.5 - Math.cos(t * Math.PI) / 2
    while (a.u < head) {
      a.u = Math.min(head, a.u + a.step)
      // Pressure of a hand: touching down, leaning in, lifting off.
      const pressure = Math.pow(Math.sin(a.u * Math.PI), 0.55) * (0.88 + 0.12 * Math.sin(a.u * 7 + a.width))
      s.points.push({ ...bezier(a, a.u), born: now, width: a.width * pressure })
    }
    if (t >= 1) s.open = false
  }

  private advanceBrush(dt: number, now: number) {
    const s = this.current
    if (!s || !this.target) return
    const k = 1 - Math.exp(-dt / 75)
    const px = this.brush.x
    const py = this.brush.y
    this.brush.x += (this.target.x - px) * k
    this.brush.y += (this.target.y - py) * k
    const speed = Math.hypot(this.brush.x - px, this.brush.y - py) / Math.max(dt, 1)
    // A fast arm presses lighter, so quick sweeps come out long and lean.
    const goal = this.baseWidth * (1.15 - 0.55 * clamp(speed / 2.4))
    this.brushWidth += (goal - this.brushWidth) * (1 - Math.exp(-dt / 180))

    const last = s.points[s.points.length - 1]
    const gap = last ? Math.hypot(this.brush.x - last.x, this.brush.y - last.y) : Infinity
    if (gap >= SPACING) {
      s.travelled += last ? gap : 0
      const swell = 0.2 + 0.8 * smooth(clamp(s.travelled / (this.baseWidth * 3)))
      s.points.push({ ...this.brush, born: now, width: this.brushWidth * swell })
    }
  }

  private draw(now: number, scale: number) {
    const x = this.lx
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    x.clearRect(0, 0, this.w, this.h)
    x.strokeStyle = this.color
    x.lineCap = 'round'
    x.lineJoin = 'round'
    for (const s of this.strokes) {
      const pts = s.points
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i]
        const n = pts[i + 1]
        const prev = pts[i - 1] ?? p
        // Stays full for a while, then thins all the way out, so the tail comes to a long point.
        const fade = 1 - smooth(clamp(((now - p.born) / s.life - 0.3) / 0.7))
        const width = p.width * fade * scale
        if (width < 0.4) continue
        x.lineWidth = width
        x.beginPath()
        x.moveTo((prev.x + p.x) / 2, (prev.y + p.y) / 2)
        x.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2)
        x.stroke()
      }
    }
  }

  private render(now: number) {
    const { ctx, w, h } = this
    if (!w || !h) return
    ctx.clearRect(0, 0, w, h)
    // Paint at full width first and thin, then a denser heart: the room stays visible through the smudge.
    this.draw(now, 1)
    ctx.globalAlpha = 0.4
    ctx.drawImage(this.layer, 0, 0, w, h)
    this.draw(now, 0.7)
    ctx.globalAlpha = 0.75
    ctx.drawImage(this.layer, 0, 0, w, h)
    ctx.globalAlpha = 1
  }

  private wake() {
    if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.tick)
  }

  private tick = (now: number) => {
    this.raf = 0
    const dt = Math.min(now - (this.lastTick || now), 100)
    this.lastTick = now

    if (this.auto && now >= this.nextAuto) {
      if (this.strokes.filter((s) => s.auto).length < MAX_AUTO) this.spawnAuto(now)
      this.nextAuto = now + between(800, 1700)
    }
    for (const s of this.strokes) if (s.auto && s.open) this.advanceAuto(s, now)
    this.advanceBrush(dt, now)

    for (const s of this.strokes) {
      let dead = 0
      while (dead < s.points.length && now - s.points[dead].born >= s.life) dead++
      if (dead) s.points.splice(0, dead)
    }
    this.strokes = this.strokes.filter((s) => s.open || s.points.length)

    this.render(now)

    const brushMoving = this.target && Math.hypot(this.target.x - this.brush.x, this.target.y - this.brush.y) > 0.5
    if (this.auto || brushMoving || this.strokes.some((s) => s.points.length)) this.wake()
    else this.lastTick = 0
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.visible = false
    this.ro.disconnect()
    this.io.disconnect()
  }
}
