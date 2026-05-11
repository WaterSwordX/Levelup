import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

interface Props {
  onFinish: (durationMinutes: number) => void
  disabled?: boolean
}

export default function Timer({ onFinish, disabled }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startTsRef = useRef(0)
  const accumulatedRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  // Sync elapsed from wall clock — immune to background throttling
  const syncElapsed = useCallback(() => {
    if (!running) return
    const real = accumulatedRef.current + Math.floor((Date.now() - startTsRef.current) / 1000)
    setElapsed(real)
  }, [running])

  useEffect(() => {
    if (running) {
      startTsRef.current = Date.now()
      // Frequent UI updates while visible
      intervalRef.current = window.setInterval(syncElapsed, 200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, syncElapsed])

  // Correct drift when tab comes back to foreground
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncElapsed()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [syncElapsed])

  const format = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    startTsRef.current = Date.now()
    setRunning(true)
  }

  const handlePause = () => {
    accumulatedRef.current += Math.floor((Date.now() - startTsRef.current) / 1000)
    setRunning(false)
  }

  const handleStop = () => {
    const finalElapsed = running
      ? accumulatedRef.current + Math.floor((Date.now() - startTsRef.current) / 1000)
      : accumulatedRef.current
    setRunning(false)
    if (finalElapsed >= 60) {
      onFinish(Math.round(finalElapsed / 60))
    }
    setElapsed(0)
    accumulatedRef.current = 0
  }

  const handleReset = () => {
    setRunning(false)
    setElapsed(0)
    accumulatedRef.current = 0
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
              ? 'radial-gradient(circle, var(--ember-ghost) 0%, transparent 70%)'
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
            border: `2px solid ${running ? '#E8941A' : 'var(--whisper-border)'}`,
            boxShadow: running
              ? '0 0 40px var(--ember-ghost), inset 0 0 30px rgba(232, 148, 26, 0.05)'
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
                background: running ? '#E8941A' : 'var(--slate-ghost)',
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateY(-${window.innerWidth >= 768 ? '118' : '102'}px) translate(-50%, -50%)`,
                opacity: running ? 0.8 : 0.3,
                boxShadow: running ? '0 0 6px var(--ember-ghost)' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
          <div
            className="text-5xl md:text-6xl font-extralight tracking-[0.15em]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: running ? '#E8941A' : 'var(--bright-chalk)',
              textShadow: running ? '0 0 30px var(--ember-ghost)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {format(elapsed)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running ? (
          <button
            onClick={handleStart}
            disabled={disabled}
            className="btn-primary flex items-center gap-2 px-8 py-3 text-sm"
          >
            <Play size={18} />
            {elapsed > 0 ? '继续' : '开始'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #E8941A, #D4840F)',
              color: '#111318',
              boxShadow: '0 4px 15px var(--ember-ghost)',
            }}
          >
            <Pause size={18} />
            暂停
          </button>
        )}
        {elapsed > 0 && (
          <>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200"
              style={{
                background: 'var(--coral-soft)',
                color: 'var(--coral-pulse)',
                border: '1px solid rgba(232, 107, 107, 0.2)',
              }}
            >
              <Square size={16} />
              结束
            </button>
            <button
              onClick={handleReset}
              className="p-3 rounded-xl transition-all duration-200"
              style={{ color: 'var(--slate-ghost)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--silver-mist)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--slate-ghost)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
      </div>

      {disabled && (
        <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
          请先选择一个技能分类
        </p>
      )}
    </div>
  )
}
