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
        backgroundColor: 'var(--carbon-base)',
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
        className="relative overflow-hidden p-5"
        style={{
          background: `linear-gradient(135deg, ${category.color}08, var(--carbon-base))`,
          border: `1px solid ${category.color}18`,
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${category.color}15` }}
              >
                <Award size={20} style={{ color: category.color }} />
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--slate-ghost)', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  里程碑达成
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
                >
                  {category.name}
                </div>
              </div>
            </div>
            <div
              className="text-base font-bold px-2.5 py-1 rounded-md"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: category.color,
                background: `${category.color}12`,
              }}
            >
              {milestone.milestoneHours}h
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--silver-mist)' }}>
              <Clock size={12} />
              <span>累计 {totalHours} 小时</span>
            </div>
            {dateRange && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--silver-mist)' }}>
                <Calendar size={12} />
                <span>{dateRange}</span>
              </div>
            )}
          </div>

          {keyEvents.length > 0 && (
            <div style={{ borderTop: '1px solid var(--whisper-border)' }} className="pt-2.5">
              <div
                className="text-[10px] uppercase tracking-wider mb-2"
                style={{ color: 'var(--slate-ghost)', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                关键事件
              </div>
              <div className="space-y-1.5">
                {keyEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2 text-xs">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1" style={{ color: 'var(--silver-mist)' }}>{event.description}</span>
                    <span className="shrink-0" style={{ color: 'var(--slate-ghost)' }}>{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="mt-3 pt-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--whisper-border)' }}
          >
            <span className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
              {new Date(milestone.achievedAt).toLocaleDateString('zh-CN')} 达成
            </span>
            <span
              className="text-[10px] font-semibold tracking-wider"
              style={{ color: 'var(--slate-ghost)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              LEVELUP
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors duration-150"
        style={{ color: 'var(--silver-mist)' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--slate-surface)'
          e.currentTarget.style.color = 'var(--bright-chalk)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--silver-mist)'
        }}
      >
        <Download size={13} />
        保存为图片
      </button>
    </div>
  )
}
