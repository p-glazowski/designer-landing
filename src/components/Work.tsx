import { useEffect, useRef, useState } from 'react'
import { commercialWork, privateWork, type Project } from '../content'
import { prefersReducedMotion } from '../lib/smear'

const all = [...privateWork, ...commercialWork]
const HIDDEN = 'inset(0 0 0 100%)'
const OPEN = 'inset(0 0 0 0)'

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
  const frame = useRef<HTMLDivElement>(null)
  const shown = useRef(active)
  const top = useRef(1)
  const latest = useRef<Animation | null>(null)

  // Decode ahead of the first hover, so a wipe never runs over a picture that is not ready.
  useEffect(() => {
    const el = frame.current!
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        near.disconnect()
        el.querySelectorAll('img').forEach((img) => img.decode().catch(() => {}))
      },
      { rootMargin: '50% 0px' },
    )
    near.observe(el)
    return () => near.disconnect()
  }, [])

  // Every change wipes the new picture in on top, however fast the visitor moves.
  // The ones beneath stay put until it has finished, so the frame is never left empty.
  useEffect(() => {
    if (shown.current === active) return
    shown.current = active
    const imgs = [...frame.current!.querySelectorAll<HTMLImageElement>('img[data-project]')]
    const next = imgs.find((img) => img.dataset.project === active)!
    const hideOthers = () => {
      imgs.forEach((img) => {
        if (img === next) return
        img.getAnimations().forEach((a) => a.cancel())
        img.style.clipPath = HIDDEN
      })
      frame.current?.querySelectorAll('.work-stand-in').forEach((copy) => copy.remove())
    }

    // Coming back to a picture still showing beneath: a frozen copy holds its place
    // while the real one wipes in again, or the frame would open onto nothing.
    const clip = getComputedStyle(next).clipPath
    if (!clip.includes('100%') && !prefersReducedMotion()) {
      const copy = next.cloneNode() as HTMLImageElement
      copy.removeAttribute('data-project')
      copy.classList.add('work-stand-in')
      copy.decoding = 'sync'
      copy.style.clipPath = clip
      copy.style.zIndex = next.style.zIndex
      frame.current!.append(copy)
    }

    next.getAnimations().forEach((a) => a.cancel())
    next.style.zIndex = String((top.current += 1))
    next.style.clipPath = OPEN
    if (prefersReducedMotion()) {
      hideOthers()
      return
    }
    const wipe = next.animate({ clipPath: [HIDDEN, OPEN] }, { duration: 750, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' })
    latest.current = wipe
    wipe.onfinish = () => {
      if (latest.current === wipe) hideOthers()
    }
  }, [active])

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

      <div className="work-frame" aria-hidden="true" ref={frame}>
        {all.map((p) => (
          <img
            key={p.img}
            data-project={p.img}
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
