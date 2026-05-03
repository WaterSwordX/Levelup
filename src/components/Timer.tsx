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
    <div className="flex flex-col items-center gap-4">
      <div className="text-5xl md:text-6xl font-mono font-light text-gray-800 tracking-wider">
        {format(seconds)}
      </div>
      <div className="flex items-center gap-3">
        {!running ? (
          <button
            onClick={() => setRunning(true)}
            disabled={disabled}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            {seconds > 0 ? '继续' : '开始'}
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <Pause size={18} />
            暂停
          </button>
        )}
        {seconds > 0 && (
          <>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <Square size={16} />
              结束
            </button>
            <button
              onClick={handleReset}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
