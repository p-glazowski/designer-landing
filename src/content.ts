// Sample content for the demo. Project names, places, years and contact
// details are placeholders to be replaced with the studio's real work.

export type Project = {
  name: string
  kind: string
  city: string
  year: number
  img: string
  w: number
  h: number
  alt: string
}

export const privateWork: Project[] = [
  { name: 'Apartament Kamienny', kind: 'Łazienka i strefa dzienna', city: 'Kraków', year: 2025, img: 'work-bath', w: 1400, h: 1400, alt: 'Łazienka z czarnym marmurem, orzechową szafką i okrągłym podświetlanym lustrem' },
  { name: 'Dom pod Lasem', kind: 'Sypialnie', city: 'Gdańsk', year: 2024, img: 'work-bedroom', w: 1400, h: 1750, alt: 'Sypialnia w półmroku oświetlona dwiema wiszącymi lampami' },
  { name: 'Kuchnia Grafit', kind: 'Kuchnia', city: 'Poznań', year: 2025, img: 'work-kitchen', w: 1400, h: 2100, alt: 'Grafitowa kuchnia z czarnym kamieniem na blacie i ścianie' },
]

export const commercialWork: Project[] = [
  { name: 'Restauracja Sień', kind: 'Restauracja', city: 'Wrocław', year: 2025, img: 'work-restaurant', w: 1400, h: 2100, alt: 'Restauracja z plecioną lampą nad okrągłym stołem i ryflowaną ścianą' },
  { name: 'Hotel Nadrzecze', kind: 'Recepcja hotelowa', city: 'Kraków', year: 2024, img: 'work-reception', w: 1400, h: 1750, alt: 'Recepcja z czarnego marmuru ze złotą listwą i kulistą lampą' },
  { name: 'Butik Atłas', kind: 'Butik', city: 'Gdańsk', year: 2026, img: 'work-boutique', w: 1400, h: 2100, alt: 'Wejście do butiku z aksamitną zasłoną i ciepłym światłem kinkietów' },
  { name: 'Bar Lampa', kind: 'Bar', city: 'Łódź', year: 2024, img: 'work-bar', w: 1400, h: 933, alt: 'Bar wieczorem, ciemne stoły i rząd lamp z kloszami' },
]

export const steps = [
  {
    word: 'Rozmowa',
    text: 'Zaczynamy od spotkania: jak mieszkasz, pracujesz i przyjmujesz gości. Słuchamy dłużej, niż mówimy.',
    media: { type: 'img' as const, src: 'step-talk', alt: 'Zielony aksamitny fotel, filiżanka kawy i notes w półmroku' },
  },
  {
    word: 'Szkic',
    text: 'Układ funkcjonalny, rzuty i wizualizacje. Każdą ścianę rysujemy, zanim ktokolwiek po nią sięgnie.',
    media: { type: 'img' as const, src: 'step-sketch', alt: 'Dłoń z ołówkiem nad rysunkiem technicznym i linijką' },
  },
  {
    word: 'Materia',
    text: 'Kamień, drewno i tkaniny na jednym stole. Wybieramy dotykiem, nie z katalogu.',
    media: { type: 'video' as const, src: 'silk', alt: 'Czarna jedwabna tkanina falująca w świetle' },
  },
  {
    word: 'Realizacja',
    text: 'Nadzór autorski na budowie aż do ostatniej lampy. Oddajemy klucze do skończonego wnętrza.',
    media: { type: 'video' as const, src: 'bath', alt: 'Ujęcie ukończonej łazienki w ciemnym kamieniu' },
  },
]

export type Material = { id: string; name: string; note: string; w: number; h: number; alt: string }

export const materials: Material[] = [
  { id: 'travertine', name: 'trawertyn', note: 'ciepły, porowaty, matowy', w: 700, h: 1050, alt: 'Ściana z trawertynu w łazience' },
  { id: 'walnut', name: 'orzech', note: 'lamele w ciemnym oleju', w: 700, h: 467, alt: 'Ciemne orzechowe lamele' },
  { id: 'marble', name: 'marmur', note: 'czarny z białą żyłą', w: 700, h: 1050, alt: 'Czarny marmur z jasnym użyleniem i złotą listwą' },
  { id: 'glass', name: 'luksfery', note: 'światło przez szkło', w: 700, h: 1050, alt: 'Ściana z luksferów podświetlona bursztynowo' },
  { id: 'chrome', name: 'chrom', note: 'giętki połysk', w: 700, h: 394, alt: 'Wygięty chromowany kształt na czarnym tle' },
  { id: 'velvet', name: 'aksamit bordo', note: 'ciężka, miękka fałda', w: 700, h: 526, alt: 'Bordowa aksamitna zasłona w fałdach' },
]

export const credits = [
  ['Peter Muniz', 'Unsplash'],
  ['Oliver Guhr', 'Unsplash'],
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
] as const

/** Placeholder studio name, shown in the wordmark, the about text and the footer. */
export const brand = 'Pracownia'
