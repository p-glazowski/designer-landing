import type { Pt } from './smear'

// The hero's room is shown whole, and rose ribbons are smeared across it in the
// shape of the studio's mark: flat-cut ends and a long shallow S. The cursor drags
// one, and others sweep through on their own. Every ribbon is a line of points
// that each vanish a fixed time after they were laid, so it draws itself
// forward and then retracts from its tail, keeping its flat cut.

type Point = Pt & { born: number; width: number }

type Stroke = {
  points: Point[]
  /** How long each point stays on the canvas, in ms. */
  life: number
  /** False once nothing will add to the stroke any more. */
  open: boolean
  /** Present on a ribbon that draws itself. */
  auto?: { from: Pt; c1: Pt; c2: Pt; to: Pt; width: number; start: number; ms: number; u: number; step: number }
}

const SPACING = 9
const MAX_AUTO = 4
/** The ribbon's width at its middle, as a share of its width at the ends. */
const WAIST = 0.62

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b)
const between = (a: number, b: number) => a + Math.random() * (b - a)
const sign = () => (Math.random() < 0.5 ? -1 : 1)

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

  /** Begin the ribbons that sweep through on their own. */
  start() {
    this.auto = true
    this.nextAuto = performance.now()
    this.wake()
  }

  /** The pointer came onto the hero at p (element pixels): a new ribbon starts there. */
  enter(p: Pt) {
    this.leave()
    this.target = p
    this.brush = { ...p }
    this.brushWidth = this.baseWidth
    this.current = { points: [], life: 1800, open: true }
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

  /**
   * The mark's S: it leaves and arrives vertically, so its two flat cuts are level
   * with each other, and runs as a long shallow line between them.
   */
  private spawnAuto(now: number) {
    const length = Math.max(this.w, this.h) * between(0.5, 0.95)
    const tilt = this.h > this.w ? between(0.7, 1.13) : between(0.21, 0.66)
    const up = sign()
    const dir = { x: Math.cos(tilt) * sign(), y: Math.sin(tilt) * up }
    const mid = { x: this.w * between(0.25, 0.75), y: this.h * between(0.2, 0.8) }
    const handle = length * between(0.22, 0.38) * up
    const from = { x: mid.x - (dir.x * length) / 2, y: mid.y - (dir.y * length) / 2 }
    const to = { x: mid.x + (dir.x * length) / 2, y: mid.y + (dir.y * length) / 2 }
    const ms = between(900, 1400)
    this.strokes.push({
      points: [],
      // Outlasting the draw by a little, so the whole shape is on screen for a moment.
      life: ms + between(200, 500),
      open: true,
      auto: {
        from,
        c1: { x: from.x, y: from.y + handle },
        c2: { x: to.x, y: to.y - handle },
        to,
        width: Math.min(this.w, this.h) * between(0.04, 0.085),
        start: now,
        ms,
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
      const fromMiddle = 2 * a.u - 1
      s.points.push({ ...bezier(a, a.u), born: now, width: a.width * (WAIST + (1 - WAIST) * fromMiddle * fromMiddle) })
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
    // Coming to rest lays one last point right at the brush, so the ribbon ends there and can age away.
    const resting = Math.hypot(this.target.x - this.brush.x, this.target.y - this.brush.y) < 0.5
    if (gap >= SPACING || (resting && gap > 0.5)) {
      s.points.push({ ...this.brush, born: now, width: this.brushWidth })
    }
  }

  /** The stroke's points as drawn right now: the tail eased along to where it has retracted, the head up to the brush. */
  private livePoints(s: Stroke, now: number) {
    const pts = [...s.points]
    const end = pts[pts.length - 1]
    // Every point has run its time: the ribbon has fully retracted, even if the cursor is still resting there.
    if (!end || now - end.born >= s.life) return []
    const first = pts[0]
    const next = pts[1]
    if (next && now - first.born >= s.life) {
      const f = clamp((now - first.born - s.life) / (next.born - first.born || 1))
      pts[0] = {
        x: first.x + (next.x - first.x) * f,
        y: first.y + (next.y - first.y) * f,
        born: first.born,
        width: first.width + (next.width - first.width) * f,
      }
    }
    if (s === this.current && Math.hypot(this.brush.x - end.x, this.brush.y - end.y) > 0.5) {
      pts.push({ ...this.brush, born: now, width: this.brushWidth })
    }
    return pts
  }

  /** One filled path per ribbon, cut square at both ends; a single fill leaves no seams between its pieces. */
  private trace(s: Stroke, now: number) {
    const pts = this.livePoints(s, now)
    if (pts.length < 2) return
    const x = this.lx
    let nx = 0
    let ny = 0
    let prev: { lx: number; ly: number; rx: number; ry: number } | null = null
    x.beginPath()
    for (let i = 0; i < pts.length; i++) {
      // Measured across a few points, so a cut doesn't wobble with the last small step.
      const a = pts[Math.max(0, i - 2)]
      const b = pts[Math.min(pts.length - 1, i + 2)]
      const len = Math.hypot(b.x - a.x, b.y - a.y)
      if (len > 0) {
        nx = -(b.y - a.y) / len
        ny = (b.x - a.x) / len
      }
      const half = pts[i].width / 2
      const edge = {
        lx: pts[i].x + nx * half,
        ly: pts[i].y + ny * half,
        rx: pts[i].x - nx * half,
        ry: pts[i].y - ny * half,
      }
      if (prev) {
        x.moveTo(prev.lx, prev.ly)
        x.lineTo(edge.lx, edge.ly)
        x.lineTo(edge.rx, edge.ry)
        x.lineTo(prev.rx, prev.ry)
        x.closePath()
      }
      prev = edge
    }
    x.fill()
  }

  private render(now: number) {
    const { ctx, w, h } = this
    if (!w || !h) return
    const x = this.lx
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    x.clearRect(0, 0, w, h)
    x.fillStyle = this.color
    for (const s of this.strokes) this.trace(s, now)
    // Drawn flat first, then laid on as one, so crossing ribbons don't darken each other.
    ctx.clearRect(0, 0, w, h)
    ctx.globalAlpha = 0.8
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
      this.nextAuto = now + between(2200, 3800)
    }
    for (const s of this.strokes) if (s.auto && s.open) this.advanceAuto(s, now)
    this.advanceBrush(dt, now)

    // One spent point is kept at the tail, for the cut to ease away from.
    for (const s of this.strokes) {
      let dead = 0
      while (dead < s.points.length && now - s.points[dead].born >= s.life) dead++
      if (dead > 1) s.points.splice(0, dead - 1)
    }
    this.strokes = this.strokes.filter((s) => s.open || s.points.length > 1)

    this.render(now)

    const brushMoving = this.target && Math.hypot(this.target.x - this.brush.x, this.target.y - this.brush.y) > 0.5
    if (this.auto || brushMoving || this.strokes.some((s) => s.points.length > 1)) this.wake()
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
