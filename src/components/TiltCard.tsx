import { useRef, useEffect, useCallback, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

interface SpringState {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
}

const STIFFNESS = 0.08
const DAMPING = 0.72
const MAX_ANGLE = 6

export default function TiltCard({ children, className = '', style }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const springRef = useRef<SpringState>({ x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 })
  const rafRef = useRef<number | null>(null)
  const isHovering = useRef(false)

  const tick = useCallback(() => {
    const s = springRef.current
    const dx = s.targetX - s.x
    const dy = s.targetY - s.y

    s.vx = (s.vx + dx * STIFFNESS) * DAMPING
    s.vy = (s.vy + dy * STIFFNESS) * DAMPING
    s.x += s.vx
    s.y += s.vy

    const card = cardRef.current
    if (card) {
      card.style.transform = `perspective(900px) rotateX(${s.y}deg) rotateY(${s.x}deg) translateY(-4px)`
    }

    const isSettled =
      Math.abs(s.vx) < 0.01 &&
      Math.abs(s.vy) < 0.01 &&
      Math.abs(dx) < 0.01 &&
      Math.abs(dy) < 0.01

    if (!isSettled || isHovering.current) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
    }
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleMove = (e: React.PointerEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    springRef.current.targetX = nx * MAX_ANGLE
    springRef.current.targetY = -ny * MAX_ANGLE
    isHovering.current = true
    startLoop()
  }

  const handleLeave = () => {
    springRef.current.targetX = 0
    springRef.current.targetY = 0
    isHovering.current = false
    startLoop()
  }

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  )
}
