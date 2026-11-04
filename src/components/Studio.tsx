import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brand } from '../content'
import { prefersReducedMotion } from '../lib/smear'

gsap.registerPlugin(ScrollTrigger)

const walls = ['w0', 'w1', 'w2', 'w3', 'w4']
const line = ['Od pierwszej rozmowy', 'po ostatnią lampę.']
const crafts = [
  { name: 'Kamieniarze', src: 'mat-marble', w: 700, h: 1050, alt: 'Czarny marmur z jasnym użyleniem i złotą listwą' },
  { name: 'Stolarze', src: 'mat-walnut', w: 700, h: 467, alt: 'Ciemne orzechowe lamele' },
  { name: 'Tapicerzy', src: 'mat-velvet', w: 700, h: 526, alt: 'Bordowa aksamitna zasłona w fałdach' },
]

/** About the studio: light through slits in a dark wall, opening onto stone as you scroll. */
export function Studio() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const open = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.studio-stage', start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
      // The wall arrives shut, cracks into slits, then gives way to the whole photograph.
      open.fromTo('.studio-wall', { scaleX: 1.6 }, { scaleX: 1, duration: 1 }, 0)
      open.to('.studio-wall', { scaleX: 0, duration: 1.1, ease: 'power1.inOut', stagger: { each: 0.1, from: 'center' } }, 1)
      open.fromTo('.studio-photo', { scale: 1.16 }, { scale: 1, duration: 3 }, 0)
      // Bright while it is only a crack of light, dimmed once the room is open.
      open.fromTo('.studio-scrim', { opacity: 0.12 }, { opacity: 0.45, duration: 1.1 }, 1)

      gsap.fromTo(
        '.studio-word',
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.2,
          scrollTrigger: { trigger: '.studio-line', start: 'top 85%', end: 'bottom 50%', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="studio" id="studio" aria-labelledby="studio-title" ref={root}>
      <div className="studio-stage">
        <div className="studio-room">
          <img className="studio-photo" src="/media/columns.jpg" alt="Kamienne kolumny i ostre smugi cienia między nimi" width={1000} height={750} loading="lazy" decoding="async" />
          <span className="studio-scrim" aria-hidden="true" />
          {walls.map((w) => (
            <span className={`studio-wall ${w}`} aria-hidden="true" key={w} />
          ))}
          <p className="studio-sub">
            <strong>{brand}</strong> projektuje wnętrza prywatne i komercyjne.
          </p>
          <h2 id="studio-title" className="studio-title">
            O studiu
          </h2>
        </div>
      </div>

      <div className="studio-body">
        <h3 className="studio-line">
          {line.map((l) => (
            <span className="studio-line-row" key={l}>
              {l.split(' ').map((word) => (
                <span className="studio-word" key={word}>
                  {word}{' '}
                </span>
              ))}
            </span>
          ))}
        </h3>

        <div className="studio-text" data-reveal>
          <p data-part>
            Projektujemy domy, apartamenty, restauracje, hotele, butiki i biura, zawsze z myślą o materiale, który pięknie się starzeje, i o świetle,
            które go wydobywa.
          </p>
          <p data-part>
            Pracujemy z kamieniarzami, stolarzami i tapicerami, których znamy z imienia, więc rysunek zamienia się we wnętrze bez kompromisów po drodze.
          </p>
        </div>

        <ul className="studio-crafts" data-reveal>
          {crafts.map((c) => (
            <li data-part key={c.name}>
              <figure>
                <div className="studio-strip">
                  <img data-zoom src={`/media/${c.src}.jpg`} alt={c.alt} width={c.w} height={c.h} loading="lazy" decoding="async" />
                </div>
                <figcaption>{c.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
