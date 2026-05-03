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

  // 该里程碑时间范围内的事件
  const milestoneEntries = entries
    .filter(e => e.categoryId === category.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 估算时间范围
  const firstEntry = milestoneEntries[0]
  const lastEntry = milestoneEntries[milestoneEntries.length - 1]
  const dateRange = firstEntry && lastEntry
    ? `${firstEntry.date} ~ ${lastEntry.date}`
    : ''

  // 关键事件（最近几条有意义的记录）
  const keyEvents = milestoneEntries
    .filter(e => e.description)
    .slice(-5)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
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
        className="relative overflow-hidden rounded-2xl border border-gray-200 p-6"
        style={{
          background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`,
        }}
      >
        {/* 装饰 */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: category.color, transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-5"
          style={{ backgroundColor: category.color, transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <Award size={20} style={{ color: category.color }} />
              </div>
              <div>
                <div className="text-xs text-gray-400">里程碑达成</div>
                <div className="text-lg font-bold text-gray-800">{category.name}</div>
              </div>
            </div>
            <div
              className="text-2xl font-bold px-3 py-1 rounded-lg"
              style={{ color: category.color, backgroundColor: `${category.color}10` }}
            >
              {milestone.milestoneHours}h
            </div>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>累计 {totalHours} 小时</span>
            </div>
            {dateRange && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>{dateRange}</span>
              </div>
            )}
          </div>

          {/* 关键事件 */}
          {keyEvents.length > 0 && (
            <div className="border-t border-gray-200/50 pt-3">
              <div className="text-xs text-gray-400 mb-2">关键事件</div>
              <div className="space-y-1.5">
                {keyEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2 text-sm">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-700">{event.description}</span>
                    <span className="text-xs text-gray-400 ml-auto shrink-0">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部 */}
          <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {new Date(milestone.achievedAt).toLocaleDateString('zh-CN')} 达成
            </span>
            <span className="text-xs text-gray-400">技能时间追踪器</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Download size={14} />
        保存为图片
      </button>
    </div>
  )
}
