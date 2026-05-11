import type { Category, TimeEntry, Milestone } from '../types'
import { getCategoryTotalTime } from '../store'
import { useRef } from 'react'
import { Award, Clock, Calendar, Download } from 'lucide-react'
import html2canvas from 'html2canvas'

interface Props {
  milestone: Milestone
  category: Category
  entries: TimeEntry[]
  allCategories: Category[]
}

export default function MilestoneCard({ milestone, category, entries, allCategories }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const totalMinutes = getCategoryTotalTime(category.id, entries, allCategories)
  const totalHours = Math.floor(totalMinutes / 60)

  const milestoneEntries = entries
    .filter(e => e.categoryId === category.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const firstEntry = milestoneEntries[0]
  const lastEntry = milestoneEntries[milestoneEntries.length - 1]
  const dateRange = firstEntry && lastEntry
    ? `${firstEntry.date} ~ ${lastEntry.date}`
    : ''

  const keyEvents = milestoneEntries
    .filter(e => e.description)
    .slice(-5)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#111318',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `${category.name}-${milestone.milestoneHours}h-成就.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
    }
  }

  return (
    <div className="space-y-2">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-5 milestone-badge"
        style={{
          background: `linear-gradient(135deg, ${category.color}12, rgba(17, 19, 24, 0.8))`,
          border: `1px solid ${category.color}20`,
          boxShadow: `0 0 30px ${category.color}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Decorative glow orbs */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: category.color, transform: 'translate(30%, -30%)', animation: 'breathe 4s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
          style={{ backgroundColor: category.color, transform: 'translate(-20%, 20%)' }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: `${category.color}20`,
                  boxShadow: `0 0 20px ${category.color}15`,
                }}
              >
                <Award size={22} style={{ color: category.color }} />
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--slate-ghost)', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  里程碑达成
                </div>
                <div
                  className="text-base font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
                >
                  {category.name}
                </div>
              </div>
            </div>
            <div
              className="text-lg font-bold px-3 py-1.5 rounded-xl"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: category.color,
                background: `${category.color}12`,
              }}
            >
              {milestone.milestoneHours}h
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--silver-mist)' }}>
              <Clock size={14} />
              <span>累计 {totalHours} 小时</span>
            </div>
            {dateRange && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--silver-mist)' }}>
                <Calendar size={14} />
                <span>{dateRange}</span>
              </div>
            )}
          </div>

          {keyEvents.length > 0 && (
            <div style={{ borderTop: '1px solid var(--whisper-border)' }} className="pt-3">
              <div
                className="text-[10px] uppercase tracking-wider mb-2"
                style={{ color: 'var(--slate-ghost)', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                关键事件
              </div>
              <div className="space-y-1.5">
                {keyEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2 text-sm">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: category.color, boxShadow: `0 0 4px ${category.color}60` }}
                    />
                    <span style={{ color: 'var(--silver-mist)' }}>{event.description}</span>
                    <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--slate-ghost)' }}>{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="mt-4 pt-3 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--whisper-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
              {new Date(milestone.achievedAt).toLocaleDateString('zh-CN')} 达成
            </span>
            <span
              className="text-xs font-semibold tracking-wider"
              style={{ color: 'var(--slate-ghost)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              LEVELUP
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
        style={{ color: 'var(--silver-mist)' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = 'var(--bright-chalk)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--silver-mist)'
        }}
      >
        <Download size={14} />
        保存为图片
      </button>
    </div>
  )
}
