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
        backgroundColor: '#161b22',
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
        className="relative overflow-hidden rounded-2xl border border-[#30363d] p-5"
        style={{
          background: `linear-gradient(135deg, ${category.color}12, #161b22)`,
          boxShadow: `0 0 30px ${category.color}10`,
        }}
      >
        {/* 装饰光晕 */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-15 blur-2xl"
          style={{ backgroundColor: category.color, transform: 'translate(30%, -30%)' }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20`, boxShadow: `0 0 15px ${category.color}15` }}
              >
                <Award size={20} style={{ color: category.color }} />
              </div>
              <div>
                <div className="text-xs text-[#484f58]">里程碑达成</div>
                <div className="text-lg font-bold text-white">{category.name}</div>
              </div>
            </div>
            <div
              className="text-xl font-bold px-3 py-1 rounded-lg"
              style={{ color: category.color, backgroundColor: `${category.color}15` }}
            >
              {milestone.milestoneHours}h
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-[#8b949e]">
              <Clock size={14} />
              <span>累计 {totalHours} 小时</span>
            </div>
            {dateRange && (
              <div className="flex items-center gap-2 text-sm text-[#8b949e]">
                <Calendar size={14} />
                <span>{dateRange}</span>
              </div>
            )}
          </div>

          {keyEvents.length > 0 && (
            <div className="border-t border-[#30363d] pt-3">
              <div className="text-xs text-[#484f58] mb-2">关键事件</div>
              <div className="space-y-1.5">
                {keyEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2 text-sm">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-[#8b949e]">{event.description}</span>
                    <span className="text-xs text-[#484f58] ml-auto shrink-0">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between">
            <span className="text-xs text-[#484f58]">
              {new Date(milestone.achievedAt).toLocaleDateString('zh-CN')} 达成
            </span>
            <span className="text-xs text-[#30363d]">Levelup</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-lg transition-colors"
      >
        <Download size={14} />
        保存为图片
      </button>
    </div>
  )
}
