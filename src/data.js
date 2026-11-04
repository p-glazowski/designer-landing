// @ts-check
// Everything the site knows about the projects. Edit here: the home section,
// the list at /realizacje and each page at /realizacje/<slug> all read from this file.
//
// Sample content for the demo. Names, places, numbers and texts are placeholders,
// and the galleries share stock photos until the studio's real work replaces them.

/**
 * @typedef {object} Photo
 * @property {string} src
 * @property {number} w
 * @property {number} h
 * @property {string} alt
 *
 * @typedef {Photo & {
 *   caption: string,
 *   size: 'wide' | 'tall' | 'full',
 *   focus?: string,
 *   zoom?: number,
 * }} GalleryPhoto
 * `size` is the photo's place on the 12-column grid: wide 8, tall 4, full 12. Order
 * them so each row adds up to 12. `focus` and `zoom` pick a crop; the enlarged view
 * always shows the whole photo.
 *
 * @typedef {Photo & { name: string, note: string, crop?: string }} Material
 * `crop` makes the photo taller than its strip, so only the top of it shows.
 *
 * @typedef {object} Project
 * @property {string} slug Its address: /realizacje/<slug>
 * @property {string} name
 * @property {'private' | 'commercial'} category
 * @property {boolean} featured Also listed on the home page
 * @property {string} kind
 * @property {string} city
 * @property {number} year
 * @property {string} area
 * @property {string} duration
 * @property {string[]} scope
 * @property {Photo & { focus?: string }} cover
 * @property {string} idea The idea behind it, in one sentence set large
 * @property {string} story
 * @property {string} challenge
 * @property {string} solution
 * @property {string} trace What stays with you after the visit: the "ślad" of this interior
 * @property {Material[]} materials
 * @property {GalleryPhoto[]} gallery
 */

const media = {
  bathRoom: { src: '/media/hero-private.jpg', w: 2400, h: 1500, alt: 'Łazienka z czarnym marmurem, orzechową zabudową i okrągłym podświetlanym lustrem' },
  bathMirror: { src: '/media/work-bath.jpg', w: 1400, h: 1400, alt: 'Łazienka z czarnym marmurem, orzechową szafką i okrągłym podświetlanym lustrem' },
  bathDark: { src: '/media/bath-poster.jpg', w: 1280, h: 720, alt: 'Ukończona łazienka w ciemnym kamieniu widziana zza uchylonych drzwi' },
  bathAfter: { src: '/media/bath-after.webp', w: 1448, h: 1086, alt: 'Jasna łazienka z trawertynem, podświetlaną półką i kabiną prysznicową' },
  bathBefore: { src: '/media/bath-before.webp', w: 1448, h: 1086, alt: 'Ta sama łazienka przed remontem: surowe betonowe ściany i okno' },
  shower: { src: '/media/mat-travertine.jpg', w: 700, h: 1050, alt: 'Kabina prysznicowa wyłożona jasnym kamieniem z czarną deszczownicą' },
  marble: { src: '/media/mat-marble.jpg', w: 700, h: 1050, alt: 'Czarny marmur z jasnym użyleniem i złotą listwą' },
  walnut: { src: '/media/mat-walnut.jpg', w: 700, h: 467, alt: 'Ciemne orzechowe lamele' },
  velvet: { src: '/media/mat-velvet.jpg', w: 700, h: 526, alt: 'Bordowa aksamitna zasłona w fałdach' },
  glass: { src: '/media/mat-glass.jpg', w: 700, h: 1050, alt: 'Ściana z bursztynowych szklanych pustaków podświetlona od tyłu' },
  chrome: { src: '/media/mat-chrome.jpg', w: 700, h: 394, alt: 'Płynne, splecione formy z polerowanego chromu' },
  silk: { src: '/media/silk-poster.jpg', w: 1280, h: 2428, alt: 'Czarna jedwabna tkanina falująca w świetle' },
  bedroom: { src: '/media/work-bedroom.jpg', w: 1400, h: 1750, alt: 'Sypialnia w półmroku oświetlona dwiema wiszącymi lampami' },
  stair: { src: '/media/stair.jpg', w: 1000, h: 667, alt: 'Kręte schody w mroku, światło wpada przez wąskie szczeliny w ścianie' },
  armchair: { src: '/media/step-talk.jpg', w: 2000, h: 2761, alt: 'Ciemny fotel i mały stolik w przygaszonym świetle' },
  kitchen: { src: '/media/work-kitchen.jpg', w: 1400, h: 2100, alt: 'Grafitowa kuchnia z czarnym kamieniem na blacie i ścianie' },
  cup: { src: '/media/talk-poster.jpg', w: 1280, h: 720, alt: 'Ciemny kubek kawy na stole przy oknie' },
  samples: { src: '/media/studio.jpg', w: 600, h: 436, alt: 'Próbki materiałów rozłożone na stole w pracowni' },
  drawing: { src: '/media/step-sketch.jpg', w: 2000, h: 1125, alt: 'Projektant rysujący plan na rozłożonym arkuszu' },
  sketch: { src: '/media/sketch-poster.jpg', w: 1280, h: 675, alt: 'Dłoń kreśląca ostre, ciemne linie na papierze' },
  restaurant: { src: '/media/work-restaurant.jpg', w: 1400, h: 2100, alt: 'Restauracja z plecioną lampą nad okrągłym stołem i ryflowaną ścianą' },
  columns: { src: '/media/columns.jpg', w: 1000, h: 750, alt: 'Kamienne kolumny i ostre smugi cienia między nimi' },
  lobby: { src: '/media/hero-commercial.jpg', w: 2400, h: 1500, alt: 'Lobby z trawertynowymi ścianami, sufitem z drewnianych lameli i recepcją z ciemnego marmuru' },
  reception: { src: '/media/work-reception.jpg', w: 1400, h: 1750, alt: 'Recepcja z czarnego marmuru ze złotą listwą i kulistą lampą' },
  boutique: { src: '/media/work-boutique.jpg', w: 1400, h: 2100, alt: 'Wejście do butiku z aksamitną zasłoną i ciepłym światłem kinkietów' },
  bar: { src: '/media/work-bar.jpg', w: 1400, h: 933, alt: 'Bar wieczorem, ciemne stoły i rząd lamp z kloszami' },
}

