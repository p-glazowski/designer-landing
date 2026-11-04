import { useEffect, useRef, useState } from 'react'
import { categories, projects, type Project } from '../data'
import { stopScroll } from '../lib/motion'
import { prefersReducedMotion } from '../lib/smear'
import { Contact } from './Contact'

/** The whole photo, large, stepped through from the keyboard or the buttons. Each one wipes in like the rest of the site's pictures. */
function Lightbox({ photos, at, onMove, onClose }: { photos: Project['gallery']; at: number; onMove: (to: number) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const photo = photos[at]
  const step = (by: number) => onMove((at + by + photos.length) % photos.length)

  useEffect(() => {
    dialog.current?.showModal()
    stopScroll(true)
    return () => stopScroll(false)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return
    img.current?.animate({ clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0)'] }, { duration: 650, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' })
  }, [at])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  }

  return (
    <dialog
      className="lightbox"
      ref={dialog}
      aria-label="Powiększone zdjęcie"
      onClose={onClose}
      onKeyDown={onKey}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialog.current?.close()
      }}
    >
      <figure>
        <img ref={img} src={photo.src} alt={photo.alt} width={photo.w} height={photo.h} />
        <figcaption>{photo.caption}</figcaption>
      </figure>
      <div className="lightbox-controls">
        <button type="button" onClick={() => step(-1)}>
          Poprzednie
        </button>
        <span aria-live="polite">
          {at + 1} z {photos.length}
        </span>
        <button type="button" onClick={() => step(1)}>
          Następne
        </button>
        <button type="button" className="lightbox-close" onClick={() => dialog.current?.close()}>
          Zamknij
        </button>
      </div>
    </dialog>
  )
}

/** One project: the room, the idea behind it, its photographs, how it was solved, what it is made of and what stays. */
export function ProjectPage({ project: p }: { project: Project }) {
  const [enlarged, setEnlarged] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const next = projects[(projects.indexOf(p) + 1) % projects.length]

  const facts = [
    ['Rodzaj', p.kind],
    ['Typ', categories[p.category]],
    ['Miejsce', p.city],
    ['Rok', String(p.year)],
    ['Metraż', p.area],
    ['Czas realizacji', p.duration],
  ]

  return (
    <main>
      <article>
        <header className="case-hero">
          <div className="case-hero-photo">
            <img data-zoom src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} style={{ objectPosition: p.cover.focus }} fetchPriority="high" decoding="async" />
          </div>
          <div className="case-hero-copy" data-reveal>
            <h1 tabIndex={-1} data-part>
              {p.name}
            </h1>
            <p className="case-hero-side" data-part>
              {p.kind}, {p.city}, {p.year}
              <br />
              <a className="stroke-link" href="/realizacje">
                Wszystkie realizacje
              </a>
            </p>
          </div>
        </header>

        <section className="case-idea" aria-labelledby="case-idea-title" data-reveal>
          <div className="case-idea-text">
            <h2 id="case-idea-title" className="case-label" data-part>
              Idea
            </h2>
            <p className="case-lead" data-part>
              {p.idea}
            </p>
          </div>
          <p className="case-story" data-part>
            {p.story}
          </p>
          <dl className="case-facts" data-part>
            {facts.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div className="case-facts-wide">
              <dt>Zakres</dt>
              <dd>{p.scope.join(', ')}</dd>
            </div>
          </dl>
        </section>

        <section className="case-gallery" aria-label="Zdjęcia projektu">
          {p.gallery.map((photo, i) => (
            <figure className={`case-photo is-${photo.size}`} key={`${photo.src}-${photo.caption}`}>
              <button
                type="button"
                data-wipe
                aria-label={`Powiększ: ${photo.caption}`}
                onClick={(e) => {
                  opener.current = e.currentTarget
                  setEnlarged(i)
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.w}
                  height={photo.h}
                  style={{
                    objectPosition: photo.focus,
                    transformOrigin: photo.focus,
                    transform: photo.zoom ? `scale(${photo.zoom})` : undefined,
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </section>

        <section className="case-notes" data-reveal>
          <div data-part>
            <h2 className="section-title">Wyzwanie</h2>
            <p>{p.challenge}</p>
          </div>
          <div data-part>
            <h2 className="section-title">Rozwiązanie</h2>
            <p>{p.solution}</p>
          </div>
        </section>

        <section className="case-materials" aria-labelledby="case-materials-title">
          <div className="case-materials-head" data-reveal>
            <h2 id="case-materials-title" className="section-title" data-part>
              Materiały
            </h2>
            <p data-part>Wybrane dotykiem, na jednym stole. Tak wygląda to wnętrze z bliska.</p>
          </div>
          <ul className="studio-crafts case-strips" data-reveal>
            {p.materials.map((m) => (
              <li data-part key={m.name}>
                <figure>
                  <div className="studio-strip">
                    <img src={m.src} alt={m.alt} width={m.w} height={m.h} style={{ height: m.crop }} loading="lazy" decoding="async" />
                  </div>
                  <figcaption>
                    <strong>{m.name}</strong>
                    <span>{m.note}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section className="case-trace" aria-labelledby="case-trace-title" data-reveal>
          <h2 id="case-trace-title" className="section-title" data-part>
            Co zostaje
          </h2>
          <p data-part>{p.trace}</p>
        </section>
      </article>

      <nav className="case-next" aria-label="Następna realizacja">
        <a href={`/realizacje/${next.slug}`} data-reveal>
          <span className="case-next-text" data-part>
            <span className="case-next-label">Następna realizacja</span>
            <span className="case-next-name">{next.name}</span>
            <span className="case-next-meta">
              {next.kind}, {next.city}, {next.year}
            </span>
          </span>
          <span className="case-next-photo" data-part>
            <img src={next.cover.src} alt="" width={next.cover.w} height={next.cover.h} style={{ objectPosition: next.cover.focus }} loading="lazy" decoding="async" />
          </span>
        </a>
      </nav>

      <Contact />

      {enlarged !== null && (
        <Lightbox
          photos={p.gallery}
          at={enlarged}
          onMove={setEnlarged}
          onClose={() => {
            setEnlarged(null)
            opener.current?.focus({ preventScroll: true })
          }}
        />
      )}
    </main>
  )
}
