import { useSyncExternalStore } from 'react'
import { scrollToHash, scrollToTop } from './motion'

/** How the visitor got here: decides where the new page starts scrolled to. */
type Arrival = 'load' | 'push' | 'pop'

export type Route = {
  path: string
  hash: string
  arrival: Arrival
  /** Where to put the page when coming back to it. */
  y: number
}

/** Where the site sits on its host, which the routes in the app don't include. */
const base = import.meta.env.BASE_URL.replace(/\/$/, '')

const read = (arrival: Arrival): Route => ({
  path: (location.pathname.slice(base.length) || '/').replace(/(.)\/$/, '$1'),
  hash: location.hash,
  arrival,
  y: arrival === 'pop' ? (history.state?.y ?? 0) : 0,
})

let route = read('load')
const listeners = new Set<() => void>()

const emit = (arrival: Arrival) => {
  route = read(arrival)
  listeners.forEach((l) => l())
}

export function navigate(href: string) {
  // Remembered on the page being left, so Back returns to the same place on it.
  history.replaceState({ ...history.state, y: window.scrollY }, '')
  history.pushState(null, '', href)
  emit('push')
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useRoute = () => useSyncExternalStore(subscribe, () => route)

/** Lets ordinary links to this site change the page without a reload. Returns the way to stop. */
export function initLinks() {
  // The app restores the scroll itself: the browser would do it before the page has been drawn.
  history.scrollRestoration = 'manual'

  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/"]')
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return
    e.preventDefault()
    const url = new URL(a.href)
    const samePage = url.pathname === location.pathname
    if (!samePage) {
      navigate(url.pathname + url.search + url.hash)
    } else if (url.hash) {
      scrollToHash(url.hash)
      history.replaceState(null, '', url.hash)
    } else {
      scrollToTop()
    }
  }
  const onPop = () => emit('pop')

  document.addEventListener('click', onClick)
  window.addEventListener('popstate', onPop)
  return () => {
    document.removeEventListener('click', onClick)
    window.removeEventListener('popstate', onPop)
  }
}
