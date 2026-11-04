import { useEffect, useRef, useState } from 'react'
import { bristle, prefersReducedMotion, seeded } from '../lib/smear'

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

/**
 * Welcome, in the logo's colours: the studio's pink S-mark is drawn across the taupe and
 * the word "ślad" (a trace) is left in it; then the brush wipes the taupe away.
 */
export function Intro() {
  const [show, setShow] = useState(() => !prefersReducedMotion())
  const [leaving, setLeaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const finishRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!show) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const ground = css('--logo-taupe')
    const plaster = css('--logo-pink')
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, W, H)

    // The mark's proportions: it leaves and arrives vertically, so its flat cuts are level
    // with each other, and it is broad at the ends with a narrower waist.
    const run = Math.min(W * 0.72, H * 0.86)
    const rise = run * 0.7
    const endWidth = run * 0.36
    const waist = 0.7
    // Long enough that the ends' curves stay wider than the ribbon, which would otherwise fold over itself.
    const handle = rise * 0.52
    const from = { x: (W - run) / 2, y: (H + rise) / 2 }
    const to = { x: (W + run) / 2, y: (H - rise) / 2 }
    const c1 = { x: from.x, y: from.y - handle }
    const c2 = { x: to.x, y: to.y + handle }
    const fontSize = endWidth * waist * 0.6

    const pointAt = (u: number) => {
      const v = 1 - u
      const [a, b, c, d] = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u]
      return { x: a * from.x + b * c1.x + c * c2.x + d * to.x, y: a * from.y + b * c1.y + c * c2.y + d * to.y }
    }
    const directionAt = (u: number) => {
      const v = 1 - u
      const [a, b, c] = [3 * v * v, 6 * v * u, 3 * u * u]
      const x = a * (c1.x - from.x) + b * (c2.x - c1.x) + c * (to.x - c2.x)
      const y = a * (c1.y - from.y) + b * (c2.y - c1.y) + c * (to.y - c2.y)
      const len = Math.hypot(x, y) || 1
      return { x: x / len, y: y / len }
    }
    /** Fill the mark from its start up to `reach` (0–1), cut flat at the leading edge. */
    const fillMark = (reach: number) => {
      const steps = Math.max(2, Math.ceil(reach * 160))
      const left: { x: number; y: number }[] = []
      const right: { x: number; y: number }[] = []
      for (let i = 0; i <= steps; i++) {
        const u = (reach * i) / steps
        const p = pointAt(u)
        const dir = directionAt(u)
        const fromMiddle = 2 * u - 1
        const half = (endWidth * (waist + (1 - waist) * fromMiddle * fromMiddle)) / 2
        left.push({ x: p.x - dir.y * half, y: p.y + dir.x * half })
        right.push({ x: p.x + dir.y * half, y: p.y - dir.x * half })
      }
      ctx.beginPath()
      left.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
      right.reverse().forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.closePath()
      ctx.fill()
    }

    let raf = 0
    let start = 0
    let actOneDone = false
    const randWipe = seeded(23)
    const wipes = Array.from({ length: 6 }, (_, i) => ({
      y: (H / 5) * i - H * 0.05,
      tilt: (randWipe() - 0.5) * H * 0.18,
      delay: i * 0.09,
    }))
    const wipeDone = wipes.map(() => -W * 0.15)

    let done = false
    const finish = () => {
      if (done) return
      done = true
      cancelAnimationFrame(raf)
      setLeaving(true)
      window.setTimeout(() => setShow(false), 420)
    }
    finishRef.current = finish

    const frame = (now: number) => {
      if (!start) start = now
      const t = (now - start) / 1000

      // Act one: the mark is drawn from its lower end to its upper, with the word
      // along its waist, uncovered as the leading edge passes it.
      const p = ease(t / 1.4)
      if (!actOneDone) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = ground
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = plaster
        fillMark(p)
        const mid = pointAt(0.5)
        const slope = directionAt(0.5)
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, p >= 1 ? W : Math.max(0, pointAt(p).x), H)
        ctx.clip()
        ctx.translate(mid.x, mid.y)
        ctx.rotate(Math.atan2(slope.y, slope.x))
        ctx.fillStyle = ground
        ctx.font = `500 ${fontSize}px Switzer, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('ślad', 0, fontSize * 0.04)
        ctx.restore()
        if (p >= 1) actOneDone = true
      }

      // Act two: after a moment to read the word, broad strokes wipe the dark away to open the page.
      const w = t - 2
      if (w > 0) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = '#000'
        wipes.forEach((s, i) => {
          const q = ease((w - s.delay) / 0.85)
          const to = -W * 0.15 + q * W * 1.3
          if (to <= wipeDone[i]) return
          const from = wipeDone[i]
          const yAt = (x: number) => s.y + (x / W) * s.tilt + H * 0.1
          bristle(ctx, { x: from, y: yAt(from) }, { x: to, y: yAt(to) }, H * 0.3, randWipe)
          wipeDone[i] = to
        })
        ctx.globalCompositeOperation = 'source-over'
      }

      if (t > 3.3) finish()
      else raf = requestAnimationFrame(frame)
    }

    let cancelled = false
    const begin = () => {
      if (!cancelled) raf = requestAnimationFrame(frame)
    }
    // Wait for the face so the word is set in Switzer, but never for long.
    Promise.race([document.fonts.load(`500 ${fontSize}px Switzer`), new Promise((r) => setTimeout(r, 700))]).then(begin)

    const skip = () => finish()
    window.addEventListener('wheel', skip, { passive: true, once: true })
    window.addEventListener('touchstart', skip, { passive: true, once: true })
    window.addEventListener('keydown', skip, { once: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [show])

  if (!show) return null
  return (
    <div className={`intro${leaving ? ' is-leaving' : ''}`} aria-hidden="true" onClick={() => finishRef.current()}>
      <canvas ref={canvasRef} />
    </div>
  )
}
