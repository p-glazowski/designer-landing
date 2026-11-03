import { useEffect, useState } from 'react'
import { Intro } from './components/Intro'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { Statement } from './components/Statement'
import { Process } from './components/Process'
import { Moodboard } from './components/Moodboard'
import { Studio } from './components/Studio'
import { Contact } from './components/Contact'
import { initMotion } from './lib/motion'
import { prefersReducedMotion } from './lib/smear'

function introWillPlay() {
  try {
    return !prefersReducedMotion() && sessionStorage.getItem('intro-seen') !== '1'
  } catch {
    return !prefersReducedMotion()
  }
}

export default function App() {
  // Read once, before the intro marks itself as seen.
  const [introDelay] = useState(() => (introWillPlay() ? 2200 : 500))

  useEffect(() => initMotion(), [])

  return (
    <>
      <Intro />
      <Hero introDelay={introDelay} />
      <main>
        <Work />
        <Statement />
        <Process />
        <Moodboard />
        <Studio />
        <Contact />
      </main>
    </>
  )
}
