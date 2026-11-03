import { useEffect, useRef } from 'react'
import { SmearPhoto, type SmearHandle } from './SmearPhoto'
import { prefersReducedMotion } from '../lib/smear'
import { brand } from '../content'

const doors = [
  {
    href: '#prywatne',
    name: 'Wnętrza prywatne',
    line: 'Domy, apartamenty, łazienki',
    src: 'door-private',
    w: 1000,
    h: 1500,
    alt: 'Łazienka wyłożona trawertynem, czarna armatura i podświetlana wnęka',
  },
  {
    href: '#komercyjne',
    name: 'Wnętrza komercyjne',
    line: 'Restauracje, hotele, butiki',
    src: 'door-commercial',
    w: 1000,
    h: 670,
    alt: 'Restauracja wieczorem, drewniane stoły i lampy z bursztynowymi kloszami',
  },
]

export function Hero({ introDelay }: { introDelay: number }) {
  const a = useRef<SmearHandle>(null)
  const b = useRef<SmearHandle>(null)

  // A first stroke drawn for the visitor, so the idea is seen before it is tried.
  useEffect(() => {
    if (prefersReducedMotion()) {
      a.current?.fill()
      b.current?.fill()
      return
    }
    const t = window.setTimeout(() => {
      a.current?.sweep([[0.1, 0.18], [0.85, 0.42], [0.2, 0.66], [0.9, 0.88]], 1300)
      window.setTimeout(() => b.current?.sweep([[0.88, 0.15], [0.12, 0.4], [0.85, 0.65], [0.15, 0.9]], 1300), 260)
    }, introDelay)
    return () => window.clearTimeout(t)
  }, [introDelay])

  return (
    <header className="hero" id="top">
      <nav className="nav" aria-label="Główna">
        <a className="wordmark" href="#top" aria-label={`${brand}, na początek strony`}>
          {brand}
        </a>
        <div className="nav-links">
          <a href="#realizacje">Realizacje</a>
          <a href="#proces">Proces</a>
          <a href="#materia">Materia</a>
          <a className="button" href="#kontakt">
            Umów konsultację
          </a>
        </div>
      </nav>

      <div className="hero-head" data-reveal>
        <h1 data-part>
          Wnętrza, które
          <br />
          zostawiają ślad.
        </h1>
        <p className="hero-sub" data-part>
          Studio projektowania wnętrz prywatnych i komercyjnych. Prowadzimy projekty od koncepcji po realizację.
        </p>
      </div>

      <div className="doors">
        {doors.map((d, i) => (
          <a className="door" href={d.href} key={d.href}>
            <SmearPhoto ref={i === 0 ? a : b} src={d.src} alt={d.alt} width={d.w} height={d.h} eager brush={0.42} />
            <span className="door-name">{d.name}</span>
            <span className="door-line">{d.line}</span>
          </a>
        ))}
      </div>
    </header>
  )
}
