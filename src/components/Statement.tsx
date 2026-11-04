import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/smear'

gsap.registerPlugin(ScrollTrigger)

// One inner list per line of the staircase; on a phone each piece takes its own step.
const lines = [['Ślad zostaje,'], ['gdy dłoń', 'przesuwa się'], ['po świeżym tynku,'], ['kamieniu', 'i tkaninie.'], ['Taki ślad', 'projektujemy.']]

/** What a trace means to the studio: a huge staircase of words, each drawn across the screen by the scroll like a hand across fresh plaster. */
export function Statement() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const write = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: '.statement-stage', start: 'top 55%', end: 'bottom bottom', scrub: true },
      })
      gsap.utils.toArray<HTMLElement>('.stair-ink').forEach((ink) => {
        // Longer pieces take longer to draw, as they would by hand.
        write.fromTo(ink, { clipPath: 'inset(-10% 100% -20% 0)' }, { clipPath: 'inset(-10% -2% -20% 0)', duration: ink.textContent!.length })
      })
      // A short hold at the end, so the finished staircase can be read before it leaves.
      write.to({}, { duration: 12 })
    }, root)
    return () => ctx.revert()
  }, [])

  let piece = 0

  return (
    <section className="statement" id="slad" aria-label="O śladzie" ref={root}>
      <div className="statement-stage">
        <div className="statement-room">
          <p className="statement-text">
            {lines.map((pieces, i) => (
              <span className="stair" style={{ ['--i' as string]: i }} key={pieces[0]}>
                {pieces.map((text) => (
                  <Fragment key={text}>
                    <span className="stair-piece" style={{ ['--p' as string]: piece++ }} data-ghost={text}>
                      <span className="stair-ink">{text}</span>
                    </span>{' '}
                  </Fragment>
                ))}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="statement-after">
        <figure className="statement-stair" data-reveal>
          <img data-part src="/media/stair.jpg" alt="Kręte schody w mroku, światło wpada przez wąskie szczeliny w ścianie" width={1000} height={667} loading="lazy" decoding="async" />
        </figure>
        <figure className="statement-columns" data-reveal>
          <img data-part src="/media/columns.jpg" alt="Kamienne kolumny i ostre smugi cienia między nimi" width={1000} height={750} loading="lazy" decoding="async" />
        </figure>
        <p className="statement-note" data-reveal>
          <span data-part>
            Projektujemy przez materię:
            <br />
            dotyk przed katalogiem.
          </span>
        </p>
      </div>
    </section>
  )
}
