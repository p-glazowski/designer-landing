import { useEffect, useRef, useState } from 'react'
import { brand } from '../content'
import { stopScroll } from '../lib/motion'

const links = [
  { id: 'realizacje', label: 'Realizacje' },
  { id: 'proces', label: 'Proces' },
  { id: 'przed-i-po', label: 'Przed i po' },
]

/** Past this many pixels the nav stops sitting on the room and becomes a bar. */
const AT_TOP = 80
/** Smaller scroll movements than this don't count as a change of direction. */
const JITTER = 6

/**
 * Stays out of the way: it steps aside as the visitor reads down the page and
 * comes back as soon as they scroll up. On a phone the links move into a full-screen menu.
 */
export function Nav() {
  const [atTop, setAtTop] = useState(true)
  const [tucked, setTucked] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const menuRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setAtTop(y <= AT_TOP)
      if (y <= AT_TOP) {
        setTucked(false)
        last = y
      } else if (Math.abs(y - last) >= JITTER) {
        setTucked(y > last)
        last = y
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The section crossing the middle of the screen is the one being read.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        setCurrent((was) => {
          let next = was
          for (const e of entries) {
            if (e.isIntersecting) next = e.target.id
            else if (e.target.id === next) next = null
          }
          return next
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    for (const { id } of links) {
      const section = document.getElementById(id)
      if (section) io.observe(section)
    }
    return () => io.disconnect()
  }, [])

  const openMenu = () => {
    menuRef.current?.showModal()
    stopScroll(true)
  }

  // Scrolling restarts here, not in the dialog's close event: that fires too late for a
  // menu link, whose jump to its section runs straight after this.
  const closeMenu = () => {
    menuRef.current?.close()
    stopScroll(false)
  }

  // A phone turned sideways can pass the breakpoint, where the menu no longer shows.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 761px)')
    const onChange = () => {
      if (wide.matches) closeMenu()
    }
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [])

  const classes = ['nav', !atTop && 'is-bar', tucked && 'is-tucked'].filter(Boolean).join(' ')

  return (
    <nav className={classes} aria-label="Główna">
      <a className="wordmark" href="#top" aria-label={`${brand}, na początek strony`}>
        {brand}
      </a>

      <div className="nav-links">
        {links.map(({ id, label }) => (
          <a key={id} href={`#${id}`} aria-current={current === id ? 'location' : undefined}>
            {label}
          </a>
        ))}
        <a className="button" href="#kontakt">
          Umów konsultację
        </a>
      </div>

      <button className="nav-toggle" type="button" aria-haspopup="dialog" onClick={openMenu}>
        Menu
      </button>

      <dialog className="nav-menu" ref={menuRef} aria-label="Menu" onClose={() => stopScroll(false)}>
        <div className="nav-menu-top">
          <a className="wordmark" href="#top" onClick={closeMenu}>
            {brand}
          </a>
          <button className="nav-toggle" type="button" onClick={closeMenu}>
            Zamknij
          </button>
        </div>
        <ul className="nav-menu-links">
          {links.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} onClick={closeMenu}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a className="button" href="#kontakt" onClick={closeMenu}>
          Umów konsultację
        </a>
      </dialog>
    </nav>
  )
}
