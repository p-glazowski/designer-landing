// Sample content for the demo: contact details and the like are placeholders.
// The projects live in data.js.

export const steps = [
  {
    word: 'Rozmowa',
    text: 'Zaczynamy od spotkania: jak mieszkasz, pracujesz i przyjmujesz gości. Słuchamy dłużej, niż mówimy.',
    media: { src: 'talk', alt: 'Para unosząca się nad ciemnym kubkiem kawy przy oknie' },
  },
  {
    word: 'Szkic',
    text: 'Układ funkcjonalny, rzuty i wizualizacje. Każdą ścianę rysujemy, zanim ktokolwiek po nią sięgnie.',
    media: { src: 'sketch', alt: 'Dłoń kreśląca ostre, ciemne linie na papierze' },
  },
  {
    word: 'Materia',
    text: 'Kamień, drewno i tkaniny na jednym stole. Wybieramy dotykiem, nie z katalogu.',
    media: { src: 'silk', alt: 'Czarna jedwabna tkanina falująca w świetle' },
  },
  {
    word: 'Realizacja',
    text: 'Nadzór autorski na budowie aż do ostatniej lampy. Oddajemy klucze do skończonego wnętrza.',
    media: { src: 'bath', alt: 'Ujęcie ukończonej łazienki w ciemnym kamieniu' },
  },
]

export const credits = [
  ['Peter Muniz', 'Unsplash'],
  ['Aalo Lens', 'Unsplash'],
  ['Puscas Adryan', 'Unsplash'],
  ['Decima Athens', 'Unsplash'],
  ['Luwadlin Bosman', 'Unsplash'],
  ['Dylan Calluy', 'Unsplash'],
  ['Marina Nazina', 'Unsplash'],
  ['atelierbyvineeth', 'Unsplash'],
  ['takahiro taguchi', 'Unsplash'],
  ['Alexis Presa', 'Unsplash'],
  ['Paolo Chiabrando', 'Unsplash'],
  ['Zoe', 'Unsplash'],
  ['Daniel McCullough', 'Unsplash'],
  ['Ali Moradi', 'Unsplash'],
  ['Ria', 'Unsplash'],
  ['Adam Birkett', 'Unsplash'],
  ['Juzzepo', 'Unsplash'],
  ['Logan Voss', 'Unsplash'],
  ['Ksusha Vasileva', 'Unsplash'],
  ['Mohammad Lotfian', 'Unsplash'],
  ['Alessandro Guarino', 'Unsplash'],
  ['Hanna Pad', 'Pexels'],
  ['Arsel Ozgurdal', 'Pexels'],
  ['Life of Pix', 'Pexels'],
  ['Ron Lach', 'Pexels'],
] as const

/** Placeholder studio name, shown in the wordmark, the about text and the footer. */
export const brand = 'Pracownia'

/** Placeholder details for the demo. Neither reaches anyone: no Polish number starts with 0, and .example is a reserved domain. */
export const contact = {
  phone: '+48 000 000 000',
  email: 'kontakt@pracownia.example',
}
