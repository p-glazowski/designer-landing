import { useEffect, useRef } from 'react'
import { steps } from '../content'
import { prefersReducedMotion } from '../lib/smear'

/** Four full-screen panels; each stage's word holds the centre while its picture passes. */
export function Process() {
  const root = useRef<HTMLElement>(null)

  // Play each clip only while its panel is on screen.
  useEffect(() => {
    const videos = root.current!.querySelectorAll('video')
    if (prefersReducedMotion()) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        }),
      { threshold: 0.15 },
    )
    videos.forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [])

  return (
    <section className="process" id="proces" ref={root} aria-label="Proces" tabIndex={-1}>
      {steps.map((s) => (
        <article className="panel" key={s.word}>
          <div className="panel-media">
            {s.media.type === 'img' ? (
              <img data-zoom src={`/media/${s.media.src}.jpg`} alt={s.media.alt} width={2000} height={1333} loading="lazy" decoding="async" />
            ) : (
              <video
                data-zoom
                src={`/media/${s.media.src}.mp4`}
                poster={`/media/${s.media.src}-poster.jpg`}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={s.media.alt}
              />
            )}
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
