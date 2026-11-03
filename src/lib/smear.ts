// The brush behind every smear on the page: a dry, bristled stroke.
// Used to paint the intro band, to wipe the intro away, and as the
// mask that lights a photograph wherever the visitor drags across it.

export type Pt = { x: number; y: number }

/** Small seeded generator so a stroke looks the same on every frame it is redrawn. */
export function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * One bristled segment from a to b. A solid core keeps the mask continuous;
 * the loose bristles at the edges give the dry-brush texture.
 */
export function bristle(
  ctx: CanvasRenderingContext2D,
  a: Pt,
  b: Pt,
  width: number,
  rand: () => number = Math.random,
  alpha = 1,
  core = 0.62,
  dry = 0,
) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len

  ctx.lineCap = 'round'
  if (core > 0) {
    ctx.globalAlpha = alpha * 0.9
    ctx.lineWidth = width * core
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  const hairs = Math.max(8, Math.round(width / 2.5))
  for (let i = 0; i < hairs; i++) {
    if (dry > 0 && rand() < dry * (0.4 + Math.abs(i / (hairs - 1) - 0.5) * 1.2)) continue
    const off = (i / (hairs - 1) - 0.5) * width + (rand() - 0.5) * 3
    const edge = Math.abs(off) / (width / 2)
    ctx.globalAlpha = alpha * (0.25 + rand() * 0.75) * (1 - edge * 0.55)
    ctx.lineWidth = 0.8 + rand() * (width / hairs) * 2
    ctx.beginPath()
    ctx.moveTo(a.x + nx * off, a.y + ny * off)
    ctx.lineTo(b.x + nx * off, b.y + ny * off)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/**
 * Draws an image into a box the way `object-fit: cover` would, optionally zoomed
 * in further and anchored at (fx, fy), like `transform: scale()` with that origin.
 */
export function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, zoom = 1, fx = 0.5, fy = 0.5) {
  const ir = img.naturalWidth / img.naturalHeight
  const br = w / h
  let sw = img.naturalWidth
  let sh = img.naturalHeight
  if (ir > br) sw = sh * br
  else sh = sw / br
  const cx = (img.naturalWidth - sw) / 2
  const cy = (img.naturalHeight - sh) / 2
  const zw = sw / zoom
  const zh = sh / zoom
  ctx.drawImage(img, cx + (sw - zw) * fx, cy + (sh - zh) * fy, zw, zh, 0, 0, w, h)
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

type LitOptions = {
  /** Fraction of the mask removed per frame; 0 keeps the smear for good. */
  heal: number
  /** Brush width as a fraction of the shorter side. */
  brush: number
  onStroke?: (distance: number) => void
}

/**
 * Lights a dimmed photograph along the visitor's stroke.
 * The <img> underneath stays in the page (dimmed by CSS); the canvas on top
 * redraws the same picture at full light, cut to the shape of the smear.
 */
export class LitSmear {
  private ctx: CanvasRenderingContext2D
  private mask = document.createElement('canvas')
  private mctx: CanvasRenderingContext2D
  private last: Pt | null = null
  private raf = 0
  private idleFrames = 0
  private w = 0
  private h = 0
  private dpr = 1
  private ro: ResizeObserver
  private rand = seeded(7)
  private opts: LitOptions
  private canvas: HTMLCanvasElement
  private img: HTMLImageElement

  constructor(canvas: HTMLCanvasElement, img: HTMLImageElement, opts: LitOptions) {
    this.canvas = canvas
    this.img = img
    this.opts = opts
    this.ctx = canvas.getContext('2d')!
    this.mctx = this.mask.getContext('2d')!
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = r.width
    this.h = r.height
    const keep = document.createElement('canvas')
    keep.width = this.mask.width
    keep.height = this.mask.height
    if (keep.width && keep.height) keep.getContext('2d')!.drawImage(this.mask, 0, 0)
    for (const c of [this.canvas, this.mask]) {
      c.width = Math.round(r.width * this.dpr)
      c.height = Math.round(r.height * this.dpr)
    }
    if (keep.width && keep.height) this.mctx.drawImage(keep, 0, 0, this.mask.width, this.mask.height)
    this.mctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.render()
  }

  /** Paint from the previous point (or start a new stroke) to p, in element pixels. */
  stroke(p: Pt, fresh = false) {
    const from = fresh || !this.last ? p : this.last
    const width = Math.min(this.w, this.h) * this.opts.brush
    this.mctx.globalCompositeOperation = 'source-over'
    this.mctx.strokeStyle = '#fff'
    bristle(this.mctx, from, p, width, this.rand)
    const d = Math.hypot(p.x - from.x, p.y - from.y)
    this.opts.onStroke?.(d)
    this.last = p
    this.wake()
  }

  lift() {
    this.last = null
  }

  /** Light the whole picture at once (keyboard, reduced motion, a tap). */
  fill() {
    this.mctx.globalCompositeOperation = 'source-over'
    this.mctx.globalAlpha = 1
    this.mctx.fillStyle = '#fff'
    this.mctx.fillRect(0, 0, this.w, this.h)
    this.wake()
  }

  clear() {
    this.mctx.clearRect(0, 0, this.w, this.h)
    this.wake()
  }

  private wake() {
    this.idleFrames = 0
    if (!this.raf) this.raf = requestAnimationFrame(this.tick)
  }

  private tick = () => {
    this.raf = 0
    if (this.opts.heal > 0) {
      this.mctx.globalCompositeOperation = 'destination-out'
      this.mctx.globalAlpha = this.opts.heal
      this.mctx.fillStyle = '#000'
      this.mctx.fillRect(0, 0, this.w, this.h)
      this.mctx.globalAlpha = 1
      this.mctx.globalCompositeOperation = 'source-over'
    }
    this.render()
    // Healing needs about two seconds to fade a stroke out completely.
    if (this.opts.heal > 0 && ++this.idleFrames < 160) this.raf = requestAnimationFrame(this.tick)
  }

  private render() {
    const { ctx, w, h } = this
    if (!w || !h || !this.img.complete || !this.img.naturalWidth) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    drawCover(ctx, this.img, w, h)
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(this.mask, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
  }
}
