import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { prefersReducedMotion } from './smear'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function scrollToHash(hash: string) {
  const el = document.querySelector<HTMLElement>(hash)
  if (!el) return
  // Lenis ignores scroll-margin, which the browser's own scrolling below does honour.
  if (lenis) lenis.scrollTo(el, { offset: -parseFloat(getComputedStyle(el).scrollMarginTop), duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  el.focus({ preventScroll: true })
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.4 })
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** After the page's height changes on its own, such as a filter hiding some of it. */
export const refreshScroll = () => ScrollTrigger.refresh()

/**
 * Smooth scroll, in-page anchors, and the entrance for the parts of every section.
 * Content is visible by default; the hidden starting state is only applied here,
 * so nothing stays hidden if the script fails. Runs afresh for each page.
 */
export function initMotion({ heroDelay = 0 }: { heroDelay?: number } = {}) {
  const onAnchor = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a || a.getAttribute('href') === '#') return
    e.preventDefault()
    scrollToHash(a.getAttribute('href')!)
    history.replaceState(null, '', a.getAttribute('href'))
  }
  document.addEventListener('click', onAnchor)

  if (prefersReducedMotion()) {
    return () => document.removeEventListener('click', onAnchor)
  }

  lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)

  // After a jump Lenis did not make (scrollbar drag, find-in-page, a script),
  // pick up from where the page really is before the next wheel turn.
  const resync = () => {
    if (lenis && Math.abs(window.scrollY - lenis.animatedScroll) > 2) {
      lenis.stop()
      lenis.start()
    }
  }
  window.addEventListener('wheel', resync, { capture: true, passive: true })
  // A jump of half a screen or more while Lenis is still easing is not Lenis's own frame.
  const onJump = () => {
    if (lenis?.isSmooth && Math.abs(window.scrollY - lenis.animatedScroll) > window.innerHeight * 0.5) {
      lenis.stop()
      lenis.start()
    }
  }
  window.addEventListener('scroll', onJump, { passive: true })
  const raf = (t: number) => lenis?.raf(t * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((group) => {
      const parts = group.querySelectorAll<HTMLElement>('[data-part]')
      const targets = parts.length ? parts : [group]
      gsap.from(targets, {
        y: 28,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.08,
        // The hero's copy rises as the welcome wipes away, not behind it.
        delay: group.closest('.hero') ? heroDelay : 0,
        // A page's opening words sit low on the first screen: they arrive without waiting for a scroll.
        scrollTrigger: { trigger: group, start: group.closest('.hero, .case-hero') ? 'top bottom' : 'top 82%', once: true },
      })
    })

    // The same wipe as the home page's project frame: a photo arrives like a stroke across the wall.
    gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0 0 0 100%)' },
        {
          clipPath: 'inset(0 0 0 0%)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      )
    })

    // Photographs breathe slowly as they pass: a scroll-linked scale.
    gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
      const amount = Number(el.dataset.drift || 8)
      gsap.fromTo(
        el,
        { yPercent: amount / 2 },
        {
          yPercent: -amount / 2,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })

    gsap.utils.toArray<HTMLElement>('[data-zoom]').forEach((el) => {
      gsap.fromTo(
        el,
        { scale: 1.12 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })
  })

  return () => {
    document.removeEventListener('click', onAnchor)
    window.removeEventListener('wheel', resync, { capture: true })
    window.removeEventListener('scroll', onJump)
    ctx.revert()
    gsap.ticker.remove(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function stopScroll(stop: boolean) {
  if (!lenis) return
  if (stop) lenis.stop()
  else lenis.start()
}
