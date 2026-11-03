const lines = ['Ślad zostaje,', 'gdy dłoń przesuwa się', 'po świeżym tynku,', 'kamieniu i tkaninie.', 'Taki ślad projektujemy.']

/** What a trace means to the studio, set as a staircase that descends to the right. */
export function Statement() {
  return (
    <section className="statement" id="slad" aria-label="O śladzie">
      <div className="statement-text" data-reveal>
        <p>
          {lines.map((l, i) => (
            <span className="stair" style={{ ['--i' as string]: i }} key={l} data-part>
              {l}
            </span>
          ))}
        </p>
        <p className="statement-note" data-part>
          Projektujemy przez materię:
          <br />
          dotyk przed katalogiem.
        </p>
      </div>
      <div className="statement-photos" data-reveal>
        <figure data-part>
          <img src="/media/stair.jpg" alt="Kręte schody w mroku, światło wpada przez wąskie szczeliny w ścianie" width={1000} height={667} loading="lazy" decoding="async" />
        </figure>
        <figure data-part>
          <img src="/media/columns.jpg" alt="Kamienne kolumny i ostre smugi cienia między nimi" width={1000} height={750} loading="lazy" decoding="async" />
        </figure>
      </div>
    </section>
  )
}
