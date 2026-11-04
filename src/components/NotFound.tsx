import { Contact } from './Contact'

/** For an address with no page behind it, such as a project that has been renamed. */
export function NotFound() {
  return (
    <main>
      <section className="missing">
        <h1 tabIndex={-1}>Tu nie ma śladu.</h1>
        <p>Tej strony nie ma lub zmieniła adres.</p>
        <a className="button" href="/realizacje">
          Zobacz realizacje
        </a>
      </section>
      <Contact />
    </main>
  )
}
