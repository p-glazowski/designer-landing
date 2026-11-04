/**
 * Holds full-screen sections still in browsers that resize the page as their bars move.
 *
 * Safari and Chrome keep `svh` constant while their bars slide, so this never fires there.
 * In-app browsers (Messenger, Instagram) appear to resize the whole web view instead, so `svh`
 * itself changes and every section sized from it moves with it. When `svh` changes at the
 * same width on a touch device, sections stay at the first height until the width changes.
 */
export function lockViewportHeight() {
  // A desktop window resized by hand should still reflow.
  if (!matchMedia('(pointer: coarse)').matches) return

  const root = document.documentElement
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
  document.body.append(probe)

  const measure = () => probe.getBoundingClientRect().height
  let width = window.innerWidth
  let height = measure()

  window.addEventListener('resize', () => {
    if (window.innerWidth !== width) {
      // A rotation or split view is a new screen, so size from it afresh.
      root.style.removeProperty('--svh')
      width = window.innerWidth
      height = measure()
    } else if (Math.abs(measure() - height) > 1) {
      root.style.setProperty('--svh', `${height / 100}px`)
    }
  })
}
