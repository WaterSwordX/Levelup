import { useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function TiltCard({ children, className = '', style }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMove = (e: React.PointerEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(900px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-4px)`
  }

  const handleLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = ''
  }

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        transition: 'transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease',
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  )
}
