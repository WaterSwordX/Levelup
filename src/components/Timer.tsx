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
  const runningRef = useRef(false)

  // Sync elapsed from wall clock — immune to background throttling
  const syncElapsed = useCallback(() => {
    if (!runningRef.current) return
    const real = accumulatedRef.current + Math.floor((Date.now() - startTsRef.current) / 1000)
    setElapsed(real)
  }, [])

  useEffect(() => {
    if (running) {
      runningRef.current = true
      startTsRef.current = Date.now()
      intervalRef.current = window.setInterval(syncElapsed, 200)
    } else {
      runningRef.current = false
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
    runningRef.current = true
    startTsRef.current = Date.now()
    setRunning(true)
  }

  const handlePause = () => {
    accumulatedRef.current += Math.floor((Date.now() - startTsRef.current) / 1000)
    runningRef.current = false
    setRunning(false)
  }

  const handleStop = () => {
    const finalElapsed = runningRef.current
      ? accumulatedRef.current + Math.floor((Date.now() - startTsRef.current) / 1000)
      : accumulatedRef.current
    runningRef.current = false
    setRunning(false)
    const minutes = Math.round(finalElapsed / 60)
    if (minutes > 0) {
      onFinish(minutes)
    }
    setElapsed(0)
    accumulatedRef.current = 0
  }

  const handleReset = () => {
    runningRef.current = false
    setRunning(false)
    setElapsed(0)
    accumulatedRef.current = 0
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Timer display */}
      <div className="relative">
        {/* Outer glow rings */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: running ? 'rgba(232, 148, 26, 0.06)' : 'transparent',
            transform: 'scale(1.5)',
            transition: 'transform 600ms var(--ease-out), opacity 600ms var(--ease-out), background 600ms var(--ease-out)',
            animation: running ? 'breathe 4s ease-in-out infinite' : 'none',
            opacity: running ? 1 : 0,
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: running ? 'rgba(232, 148, 26, 0.04)' : 'transparent',
            transform: 'scale(1.8)',
            transition: 'transform 800ms var(--ease-out), opacity 800ms var(--ease-out), background 800ms var(--ease-out)',
            animation: running ? 'breathe 5s ease-in-out infinite' : 'none',
            opacity: running ? 0.6 : 0,
          }}
        />
        {/* Decorative art dots around timer */}
        {running && (
          <>
            <div className="art-dot" style={{ top: '-8px', left: '50%', animation: 'floatDot 4s ease-in-out infinite' }} />
            <div className="art-dot" style={{ bottom: '-8px', right: '20%', animation: 'floatDot 5s ease-in-out infinite', animationDelay: '-1.5s' }} />
            <div className="art-dot" style={{ top: '30%', right: '-12px', animation: 'floatDot 6s ease-in-out infinite', animationDelay: '-3s' }} />
          </>
        )}
        {/* Timer circle */}
        <div
          className="w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center relative"
          style={{
            background: running
              ? 'radial-gradient(circle, rgba(232, 148, 26, 0.08) 0%, var(--carbon-base) 70%)'
              : 'var(--carbon-base)',
            border: `1.5px solid ${running ? 'rgba(232, 148, 26, 0.5)' : 'var(--whisper-border)'}`,
            boxShadow: running
              ? '0 0 40px rgba(232, 148, 26, 0.15), inset 0 0 30px rgba(232, 148, 26, 0.05)'
              : 'none',
            transition: 'border-color 400ms var(--ease-out), box-shadow 400ms var(--ease-out), background 400ms var(--ease-out)',
          }}
        >
          <div
            className="text-4xl md:text-5xl font-light tracking-[0.12em]"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: running ? 'var(--ember-bright)' : 'var(--bright-chalk)',
              textShadow: running ? '0 0 20px rgba(232, 148, 26, 0.4)' : 'none',
              transition: 'color 300ms var(--ease-out), text-shadow 300ms var(--ease-out)',
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
            className="btn-primary flex items-center gap-2 px-7 py-2.5 text-sm"
          >
            <Play size={16} />
            {elapsed > 0 ? '继续' : '开始'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn-primary flex items-center gap-2 px-7 py-2.5 text-sm"
          >
            <Pause size={16} />
            暂停
          </button>
        )}
        {elapsed > 0 && (
          <>
            <button
              onClick={handleStop}
              className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm"
              style={{ color: 'var(--coral-pulse)', borderColor: 'rgba(232, 107, 107, 0.2)' }}
            >
              <Square size={14} />
              结束
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 rounded-lg transition-colors duration-150"
              style={{ color: 'var(--slate-ghost)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--silver-mist)'
                e.currentTarget.style.background = 'var(--slate-surface)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--slate-ghost)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <RotateCcw size={16} />
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
