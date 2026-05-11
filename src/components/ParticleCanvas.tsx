import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  a: number
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let particles: Particle[] = []
    let width = 0
    let height = 0
    let animationId: number | null = null

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width * ratio
      canvas!.height = height * ratio
      canvas!.style.width = width + 'px'
      canvas!.style.height = height + 'px'
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0)
      const count = Math.min(80, Math.floor((width * height) / 22000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.32 + 0.08,
      }))
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      // Draw connections
      ctx!.strokeStyle = 'rgba(232, 148, 26, 0.07)'
      ctx!.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        a.x += a.vx
        a.y += a.vy
        if (a.x < -10) a.x = width + 10
        if (a.x > width + 10) a.x = -10
        if (a.y < -10) a.y = height + 10
        if (a.y > height + 10) a.y = -10

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < 120) {
            ctx!.globalAlpha = (120 - dist) / 500
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // Draw particles
      ctx!.globalAlpha = 1
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.fillStyle = `rgba(232, 148, 26, ${p.a})`
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fill()
      }
      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.8,
      }}
    />
  )
}
