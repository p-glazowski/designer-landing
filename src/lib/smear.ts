// The brush behind the intro: a dry, bristled stroke that paints the band
// and wipes it away, plus the helpers the page's other smudges share.

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
