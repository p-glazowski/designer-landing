import { useEffect, useRef } from 'react'
import { brand, credits } from '../content'

/** Where a word's visible ink really sits, as shares of the font size: the blank before it and the drop below the baseline. */
function measureInk(word: string, style: CSSStyleDeclaration) {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return { before: 0, drop: 0 }
  ctx.font = `${style.fontWeight} 100px ${style.fontFamily}`
  const m = ctx.measureText(word)
  return { before: -m.actualBoundingBoxLeft / 100, drop: m.actualBoundingBoxDescent / 100 }
}

/**
 * The studio's name, sized to run the full width whatever the name is and however wide the screen.
 * At this size a font's built-in spacing shows, so the fit goes by the ink: the first letter's edge
 * meets the margin, and room below appears only for a name with a descender, like the g in Smuga.
 */
function FooterName() {
  const boxRef = useRef<HTMLParagraphElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const box = boxRef.current!
    const name = nameRef.current!
    const fit = () => {
      const style = getComputedStyle(box)
      const ink = measureInk(name.textContent ?? '', style)
      const widthInEm = name.getBoundingClientRect().width / parseFloat(style.fontSize)
      box.style.fontSize = `${box.clientWidth / (widthInEm - ink.before)}px`
      box.style.paddingBottom = `${ink.drop}em`
      name.style.marginLeft = `${-ink.before}em`
    }
    // Only a change of width calls for a new fit. The fit itself changes the box's height,
    // so reacting to every resize would keep nudging the type, frame after frame.
    let fittedWidth = -1
    const ro = new ResizeObserver(() => {
      if (box.clientWidth === fittedWidth) return
      fittedWidth = box.clientWidth
      fit()
    })
    ro.observe(box)
    // The first measure may be of the fallback font, which runs a different width.
    document.fonts.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  return (
    <p className="footer-name" ref={boxRef} data-part>
      <span ref={nameRef}>{brand}</span>
    </p>
  )
}

/** A visit card laid on a photograph, then the page closes on the studio's name, full width. */
export function Contact() {
  return (
    <>
      <section className="contact" id="kontakt" aria-labelledby="contact-title" tabIndex={-1}>
        <div className="contact-photo">
          <img data-zoom src="/media/contact.jpg" alt="Okrągły kinkiet rzucający ciepłe światło na ciemną, fakturowaną ścianę" width={2000} height={3000} loading="lazy" decoding="async" />
        </div>
        <div className="card" data-reveal>
          <h2 id="contact-title" data-part>
            Umów konsultację
          </h2>
          <p data-part>
            Projekty w całej Polsce
            <br />
            W pracowni lub u Ciebie, na miejscu
          </p>
          <dl data-part>
            <div>
              <dt>Poniedziałek–piątek</dt>
              <dd>9:00–17:00</dd>
            </div>
            <div>
              <dt>Sobota</dt>
              <dd>po umówieniu</dd>
            </div>
            <div>
              <dt>Niedziela</dt>
              <dd>nieczynne</dd>
            </div>
          </dl>
          <button type="button" className="button card-button" data-part>
            Napisz do nas
          </button>
        </div>
      </section>

      <footer className="footer" data-reveal>
        <div className="footer-details" data-part>
          <p>Projektowanie wnętrz</p>
          <p className="footer-links">
            <a href="#realizacje">Realizacje</a>
            <a href="#proces">Proces</a>
            <a href="#przed-i-po">Przed i po</a>
            <a href="#kontakt">Kontakt</a>
          </p>
          <p>© 2026 {brand}</p>
          <details className="footer-credits">
            <summary>Zdjęcia i filmy</summary>
            <p>
              Zdjęcia poglądowe: {credits.filter((c) => c[1] === 'Unsplash').map((c) => c[0]).join(', ')} (Unsplash). Filmy:{' '}
              {credits.filter((c) => c[1] === 'Pexels').map((c) => c[0]).join(', ')} (Pexels).
            </p>
          </details>
        </div>
        <FooterName />
      </footer>
    </>
  )
}
