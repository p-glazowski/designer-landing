import { useEffect, useRef } from 'react'
import { steps } from '../content'
import { prefersReducedMotion } from '../lib/smear'
import { withBase } from '../lib/withBase'

/** Four full-screen panels; each stage's word holds the centre while its film plays. */
export function Process() {
  const root = useRef<HTMLElement>(null)

  // Only the panel filling most of the screen plays: two full-screen clips
  // decoding at once made scrolling between panels stutter.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const seen = new Map<Element, number>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting ? e.intersectionRatio : 0))
        let main: Element | null = null
        let most = 0
        seen.forEach((ratio, panel) => {
          if (ratio > most) {
            most = ratio
            main = panel
          }
        })
        seen.forEach((_, panel) => {
          const v = panel.querySelector('video')!
          if (panel !== main) v.pause()
          else if (v.paused) v.play().catch(() => {})
        })
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    )
    // Downloading starts a screen ahead, so a film is ready by the time its panel arrives.
    const ahead = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          ahead.unobserve(e.target)
          const v = e.target.querySelector('video')!
          v.preload = 'auto'
          // Arriving by a jump, it is already playing, and load() would cancel that.
          if (v.paused) v.load()
        })
      },
      { rootMargin: '100% 0px' },
    )

    // The poster is the film's first frame, and only lifts once that frame is on screen.
    const panels = root.current!.querySelectorAll<HTMLElement>('.panel')
    const stops = [...panels].map((panel) => {
      const v = panel.querySelector('video')!
      const reveal = () => panel.classList.add('is-rolling')
      if (v.requestVideoFrameCallback) {
        const frame = v.requestVideoFrameCallback(reveal)
        return () => v.cancelVideoFrameCallback(frame)
      }
      v.addEventListener('playing', reveal, { once: true })
      return () => v.removeEventListener('playing', reveal)
    })

    panels.forEach((p) => {
      io.observe(p)
      ahead.observe(p)
    })
    return () => {
      io.disconnect()
      ahead.disconnect()
      stops.forEach((stop) => stop())
    }
  }, [])

  return (
    <section className="process" id="proces" ref={root} aria-label="Proces" tabIndex={-1}>
      {steps.map((s) => (
        <article className="panel" key={s.word}>
          <div className="panel-media">
            <video
              data-zoom
              src={withBase(`/media/${s.media.src}.mp4`)}
              muted
              loop
              playsInline
              preload="none"
              aria-label={s.media.alt}
            />
            <img className="panel-poster" data-zoom src={withBase(`/media/${s.media.src}-poster.jpg`)} alt="" decoding="async" />
          </div>
          <div className="panel-word">
            <h2>{s.word}</h2>
          </div>
          <p className="panel-text">{s.text}</p>
        </article>
      ))}
    </section>
  )
}
