import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

interface Props {
  onFinish: (durationMinutes: number) => void
  disabled?: boolean
}

export default function Timer({ onFinish, disabled }: Props) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const format = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleStop = () => {
    setRunning(false)
    if (seconds >= 60) {
      onFinish(Math.round(seconds / 60))
    }
    setSeconds(0)
  }

  const handleReset = () => {
    setRunning(false)
    setSeconds(0)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Timer ring */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: running
              ? 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)'
              : 'none',
            transform: 'scale(1.5)',
            transition: 'all 0.5s ease',
            animation: running ? 'breathe 3s ease-in-out infinite' : 'none',
          }}
        />
        {/* Timer circle */}
        <div
          className="w-52 h-52 md:w-60 md:h-60 rounded-full flex items-center justify-center relative"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: `2px solid ${running ? 'var(--accent)' : 'var(--border)'}`,
            boxShadow: running
              ? '0 0 40px var(--accent-glow), inset 0 0 30px rgba(245, 166, 35, 0.05)'
              : 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.5s ease',
          }}
        >
          {/* Decorative dots on the ring */}
          {[0, 90, 180, 270].map(deg => (
            <div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: running ? 'var(--accent)' : 'var(--text-muted)',
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateY(-${window.innerWidth >= 768 ? '118' : '102'}px) translate(-50%, -50%)`,
                opacity: running ? 0.8 : 0.3,
                boxShadow: running ? '0 0 6px var(--accent-glow)' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
          <div
            className="text-5xl md:text-6xl font-extralight tracking-[0.15em]"
            style={{
              fontFamily: "'Space Grotesk', monospace",
              color: running ? 'var(--accent)' : 'var(--text-primary)',
              textShadow: running ? '0 0 30px var(--accent-glow)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {format(seconds)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            disabled={disabled}
            className="btn-primary flex items-center gap-2 px-8 py-3 text-sm"
          >
            <Play size={18} />
            {seconds > 0 ? '继续' : '开始'}
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            className="flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #e8941a)',
              color: '#0e1017',
              boxShadow: '0 4px 15px var(--accent-glow)',
            }}
          >
            <Pause size={18} />
            暂停
          </button>
        )}
        {seconds > 0 && (
          <>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(255, 107, 107, 0.1)',
                color: 'var(--coral)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
              }}
            >
              <Square size={16} />
              结束
            </button>
            <button
              onClick={handleReset}
              className="p-3 rounded-xl transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
      </div>

      {disabled && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          请先选择一个技能分类
        </p>
      )}
    </div>
  )
}