/** @type {Project[]} */
export const projects = [
  {
    slug: 'apartament-kamienny',
    name: 'Apartament Kamienny',
    category: 'private',
    featured: true,
    kind: 'Łazienka i strefa dzienna',
    city: 'Kraków',
    year: 2025,
    area: '86 m²',
    duration: '9 miesięcy',
    scope: ['Projekt koncepcyjny', 'Projekt wykonawczy', 'Nadzór autorski'],
    cover: media.bathRoom,
    idea: 'Mieszkanie w starej kamienicy, w którym czarny marmur pochłania światło, a orzech oddaje je z powrotem.',
    story:
      'Właściciele wracają do domu późnym wieczorem, więc projektowaliśmy przede wszystkim wieczór. Zamiast rozświetlać całe wnętrze, wybraliśmy kilka miejsc, które świecą, i pozwoliliśmy reszcie zapaść się w półmrok.',
    challenge:
      'Łazienka bez okna, w środku mieszkania, o powierzchni niecałych siedmiu metrów. Ciemny kamień mógł ją zamknąć jak pudełko.',
    solution:
      'Jedna płyta marmuru prowadzi wzrok przez całą ścianę, a okrągłe lustro podświetlone od tyłu staje się oknem, którego tu nie ma. Orzechowa zabudowa chowa wszystko, co nie musi być widoczne.',
    trace: 'Smuga światła z lustra, która wieczorem kładzie się na marmurze i zostaje tam aż do zgaszenia lampy.',
    materials: [
      { ...media.marble, name: 'Czarny marmur', note: 'Płyty dobrane tak, by użylenie biegło ciągiem', crop: '165%' },
      { ...media.walnut, name: 'Orzech', note: 'Olejowany, ciemnieje z czasem' },
      { ...media.chrome, name: 'Chrom', note: 'Tylko w armaturze' },
    ],
    gallery: [
      { ...media.bathMirror, size: 'wide', caption: 'Lustro podświetlone od tyłu zastępuje okno' },
      { ...media.marble, size: 'tall', focus: '50% 0%', zoom: 1.6, caption: 'Złota listwa między płytami marmuru' },
      { ...media.walnut, size: 'tall', caption: 'Lamele z orzecha na frontach zabudowy' },
      { ...media.bathDark, size: 'wide', caption: 'Widok z korytarza, gdy światło gra tylko w głębi' },
    ],
  },
  {
    slug: 'dom-pod-lasem',
    name: 'Dom pod Lasem',
    category: 'private',
    featured: true,
    kind: 'Sypialnie',
    city: 'Gdańsk',
    year: 2024,
    area: '140 m²',
    duration: '11 miesięcy',
    scope: ['Projekt koncepcyjny', 'Projekt wykonawczy', 'Dobór mebli i tkanin'],
    cover: { ...media.bedroom, focus: '50% 20%' },
    idea: 'Piętro domu, na którym zmrok zaczyna się wcześniej niż za oknem, bo tak śpi się najlepiej.',
    story:
      'Las stoi tuż za szybą i to on wyznacza rytm dnia. Sypialnie zaprojektowaliśmy jak spokojne, ciemne pokoje, w których liczą się tkaniny pod dłonią i dwie lampy zawieszone tak nisko, jak świeca na nocnym stoliku.',
    challenge:
      'Duże okna od zachodu wpuszczały ostre światło aż do późnego wieczora, a rodzina chciała zostawić widok na las bez ciężkich rolet.',
    solution:
      'Głębokie ościeża i warstwy zasłon pracują jak przesłona w aparacie. Światło wchodzi do pokoju coraz węziej, a przygaszone ściany nie odbijają go z powrotem.',
    trace: 'Cisza schodów na piętro. Wąska szczelina światła w ścianie prowadzi do sypialni i nie budzi nikogo po drodze.',
    materials: [
      { ...media.velvet, name: 'Aksamit', note: 'Zasłony do samej podłogi' },
      { ...media.silk, name: 'Jedwab', note: 'Pościel i narzuty' },
      { ...media.walnut, name: 'Orzech', note: 'Wezgłowia i szafki nocne' },
    ],
    gallery: [
      { ...media.stair, size: 'wide', caption: 'Schody na piętro prowadzone szczeliną światła' },
      { ...media.armchair, size: 'tall', focus: '50% 60%', caption: 'Fotel do czytania przy oknie' },
      { ...media.silk, size: 'tall', caption: 'Jedwab na narzutach w sypialni głównej' },
      { ...media.bedroom, size: 'wide', focus: '50% 18%', zoom: 1.25, caption: 'Dwie lampy zawieszone nisko nad łóżkiem' },
    ],
  },
  {
    slug: 'kuchnia-grafit',
    name: 'Kuchnia Grafit',
    category: 'private',
    featured: true,
    kind: 'Kuchnia',
    city: 'Poznań',
    year: 2025,
    area: '32 m²',
    duration: '6 miesięcy',
    scope: ['Projekt wykonawczy', 'Meble na wymiar', 'Nadzór autorski'],
    cover: { ...media.kitchen, focus: '50% 55%' },
    idea: 'Kuchnia dla ludzi, którzy naprawdę gotują: ciężka, grafitowa i tak prosta, że znika, gdy odkłada się nóż.',
    story:
      'Zaczęliśmy od tygodnia obserwowania, jak domownicy się po niej poruszają. Układ powstał z tych tras, a dopiero potem z rysunku. Wszystko, po co sięga się codziennie, jest na wyciągnięcie ręki, a reszta schowana za jednolitym frontem.',
    challenge:
      'Otwarta przestrzeń połączona z salonem: kuchnia miała pracować jak profesjonalna, ale nie mogła wyglądać jak zaplecze restauracji.',
    solution:
      'Ten sam czarny kamień biegnie z blatu na ścianę, a fronty bez uchwytów łączą się w jedną grafitową płaszczyznę. Jasna, użylona podłoga odcina ją od reszty domu.',
    trace: 'Poranek przy oknie. Para znad kubka to jedyne, co się tu rusza, zanim ktokolwiek zacznie gotować.',
    materials: [
      { ...media.marble, name: 'Czarny kamień', note: 'Blat i ściana z jednego bloku', crop: '165%' },
      { ...media.chrome, name: 'Stal i chrom', note: 'Tam, gdzie liczy się praca' },
      { ...media.walnut, name: 'Orzech', note: 'Wnętrza szuflad' },
    ],
    gallery: [
      { ...media.kitchen, size: 'tall', focus: '50% 90%', caption: 'Użylona podłoga odcina kuchnię od salonu' },
      { ...media.cup, size: 'wide', caption: 'Miejsce na poranną kawę przy oknie' },
      { ...media.drawing, size: 'wide', caption: 'Układ narysowany z codziennych tras domowników' },
      { ...media.samples, size: 'tall', caption: 'Próbki na stole w pracowni' },
    ],
  },
  {
    slug: 'lazienka-trawers',
    name: 'Łazienka Trawers',
    category: 'private',
    featured: false,
    kind: 'Łazienka',
    city: 'Warszawa',
    year: 2026,
    area: '12 m²',
    duration: '4 miesiące',
    scope: ['Projekt wykonawczy', 'Dobór kamienia', 'Nadzór autorski'],
    cover: media.bathAfter,
    idea: 'Surowy betonowy pokój z jednym oknem, zamieniony w ciepłą, kamienną łazienkę bez przesuwania ani jednej rury.',
    story:
      'Mieszkanie z rynku pierwotnego i pomieszczenie w stanie deweloperskim. Punkty wodne i okno zostały na swoich miejscach, więc całą zmianę musiały przeprowadzić materiał i światło.',
    challenge:
      'Mały budżet na instalacje i wąski, głęboki pokój, w którym dzienne światło kończyło się w połowie długości.',
    solution:
      'Trawertyn od podłogi po sufit odbija światło z okna w głąb, a ciągła podświetlona półka prowadzi je dalej po zmroku. Szklana kabina nie przecina pokoju na pół.',
    trace: 'Ciepło kamienia pod stopą tam, gdzie jeszcze niedawno był goły beton.',
    materials: [
      { ...media.shower, name: 'Trawertyn', note: 'Od podłogi po sufit, wykończenie matowe' },
      { ...media.walnut, name: 'Orzech', note: 'Szafka pod umywalką' },
      { ...media.glass, name: 'Szkło', note: 'Kabina bez profili' },
    ],
    gallery: [
      { ...media.bathBefore, size: 'wide', caption: 'Stan przed remontem: beton i jedno okno' },
      { ...media.shower, size: 'tall', caption: 'Kamień w kabinie prysznicowej' },
      { ...media.drawing, size: 'tall', focus: '40% 50%', caption: 'Rysunki układu okładzin' },
      { ...media.bathAfter, size: 'wide', focus: '20% 50%', zoom: 1.35, caption: 'Podświetlona półka prowadzi światło po zmroku' },
    ],
  },
  {
    slug: 'restauracja-sien',
    name: 'Restauracja Sień',
    category: 'commercial',
    featured: true,
    kind: 'Restauracja',
    city: 'Wrocław',
    year: 2025,
    area: '210 m²',
    duration: '8 miesięcy',
    scope: ['Koncepcja wnętrza', 'Projekt wykonawczy', 'Lampy na zamówienie'],
    cover: { ...media.restaurant, focus: '50% 25%' },
    idea: 'Restauracja w dawnej sieni kamienicy, w której każdy stół ma własną lampę i własny kawałek wieczoru.',
    story:
      'Sala miała pomieścić osiemdziesiąt osób, a jednocześnie dać każdemu stolikowi poczucie, że jest tu sam. Nie stawialiśmy ścian. Oddzieliliśmy stoły światłem, zostawiając między nimi ciemność.',
    challenge:
      'Wysokie, gołe sklepienia i kamienne ściany odbijały każdy dźwięk. Pełna sala była głośna jak dworzec.',
    solution:
      'Ryflowane drewniane panele i plecione klosze wygłuszają salę bez sufitu podwieszanego. Światło schodzi nisko nad stoły, więc sklepienie gaśnie i przestaje być widoczne.',
    trace: 'Plecione cienie lampy, które kładą się na obrusie i przesuwają, gdy ktoś sięga po kieliszek.',
    materials: [
      { ...media.walnut, name: 'Ryflowane drewno', note: 'Wygłusza salę' },
      { ...media.velvet, name: 'Aksamit', note: 'Siedziska i zasłona przy wejściu' },
      { ...media.marble, name: 'Czarny kamień', note: 'Blaty stołów', crop: '165%' },
    ],
    gallery: [
      { ...media.restaurant, size: 'wide', focus: '50% 12%', caption: 'Pleciona lampa wykonana na zamówienie' },
      { ...media.walnut, size: 'tall', caption: 'Ryflowane panele na ścianach' },
      { ...media.restaurant, size: 'tall', focus: '50% 72%', zoom: 1.3, caption: 'Okrągły stół w najgłębszej części sali' },
      { ...media.sketch, size: 'wide', caption: 'Pierwsze szkice układu światła' },
    ],
  },
  {
    slug: 'hotel-nadrzecze',
    name: 'Hotel Nadrzecze',
    category: 'commercial',
    featured: true,
    kind: 'Recepcja hotelowa',
    city: 'Kraków',
    year: 2024,
    area: '320 m²',
    duration: '14 miesięcy',
    scope: ['Koncepcja wnętrza', 'Projekt wykonawczy', 'Nadzór autorski'],
    cover: media.lobby,
    idea: 'Lobby hotelu nad rzeką, w którym kamień zachowuje się jak woda: płynie po ścianach i uspokaja gościa po podróży.',
    story:
      'Hotel chciał recepcji, którą goście zapamiętają, ale która nie będzie krzyczeć. Rozjaśniliśmy wejście trawertynem i dopiero w głębi postawiliśmy ciemną bryłę z marmuru. Tam kończy się podróż, a zaczyna pobyt.',
    challenge:
      'Duża kubatura i ruch przez całą dobę: lobby musiało działać i w południe przy zameldowaniu grupy, i o trzeciej w nocy przy jednym gościu.',
    solution:
      'Sufit z drewnianych lameli obniża skalę i niesie światło, które przygasa wraz z porą dnia. Recepcja z czarnego marmuru ze złotą listwą świeci jak jedyny punkt, którego trzeba szukać.',
    trace: 'Złota linia recepcji, którą widać już od drzwi. Nikt nie pyta tu, gdzie się zameldować.',
    materials: [
      { ...media.shower, name: 'Trawertyn', note: 'Ściany lobby i pokoi' },
      { ...media.marble, name: 'Czarny marmur', note: 'Bryła recepcji', crop: '165%' },
      { ...media.walnut, name: 'Drewniane lamele', note: 'Sufit na całej długości' },
    ],
    gallery: [
      { ...media.columns, size: 'wide', caption: 'Smugi cienia na kolumnach przy wejściu' },
      { ...media.reception, size: 'tall', focus: '50% 45%', caption: 'Recepcja z czarnego marmuru ze złotą listwą' },
      { ...media.shower, size: 'tall', caption: 'Ten sam kamień w łazienkach pokoi' },
      { ...media.lobby, size: 'wide', focus: '70% 30%', zoom: 1.4, caption: 'Sufit z lameli niesie światło w głąb lobby' },
    ],
  },
  {
    slug: 'butik-atlas',
    name: 'Butik Atłas',
    category: 'commercial',
    featured: true,
    kind: 'Butik',
    city: 'Gdańsk',
    year: 2026,
    area: '74 m²',
    duration: '5 miesięcy',
    scope: ['Koncepcja wnętrza', 'Meble na wymiar', 'Oświetlenie ekspozycji'],
    cover: { ...media.boutique, focus: '50% 40%' },
    idea: 'Butik, do którego wchodzi się jak za kulisy: przez aksamitną zasłonę, zostawiając ulicę za plecami.',
    story:
      'Tkaniny, które sprzedaje Atłas, najlepiej wyglądają w ciepłym świetle i najlepiej poznaje się je dotykiem. Wnętrze ma więc niewiele ubrań na raz i dużo miejsca na to, by po nie sięgnąć.',
    challenge:
      'Wąska witryna na ruchliwej ulicy i długi, ciemny lokal, do którego przechodnie nie mieli powodu zajrzeć.',
    solution:
      'Zamiast rozjaśniać witrynę, przyciemniliśmy ją i zostawiliśmy tylko ciepłe światło kinkietów za zasłoną. Z ulicy widać szczelinę, która budzi ciekawość, a nie półkę z towarem.',
    trace: 'Dotyk aksamitu na przedramieniu, pierwsza rzecz po wejściu i ostatnia przy wyjściu.',
    materials: [
      { ...media.velvet, name: 'Aksamit', note: 'Zasłona wejściowa, ręcznie marszczona' },
      { ...media.glass, name: 'Szkło bursztynowe', note: 'Podświetlana ściana przymierzalni' },
      { ...media.chrome, name: 'Polerowany chrom', note: 'Wieszaki odlane na zamówienie' },
    ],
    gallery: [
      { ...media.velvet, size: 'wide', caption: 'Zasłona, przez którą wchodzi się do środka' },
      { ...media.boutique, size: 'tall', focus: '20% 30%', zoom: 1.5, caption: 'Ciepłe światło kinkietów przy wejściu' },
      { ...media.glass, size: 'tall', caption: 'Podświetlana ściana przymierzalni' },
      { ...media.chrome, size: 'wide', caption: 'Chromowane wieszaki odlane na zamówienie' },
    ],
  },
  {
    slug: 'bar-lampa',
    name: 'Bar Lampa',
    category: 'commercial',
    featured: true,
    kind: 'Bar',
    city: 'Łódź',
    year: 2024,
    area: '115 m²',
    duration: '6 miesięcy',
    scope: ['Koncepcja wnętrza', 'Projekt wykonawczy', 'Lampy na zamówienie'],
    cover: media.bar,
    idea: 'Bar nazwany od tego, co w nim najważniejsze: rzędu lamp, pod którymi wieczór zwalnia sam z siebie.',
    story:
      'Właściciel chciał miejsca, do którego przychodzi się na jeden kieliszek i zostaje na trzy. Odjęliśmy więc wszystko, co przypomina o godzinie: nie ma tu ostrego światła, ekranów ani widoku na ulicę od strony baru.',
    challenge:
      'Lokal po dawnym sklepie, z dużą szybą od ulicy i niskim budżetem na przebudowę.',
    solution:
      'Rząd lamp prowadzi od wejścia do baru i porządkuje całą salę bez stawiania ścianek. Szklana ściana z pustaków oddziela ulicę, ale nadal przepuszcza bursztynowy blask na zewnątrz.',
    trace: 'Rząd kloszy widziany z ulicy, po którym przechodnie poznają to miejsce, zanim przeczytają nazwę.',
    materials: [
      { ...media.glass, name: 'Szklane pustaki', note: 'Ściana od strony ulicy' },
      { ...media.walnut, name: 'Ciemne drewno', note: 'Blaty i front baru' },
      { ...media.velvet, name: 'Aksamit', note: 'Ławy pod ścianą' },
    ],
    gallery: [
      { ...media.bar, size: 'wide', focus: '70% 25%', zoom: 1.5, caption: 'Rząd kloszy prowadzi od wejścia do baru' },
      { ...media.glass, size: 'tall', caption: 'Bursztynowy blask szklanej ściany' },
      { ...media.walnut, size: 'tall', caption: 'Ciemne drewno frontu baru' },
      { ...media.drawing, size: 'wide', caption: 'Rysunek rozstawu lamp nad salą' },
    ],
  },
]

/** How the two groups are named on the page. */
export const categories = {
  private: 'Wnętrza prywatne',
  commercial: 'Wnętrza komercyjne',
}
