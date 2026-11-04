import { brand, credits } from '../content'

/** A visit card laid on a photograph, then the page closes on one quiet line. */
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

      <footer className="footer">
        <p className="footer-what">{brand}, projektowanie wnętrz</p>
        <p className="footer-links">
          <a href="#realizacje">Realizacje</a>
          <a href="#proces">Proces</a>
          <a href="#przed-i-po">Przed i po</a>
          <a href="#kontakt">Kontakt</a>
        </p>
        <p className="footer-legal">© 2026 {brand}</p>
        <details className="footer-credits">
          <summary>Zdjęcia i filmy</summary>
          <p>
            Zdjęcia poglądowe: {credits.filter((c) => c[1] === 'Unsplash').map((c) => c[0]).join(', ')} (Unsplash). Filmy:{' '}
            {credits.filter((c) => c[1] === 'Pexels').map((c) => c[0]).join(', ')} (Pexels).
          </p>
        </details>
      </footer>
    </>
  )
}
