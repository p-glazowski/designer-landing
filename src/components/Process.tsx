import { useEffect, useRef } from 'react'
import { steps } from '../content'
import { prefersReducedMotion } from '../lib/smear'

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
    root.current!.querySelectorAll('.panel').forEach((p) => io.observe(p))
    return () => io.disconnect()
  }, [])

  return (
    <section className="process" id="proces" ref={root} aria-label="Proces" tabIndex={-1}>
      {steps.map((s) => (
        <article className="panel" key={s.word}>
          <div className="panel-media">
            <video
              data-zoom
              src={`/media/${s.media.src}.mp4`}
              poster={`/media/${s.media.src}-poster.jpg`}
              muted
              loop
              playsInline
              preload="none"
              aria-label={s.media.alt}
            />
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
