import { useEffect } from 'react'
import { Intro } from './components/Intro'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { Statement } from './components/Statement'
import { Process } from './components/Process'
import { BeforeAfter } from './components/BeforeAfter'
import { Studio } from './components/Studio'
import { Contact } from './components/Contact'
import { initMotion } from './lib/motion'

/** How long the welcome takes to open onto the hero, in ms. */
const INTRO_MS = 3500

export default function App() {
  useEffect(() => initMotion(), [])

  return (
    <>
      <Intro />
      <Hero introDelay={INTRO_MS} />
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
