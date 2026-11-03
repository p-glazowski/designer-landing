import { brand } from '../content'

/** About the studio: one paragraph, its picture set into the text like a drop capital. */
export function Studio() {
  return (
    <section className="studio" id="studio" aria-labelledby="studio-title">
      <h2 id="studio-title" className="section-title">
        O studiu
      </h2>
      <ul className="studio-facts" data-reveal>
        <li data-part>Projekty w całej Polsce</li>
        <li data-part>Od koncepcji po realizację</li>
        <li data-part>Spotkania po umówieniu</li>
      </ul>
      <div className="studio-text" data-reveal>
        <p className="studio-lead" data-part>
          <img src="/media/studio.jpg" alt="Dłoń trzymająca próbkę materiału nad stołem z wzornikami" width={600} height={436} loading="lazy" decoding="async" />
          <strong>{brand}</strong> projektuje wnętrza prywatne i komercyjne. Prowadzimy projekt od pierwszej rozmowy po ostatnią lampę na
          budowie.
        </p>
        <p data-part>
          Projektujemy domy, apartamenty, restauracje, hotele, butiki i biura, zawsze z myślą o materiale, który pięknie się starzeje, i o świetle,
          które go wydobywa. Pracujemy z kamieniarzami, stolarzami i tapicerami, których znamy z imienia, więc rysunek zamienia się we wnętrze bez
          kompromisów po drodze.
        </p>
      </div>
    </section>
  )
}
