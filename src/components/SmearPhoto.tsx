import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { LitSmear, prefersReducedMotion } from '../lib/smear'

export type SmearHandle = {
  fill: () => void
  clear: () => void
  /** Drag the brush along a path given in 0–1 coordinates of the picture. */
  sweep: (path: [number, number][], ms: number) => void
}

type Props = {
  src: string
  alt: string
  width: number
  height: number
  heal?: number
  brush?: number
  eager?: boolean
  className?: string
  onStroke?: (distance: number) => void
  ref?: Ref<SmearHandle>
}

/**
 * A photograph shown dimmed, as if in a dark room. Dragging across it lights it
 * along the stroke: the picture is "smeared" into the light.
 */
export function SmearPhoto({ src, alt, width, height, heal = 0.018, brush = 0.34, eager, className, onStroke, ref }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const smear = useRef<LitSmear | null>(null)
  const strokeCb = useRef(onStroke)
  strokeCb.current = onStroke

  useEffect(() => {
    const img = imgRef.current!
    const canvas = canvasRef.current!
    const s = new LitSmear(canvas, img, { heal, brush, onStroke: (d) => strokeCb.current?.(d) })
    smear.current = s
    const ready = () => {
      s.clear()
      if (prefersReducedMotion() && heal === 0) s.fill()
    }
    if (img.complete) ready()
    else img.addEventListener('load', ready, { once: true })

    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const enter = (e: PointerEvent) => s.stroke(at(e), true)
    const move = (e: PointerEvent) => s.stroke(at(e))
    const leave = () => s.lift()
    canvas.addEventListener('pointerenter', enter)
    canvas.addEventListener('pointerdown', enter)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('pointerup', leave)
    return () => {
      s.destroy()
      canvas.removeEventListener('pointerenter', enter)
      canvas.removeEventListener('pointerdown', enter)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('pointerup', leave)
    }
  }, [heal, brush])

  useImperativeHandle(ref, () => ({
    fill: () => smear.current?.fill(),
    clear: () => smear.current?.clear(),
    sweep: (path, ms) => {
      const s = smear.current
      const canvas = canvasRef.current
      if (!s || !canvas || path.length < 2) return
      const r = canvas.getBoundingClientRect()
      const t0 = performance.now()
      let first = true
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / ms) * (path.length - 1)
        const i = Math.min(Math.floor(k), path.length - 2)
        const f = k - i
        const x = (path[i][0] + (path[i + 1][0] - path[i][0]) * f) * r.width
        const y = (path[i][1] + (path[i + 1][1] - path[i][1]) * f) * r.height
        s.stroke({ x, y }, first)
        first = false
        if (k < path.length - 1) requestAnimationFrame(step)
        else s.lift()
      }
      requestAnimationFrame(step)
    },
  }))

  return (
    <div className={`smear${className ? ` ${className}` : ''}`}>
      <img ref={imgRef} src={`/media/${src}.jpg`} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
