import { useEffect, useRef, useState } from 'react'
import { HeroSmear } from '../lib/heroSmear'
import { prefersReducedMotion } from '../lib/smear'
import { brand } from '../content'

const rooms = [
  {
    href: '#komercyjne',
    name: 'Wnętrza komercyjne',
    line: 'Hotele, biura, restauracje',
    src: 'hero-commercial',
    alt: 'Lobby z trawertynowymi ścianami, sufitem z drewnianych lameli i recepcją z ciemnego marmuru',
  },
  {
    href: '#prywatne',
    name: 'Wnętrza prywatne',
    line: 'Domy, apartamenty, łazienki',
    src: 'hero-private',
    alt: 'Łazienka z czarnym marmurem, orzechową zabudową i okrągłym podświetlanym lustrem',
  },
]

/**
 * One enormous brushstroke is dragged across the dark, and the room shows only
 * inside it. Moving across the screen uncovers the room for a moment before it
 * sinks back into shadow.
 */
export function Hero({ introDelay }: { introDelay: number }) {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])
  const smear = useRef<HeroSmear | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = rootRef.current!
    const canvas = canvasRef.current!
    const reduced = prefersReducedMotion()
    const imgs = imgRefs.current.filter(Boolean) as HTMLImageElement[]

    // A trail drawn for the visitor once the stroke is down, so the effect is seen before it is tried.
    const wisp = () => {
      const s = smear.current
      const r = canvas.getBoundingClientRect()
      if (!s || !r.width) return
      const t0 = performance.now()
      const ms = 2200
      let first = true
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / ms)
        const x = (0.06 + k * 0.5) * r.width
        const y = (0.6 - k * 0.3 + Math.sin(k * Math.PI * 2.2) * 0.07) * r.height
        s.reveal({ x, y }, first)
        first = false
        if (k < 1) requestAnimationFrame(step)
        else s.lift()
      }
      requestAnimationFrame(step)
    }

    const s = new HeroSmear(canvas, imgs, { onLaid: reduced ? undefined : wisp })
    smear.current = s

    let timer = 0
    const start = () => {
      if (reduced) s.lay(0)
      else timer = window.setTimeout(() => s.lay(1500), introDelay)
    }
    if (imgs.every((i) => i.complete)) start()
    else Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => i.addEventListener('load', r, { once: true }))))).then(start)

    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    // The reveal goes quiet around small clickable text, so it stays readable when it's wanted.
    let zones: DOMRect[] | null = null
    let quiet = false
    const measure = () => {
      const c = canvas.getBoundingClientRect()
      zones = [...root.querySelectorAll('.nav, .hero-rooms')].map((el) => {
        const r = el.getBoundingClientRect()
        return new DOMRect(r.left - c.left, r.top - c.top, r.width, r.height)
      })
      return zones
    }
    const strengthAt = (p: { x: number; y: number }) => {
      const nearest = Math.min(
        ...(zones ?? measure()).map((z) => Math.hypot(Math.max(z.left - p.x, 0, p.x - z.right), Math.max(z.top - p.y, 0, p.y - z.bottom))),
      )
      const t = Math.min(Math.max((nearest - 24) / (160 - 24), 0), 1)
      return t * t * (3 - 2 * t)
    }
    const paint = (e: PointerEvent, fresh: boolean) => {
      const p = at(e)
      const strength = strengthAt(p)
      if (strength <= 0 && !quiet) s.hush()
      quiet = strength <= 0
      s.reveal(p, fresh, strength)
    }
    const enter = (e: PointerEvent) => {
      measure()
      paint(e, true)
    }
    const move = (e: PointerEvent) => paint(e, false)
    const leave = () => s.lift()
    const remeasure = () => {
      zones = null
    }
    if (!reduced) {
      root.addEventListener('pointerenter', enter)
      root.addEventListener('pointermove', move)
      root.addEventListener('pointerleave', leave)
      window.addEventListener('resize', remeasure)
    }
    return () => {
      window.clearTimeout(timer)
      s.destroy()
      window.removeEventListener('resize', remeasure)
      root.removeEventListener('pointerenter', enter)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
    }
  }, [introDelay])

  const choose = (i: number) => {
    setActive(i)
    smear.current?.show(i)
  }

  return (
    <header className="hero" id="top" ref={rootRef}>
      <div className="hero-stage">
        {rooms.map((r, i) => (
          <img
            key={r.src}
            ref={(el) => {
              imgRefs.current[i] = el
            }}
            className={active === i ? 'is-active' : ''}
            src={`/media/${r.src}.jpg`}
            alt={active === i ? r.alt : ''}
            width={2400}
            height={1500}
            fetchPriority={i === 0 ? 'high' : 'auto'}
          />
        ))}
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>

      <nav className="nav" aria-label="Główna">
        <a className="wordmark" href="#top" aria-label={`${brand}, na początek strony`}>
          {brand}
        </a>
        <div className="nav-links">
          <a href="#realizacje">Realizacje</a>
          <a href="#proces">Proces</a>
          <a href="#przed-i-po">Przed i po</a>
          <a className="button" href="#kontakt">
            Umów konsultację
          </a>
        </div>
      </nav>

      <div className="hero-copy" data-reveal>
        <h1 data-part>
          Wnętrza, które
          <br />
          zostawiają ślad.
        </h1>
        <div className="hero-aside" data-part>
          <ul className="hero-rooms">
            {rooms.map((r, i) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  className={active === i ? 'is-active' : ''}
                  onPointerEnter={() => choose(i)}
                  onFocus={() => choose(i)}
                >
                  <span className="room-name">{r.name}</span>
                  <span className="room-line">{r.line}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
