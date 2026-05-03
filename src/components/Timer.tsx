import { useState, useRef, useEffect } from 'react'
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
    <div className="flex flex-col items-center gap-6">
      <div
        className="text-6xl md:text-7xl font-mono font-extralight tracking-widest"
        style={{
          color: running ? '#58a6ff' : '#e6edf3',
          textShadow: running ? '0 0 30px rgba(88,166,255,0.3)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {format(seconds)}
      </div>
      <div className="flex items-center gap-3">
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            disabled={disabled}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#58a6ff] to-[#388bfd] text-white rounded-full text-sm font-medium hover:shadow-[0_0_20px_rgba(88,166,255,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <Play size={18} />
            {seconds > 0 ? '继续' : '开始'}
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#d29922] to-[#bb8009] text-white rounded-full text-sm font-medium hover:shadow-[0_0_20px_rgba(210,153,34,0.3)] transition-all duration-200"
          >
            <Pause size={18} />
            暂停
          </button>
        )}
        {seconds > 0 && (
          <>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-3 bg-[#f8514920] text-[#f85149] border border-[#f8514930] rounded-full text-sm font-medium hover:bg-[#f8514930] transition-all duration-200"
            >
              <Square size={16} />
              结束
            </button>
            <button
              onClick={handleReset}
              className="p-3 text-[#484f58] hover:text-[#8b949e] hover:bg-[#21262d] rounded-full transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
