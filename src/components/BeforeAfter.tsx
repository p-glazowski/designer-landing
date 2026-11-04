import { useEffect, useRef, useState } from 'react'
import { BeforeAfterSmear } from '../lib/beforeAfter'
import { prefersReducedMotion } from '../lib/smear'

/**
 * The live thing: one bathroom on the day of handover, in bare concrete. A smudge
 * follows the cursor and shows the same room finished, only where it passes.
 */
export function BeforeAfter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beforeRef = useRef<HTMLImageElement>(null)
  const afterRef = useRef<HTMLImageElement>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const canvas = canvasRef.current!
    const before = beforeRef.current!
    const after = afterRef.current!
    const s = new BeforeAfterSmear(canvas, before, after)
    let gone = false

    const move = (e: PointerEvent) => s.point({ x: e.clientX, y: e.clientY })
    const leave = () => s.lift()
    canvas.addEventListener('pointerenter', move)
    canvas.addEventListener('pointerdown', move)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('pointercancel', leave)

    const seen = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        seen.disconnect()
        Promise.all([before.decode(), after.decode()])
          .then(() => {
            if (!gone) s.demo(2600)
          })
          .catch(() => {})
      },
      { threshold: 0.6 },
    )
    seen.observe(canvas)

    return () => {
      gone = true
      seen.disconnect()
      s.destroy()
      canvas.removeEventListener('pointerenter', move)
      canvas.removeEventListener('pointerdown', move)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('pointercancel', leave)
    }
  }, [])

  return (
    <section className="change" id="przed-i-po" aria-labelledby="change-title" tabIndex={-1}>
      <div className="change-head" data-reveal>
        <h2 id="change-title" data-part>
          Przed i po
        </h2>
        <div className="change-side" data-part>
          <p>Ta sama łazienka w dniu odbioru i w dniu oddania kluczy. Przesuń po zdjęciu, a beton ustąpi wnętrzu.</p>
          <button type="button" className="change-toggle" onClick={() => setFinished((f) => !f)}>
            {finished ? 'Pokaż surowy beton' : 'Pokaż gotowe wnętrze'}
          </button>
        </div>
      </div>

      <div className={`change-stage${finished ? ' is-finished' : ''}`}>
        <img ref={beforeRef} src="/media/bath-before.webp" alt="Łazienka przed realizacją: surowe betonowe ściany, wyprowadzone rury i okno" width={1448} height={1086} loading="lazy" decoding="async" />
        <img
          ref={afterRef}
          className="change-after"
          src="/media/bath-after.webp"
          alt="Ta sama łazienka po realizacji: beżowy marmur, podświetlane lustro, orzechowa szafka i złota armatura"
          width={1448}
          height={1086}
          loading="lazy"
          decoding="async"
        />
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
    </section>
  )
}
