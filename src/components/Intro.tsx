import { useEffect, useRef, useState } from 'react'
import { bristle, prefersReducedMotion, seeded } from '../lib/smear'

const KEY = 'intro-seen'

function alreadySeen() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* private mode: the intro simply plays again */
  }
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

/**
 * Welcome: one stroke of wet plaster is dragged across the dark room and the
 * word "ślad" (a trace) is left in it; then the brush wipes the darkness away.
 */
export function Intro() {
  const [show, setShow] = useState(() => !prefersReducedMotion() && !alreadySeen())
  const [leaving, setLeaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const finishRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!show) return
    markSeen()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const ground = css('--bg')
    const plaster = css('--field-1')
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, W, H)

    const band = Math.min(H * 0.26, W * 0.34, 240)
    const cy = H * 0.5
    const x0 = W * 0.08
    const x1 = W * 0.92
    const fontSize = band * 0.62

    let raf = 0
    let start = 0
    let paintedTo = x0
    let actOneDone = false
    const bandCanvas = document.createElement('canvas')
    bandCanvas.width = canvas.width
    bandCanvas.height = canvas.height
    const bctx = bandCanvas.getContext('2d')!
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const randBand = seeded(11)
    const randWipe = seeded(23)
    const wipes = Array.from({ length: 6 }, (_, i) => ({
      y: (H / 5) * i - H * 0.05,
      tilt: (randWipe() - 0.5) * H * 0.18,
      delay: i * 0.07,
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

      // Act one: the stroke is laid down, left to right, with the word inside it.
      // The stroke builds up on its own layer so the word is never painted over.
      const p = ease(t / 0.85)
      const target = x0 + (x1 - x0) * p
      if (!actOneDone) {
        if (target > paintedTo + 0.5) {
          const wobble = (x: number) => cy + Math.sin((x / W) * Math.PI * 1.3 + 0.4) * band * 0.12 - (x / W) * band * 0.1
          bctx.strokeStyle = plaster
          const steps = Math.ceil((target - paintedTo) / 5)
          for (let i = 0; i < steps; i++) {
            const a = paintedTo + ((target - paintedTo) * i) / steps
            const b = paintedTo + ((target - paintedTo) * (i + 1)) / steps
            const u = (b - x0) / (x1 - x0)
            // Loaded at the start, running dry towards the end.
            const width = band * (u < 0.05 ? 0.55 + (u / 0.05) * 0.45 : 1 - 0.22 * u)
            const pa = { x: a, y: wobble(a) }
            const pb = { x: b, y: wobble(b) }
            bristle(bctx, pa, pb, width, randBand, 1 - 0.35 * u * u, 0, u * u * 0.75)
            bristle(bctx, pa, pb, width * 0.7, randBand, 0.85 - 0.5 * u, 0, u * 0.6)
          }
          paintedTo = target
        }
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = ground
        ctx.fillRect(0, 0, W, H)
        ctx.drawImage(bandCanvas, 0, 0, W, H)
        const reveal = p >= 1 ? W : target - band * 0.35
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, Math.max(0, reveal), H)
        ctx.clip()
        ctx.fillStyle = ground
        ctx.font = `500 ${fontSize}px Switzer, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('ślad', W / 2, cy + fontSize * 0.04)
        ctx.restore()
        if (p >= 1) actOneDone = true
      }

      // Act two: broad strokes wipe the dark away to open the page.
      const w = t - 1.05
      if (w > 0) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.strokeStyle = '#000'
        wipes.forEach((s, i) => {
          const q = ease((w - s.delay) / 0.6)
          const to = -W * 0.15 + q * W * 1.3
          if (to <= wipeDone[i]) return
          const from = wipeDone[i]
          const yAt = (x: number) => s.y + (x / W) * s.tilt + H * 0.1
          bristle(ctx, { x: from, y: yAt(from) }, { x: to, y: yAt(to) }, H * 0.3, randWipe)
          wipeDone[i] = to
        })
        ctx.globalCompositeOperation = 'source-over'
      }

      if (t > 1.95) finish()
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
