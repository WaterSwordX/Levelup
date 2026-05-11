import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
}

export default function RevealSection({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('revealed'), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`reveal-section ${className}`}
    >
      {children}
    </div>
  )
}
