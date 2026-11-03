import { useRef, useState } from 'react'
import { materials } from '../content'
import { SmearPhoto, type SmearHandle } from './SmearPhoto'

/**
 * The live thing: six material samples lie in the dark. Smear across one and it
 * lights up and joins the visitor's own set, to bring to the first meeting.
 */
export function Moodboard() {
  const [picked, setPicked] = useState<string[]>([])
  const travel = useRef<Record<string, number>>({})
  const handles = useRef<Record<string, SmearHandle | null>>({})

  const pick = (id: string) => setPicked((p) => (p.includes(id) ? p : [...p, id]))

  const toggle = (id: string) => {
    if (picked.includes(id)) {
      handles.current[id]?.clear()
      travel.current[id] = 0
      setPicked((p) => p.filter((x) => x !== id))
    } else {
      handles.current[id]?.fill()
      pick(id)
    }
  }

  const reset = () => {
    materials.forEach((m) => handles.current[m.id]?.clear())
    travel.current = {}
    setPicked([])
  }

  const names = materials.filter((m) => picked.includes(m.id)).map((m) => m.name)

  return (
    <section className="mood" id="materia" aria-labelledby="mood-title" tabIndex={-1}>
      <div className="mood-field">
        {materials.map((m, i) => (
          <div className={`mood-tile t${i}`} key={m.id} data-drift={4 + ((i * 5) % 9)}>
            <SmearPhoto
              ref={(h) => {
                handles.current[m.id] = h
              }}
              src={`mat-${m.id}`}
              alt={m.alt}
              width={m.w}
              height={m.h}
              heal={0}
              brush={0.5}
              onStroke={(d) => {
                travel.current[m.id] = (travel.current[m.id] || 0) + d
                if (travel.current[m.id] > 140) pick(m.id)
              }}
            />
            <button
              type="button"
              className="mood-toggle"
              aria-pressed={picked.includes(m.id)}
              onClick={() => toggle(m.id)}
            >
              {m.name}
            </button>
          </div>
        ))}

        <div className="mood-head" data-reveal>
          <h2 id="mood-title" data-part>
            Moodboard zaczyna się
            <br />
            od dotyku materii.
          </h2>
          <p data-part>Te same próbki kładziemy na stole przy pierwszym spotkaniu. Przesuń dłonią po tych, które Ci odpowiadają.</p>
          <p className="mood-set" aria-live="polite" data-part>
            {names.length ? (
              <>
                Twój zestaw: <strong>{names.join(', ')}</strong>
              </>
            ) : (
              'Twój zestaw jest jeszcze pusty.'
            )}
          </p>
          <p className="mood-actions" data-part>
            <a href="#kontakt">{names.length ? 'Umów spotkanie z tym zestawem' : 'Umów spotkanie z próbkami'}</a>
            {names.length > 0 && (
              <button type="button" className="link-button" onClick={reset}>
                Wyczyść
              </button>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
