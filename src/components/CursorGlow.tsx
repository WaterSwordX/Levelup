import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointerFine = window.matchMedia('(pointer: fine)').matches
    if (reduceMotion || !pointerFine || !glowRef.current) return

    const el = glowRef.current

    function onMove(e: PointerEvent) {
      el.style.opacity = '1'
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
    }

    function onLeave() {
      el.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        width: '28rem',
        height: '28rem',
        left: 0,
        top: 0,
        zIndex: 1,
        pointerEvents: 'none',
        borderRadius: '999px',
        background:
          'radial-gradient(circle, rgba(232, 148, 26, 0.12), transparent 30%), radial-gradient(circle, rgba(78, 205, 196, 0.08), transparent 50%)',
        filter: 'blur(20px)',
        transform: 'translate3d(-50%, -50%, 0)',
        opacity: 0,
        transition: 'opacity 200ms ease',
        willChange: 'transform',
      }}
    />
  )
}
