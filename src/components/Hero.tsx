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
 * The room fills the screen, bright and whole, and black ink is smeared across it:
 * the cursor drags a long smooth smudge, and others sweep through on their own.
 */
export function Hero({ introDelay }: { introDelay: number }) {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    // With reduced motion the room simply stays still and clean.
    if (prefersReducedMotion()) return
    const root = rootRef.current!
    const canvas = canvasRef.current!
    const s = new HeroSmear(canvas)
    const timer = window.setTimeout(() => s.start(), introDelay)

    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const enter = (e: PointerEvent) => s.enter(at(e))
    const move = (e: PointerEvent) => s.move(at(e))
    const leave = () => s.leave()
    root.addEventListener('pointerenter', enter)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    return () => {
      window.clearTimeout(timer)
      s.destroy()
      root.removeEventListener('pointerenter', enter)
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
    }
  }, [introDelay])

  const choose = (i: number) => setActive(i)

  return (
    <header className="hero" id="top" ref={rootRef}>
      <div className="hero-stage">
        {rooms.map((r, i) => (
          <img
            key={r.src}
            // Every room up to the chosen one stays opaque, so only the rooms above it ever fade.
            className={i <= active ? 'is-shown' : ''}
            decoding="sync"
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
