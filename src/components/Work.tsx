import { useState } from 'react'
import { commercialWork, privateWork, type Project } from '../content'

const all = [...privateWork, ...commercialWork]

function Row({ p, active, onActive }: { p: Project; active: boolean; onActive: () => void }) {
  return (
    <li className={`work-row${active ? ' is-active' : ''}`}>
      <img className="work-thumb" src={`/media/${p.img}.jpg`} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
      <a href="#kontakt" onPointerEnter={onActive} onFocus={onActive} aria-describedby={`meta-${p.img}`}>
        <span className="work-name">{p.name}</span>
        <span className="work-meta" id={`meta-${p.img}`}>
          {p.kind}<br />
          {p.city}, {p.year}
        </span>
      </a>
    </li>
  )
}

/** The project names are the index; the active one is shown lit in a fixed frame. */
export function Work() {
  const [active, setActive] = useState(all[0].img)

  return (
    <section className="work" id="realizacje" aria-labelledby="work-title" tabIndex={-1}>
      <div className="work-list" data-reveal>
        <h2 id="work-title" className="section-title" data-part>
          Wybrane realizacje
        </h2>
        <h3 className="work-group" id="prywatne" tabIndex={-1} data-part>
          Wnętrza prywatne
        </h3>
        <ul data-part>
          {privateWork.map((p) => (
            <Row key={p.img} p={p} active={active === p.img} onActive={() => setActive(p.img)} />
          ))}
        </ul>
        <h3 className="work-group" id="komercyjne" tabIndex={-1} data-part>
          Wnętrza komercyjne
        </h3>
        <ul data-part>
          {commercialWork.map((p) => (
            <Row key={p.img} p={p} active={active === p.img} onActive={() => setActive(p.img)} />
          ))}
        </ul>
      </div>

      <div className="work-frame" aria-hidden="true">
        {all.map((p) => (
          <img
            key={p.img}
            className={active === p.img ? 'is-active' : ''}
            src={`/media/${p.img}.jpg`}
            alt=""
            width={p.w}
            height={p.h}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </section>
  )
}
