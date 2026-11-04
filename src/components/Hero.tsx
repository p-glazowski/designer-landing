import { useCallback, useEffect, useRef, useState } from 'react'
import { HeroSmear } from '../lib/heroSmear'
import { prefersReducedMotion } from '../lib/smear'
import { brand } from '../content'

const rooms = [
  {
    href: '#komercyjne',
    name: 'Wnętrza komercyjne',
    line: 'Hotele, biura, restauracje',
    photos: [
      { src: 'hero-commercial', alt: 'Lobby z trawertynowymi ścianami, sufitem z drewnianych lameli i recepcją z ciemnego marmuru' },
      { src: 'work-bar', alt: 'Bar wieczorem, ciemne stoły i rząd lamp z kloszami' },
      { src: 'work-restaurant', alt: 'Restauracja z plecioną lampą nad okrągłym stołem i ryflowaną ścianą', focus: '50% 25%' },
      { src: 'work-reception', alt: 'Recepcja z czarnego marmuru ze złotą listwą i kulistą lampą', focus: '50% 45%' },
      { src: 'work-boutique', alt: 'Wejście do butiku z aksamitną zasłoną i ciepłym światłem kinkietów', focus: '50% 40%' },
    ],
  },
  {
    href: '#prywatne',
    name: 'Wnętrza prywatne',
    line: 'Domy, apartamenty, łazienki',
    photos: [
      { src: 'hero-private', alt: 'Łazienka z czarnym marmurem, orzechową zabudową i okrągłym podświetlanym lustrem' },
      { src: 'work-kitchen', alt: 'Grafitowa kuchnia z czarnym kamieniem na blacie i ścianie', focus: '50% 55%' },
      { src: 'work-bedroom', alt: 'Sypialnia w półmroku oświetlona dwiema wiszącymi lampami', focus: '50% 20%' },
    ],
  },
]

/** How often the chosen interior moves on to its next photo, in ms. */
const CYCLE = 4000

/**
 * The room fills the screen, bright and whole, and rose paint is smeared across it:
 * the cursor drags a long smooth smudge, and others sweep through on their own.
 * The chosen interior moves through its photos every few seconds.
 */
export function Hero({ introDelay }: { introDelay: number }) {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(0)
  // Each change adds a layer that fades in over whatever is showing, however mid-fade that is;
  // the layers beneath go once it has finished, so a switch can't dip to dark or jump.
  const [layers, setLayers] = useState([{ id: 0, room: 0, photo: 0 }])
  const nextId = useRef(1)
  const shown = useRef<number[]>(rooms.map((_, i) => (i === 0 ? 0 : -1)))
  const ready = useRef(new Set<string>())
  const onScreen = useRef(true)

  /** Show the next photo of a room that has finished loading, so a fade never runs over a blank picture. */
  const advance = useCallback((room: number) => {
    const { photos } = rooms[room]
    const last = shown.current[room]
    let photo = -1
    for (let step = 1; step <= photos.length && photo < 0; step++) {
      const candidate = (last + step) % photos.length
      if (ready.current.has(photos[candidate].src)) photo = candidate
    }
    if (photo < 0) photo = Math.max(last, 0)
    shown.current[room] = photo
    const layer = { id: nextId.current++, room, photo }
    setLayers((ls) => (prefersReducedMotion() ? [layer] : [...ls, layer]))
  }, [])

  useEffect(() => {
    for (const room of rooms) {
      for (const { src } of room.photos) {
        const img = new Image()
        img.src = `/media/${src}.jpg`
        img.decode().then(
          () => ready.current.add(src),
          () => {},
        )
      }
    }
    const io = new IntersectionObserver(([e]) => {
      onScreen.current = e.isIntersecting
    })
    io.observe(rootRef.current!)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timer = window.setInterval(() => {
      // The first photo gets its full turn once the welcome has opened onto it.
      if (performance.now() < introDelay + CYCLE - 500) return
      if (onScreen.current && !document.hidden) advance(active)
    }, CYCLE)
    return () => window.clearInterval(timer)
  }, [active, advance, introDelay])

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

  const choose = (i: number) => {
    if (i === active) return
    setActive(i)
    advance(i)
  }

  return (
    <header className="hero" id="top" ref={rootRef}>
      <div className="hero-stage">
        {layers.map((l, i) => {
          const photo = rooms[l.room].photos[l.photo]
          return (
            <img
              key={l.id}
              className={l.id === 0 ? 'is-base' : ''}
              decoding="sync"
              src={`/media/${photo.src}.jpg`}
              alt={i === layers.length - 1 ? photo.alt : ''}
              style={{ objectPosition: photo.focus }}
              fetchPriority={l.id === 0 ? 'high' : 'auto'}
              onAnimationEnd={() => setLayers((ls) => ls.slice(ls.findIndex((x) => x.id === l.id)))}
            />
          )
        })}
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
