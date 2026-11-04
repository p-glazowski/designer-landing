import { useEffect, useLayoutEffect, useState } from 'react'
import { Intro } from './components/Intro'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { Statement } from './components/Statement'
import { Process } from './components/Process'
import { BeforeAfter } from './components/BeforeAfter'
import { Studio } from './components/Studio'
import { Contact } from './components/Contact'
import { Projects } from './components/Projects'
import { ProjectPage } from './components/ProjectPage'
import { NotFound } from './components/NotFound'
import { brand } from './content'
import { projects } from './data'
import { initMotion } from './lib/motion'
import { initLinks, useRoute } from './lib/router'

/** How long the welcome takes to open onto the hero, in ms. */
const INTRO_MS = 3500

function Home({ introDelay }: { introDelay: number }) {
  return (
    <>
      <Hero introDelay={introDelay} />
      <main>
        <Work />
        <Statement />
        <Process />
        <BeforeAfter />
        <Studio />
        <Contact />
      </main>
    </>
  )
}

const home = `${brand} — projektowanie wnętrz`

export default function App() {
  const route = useRoute()
  // The welcome is for arriving at the studio's front door, once per visit.
  const [welcome] = useState(() => route.arrival === 'load' && route.path === '/')
  const opening = welcome && route.arrival === 'load'

  useEffect(() => initLinks(), [])

  const project = route.path.startsWith('/realizacje/') ? projects.find((p) => `/realizacje/${p.slug}` === route.path) : undefined
  const isList = route.path === '/realizacje'
  const isHome = route.path === '/'

  let title = `Nie ma takiej strony — ${brand}`
  if (isHome) title = home
  else if (isList) title = `Realizacje — ${brand}`
  else if (project) title = `${project.name} — ${brand}`

  // Before paint, so the new page never shows for a frame at the old page's scroll position.
  useLayoutEffect(() => {
    document.title = title
    if (route.arrival !== 'load') {
      const target = route.hash ? document.querySelector<HTMLElement>(route.hash) : null
      if (target) target.scrollIntoView({ behavior: 'instant' })
      else window.scrollTo({ top: route.y, behavior: 'instant' })
      if (route.arrival === 'push') (target ?? document.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true })
    }
    return initMotion({ heroDelay: opening ? 1 : 0 })
  }, [route, title, opening])

  return (
    <>
      {welcome && <Intro />}
      <Nav />
      {isHome && <Home introDelay={opening ? INTRO_MS : 0} />}
      {isList && <Projects />}
      {project && <ProjectPage key={project.slug} project={project} />}
      {!isHome && !isList && !project && <NotFound />}
    </>
  )
}
