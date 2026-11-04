import { useEffect, useState } from 'react'
import { categories, projects } from '../data'
import { refreshScroll } from '../lib/motion'
import { Contact } from './Contact'

const filters = [
  { id: 'wszystkie', label: 'Wszystkie', match: () => true },
  { id: 'prywatne', label: categories.private, match: (p: (typeof projects)[number]) => p.category === 'private' },
  { id: 'komercyjne', label: categories.commercial, match: (p: (typeof projects)[number]) => p.category === 'commercial' },
]

/** The filter is kept in the address, so Back from a project returns to the same selection. */
function filterFromAddress() {
  const wanted = new URLSearchParams(location.search).get('typ')
  return filters.find((f) => f.id === wanted) ?? filters[0]
}

/** Every project on one wall: large photographs in pairs of unequal width, sorted by type on demand. */
export function Projects() {
  const [filter, setFilter] = useState(filterFromAddress)
  const shown = projects.filter(filter.match)

  useEffect(() => {
    refreshScroll()
  }, [filter])

  const choose = (next: (typeof filters)[number]) => {
    setFilter(next)
    const search = next === filters[0] ? '' : `?typ=${next.id}`
    history.replaceState(history.state, '', location.pathname + search)
  }

  return (
    <main>
      <section className="projects" aria-labelledby="projects-title">
        <header className="projects-head" data-reveal>
          <h1 id="projects-title" tabIndex={-1} data-part>
            Realizacje
          </h1>
          <div className="projects-side" data-part>
            <p>Domy, apartamenty, restauracje, hotele i butiki. Każde z tych wnętrz zaczęło się od rozmowy i skończyło na ostatniej lampie.</p>
            <div className="projects-filter" role="group" aria-label="Pokaż realizacje">
              {filters.map((f) => (
                <button key={f.id} type="button" aria-pressed={f === filter} onClick={() => choose(f)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <ul className="projects-wall">
          {shown.map((p) => (
            <li className="project-card" key={p.slug} data-reveal>
              <a href={`/realizacje/${p.slug}`}>
                <span className="project-card-photo">
                  <img src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} style={{ objectPosition: p.cover.focus }} loading="lazy" decoding="async" />
                </span>
                <span className="project-card-text">
                  <span className="project-card-name">{p.name}</span>
                  <span className="project-card-meta">
                    {p.kind}, {p.city}, {p.year}
                  </span>
                  <span className="project-card-idea">{p.idea}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <Contact />
    </main>
  )
}
