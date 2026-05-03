import type { Category, TimeEntry, Goal, Milestone } from '../types'
import { getTopCategories, getCategoryTotalTime, getCategoryPath, getGoalForCategory } from '../store'
import { Clock, TrendingUp, Calendar, Target, Award } from 'lucide-react'
import MilestoneCard from '../components/MilestoneCard'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  goals: Goal[]
  milestones: Milestone[]
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

export default function Dashboard({ categories, entries, goals, milestones }: Props) {
  const topCategories = getTopCategories(categories)
  const today = new Date().toISOString().split('T')[0]

  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const todayMinutes = entries.filter(e => e.date === today).reduce((s, e) => s + e.duration, 0)
  const weekMinutes = entries.filter(e => e.date >= weekStartStr).reduce((s, e) => s + e.duration, 0)
  const monthMinutes = entries.filter(e => e.date >= monthStart).reduce((s, e) => s + e.duration, 0)
  const totalMinutes = entries.reduce((s, e) => s + e.duration, 0)

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  const categoriesWithGoals = topCategories
    .map(cat => {
      const goal = getGoalForCategory(cat.id, goals)
      if (!goal) return null
      const total = getCategoryTotalTime(cat.id, entries, categories)
      return { cat, goal, total }
    })
    .filter(Boolean) as { cat: Category; goal: Goal; total: number }[]

  const recentMilestones = [...milestones]
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 3)

  const statCards = [
    { label: '今日', value: todayMinutes, icon: Calendar, color: '#58a6ff' },
    { label: '本周', value: weekMinutes, icon: TrendingUp, color: '#3fb950' },
    { label: '本月', value: monthMinutes, icon: Clock, color: '#d29922' },
    { label: '总计', value: totalMinutes, icon: Clock, color: '#bc8cff' },
  ]

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-white">看板</h2>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(item => (
          <div key={item.label} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#484f58] transition-colors">
            <div className="inline-flex p-1.5 rounded-lg mb-2" style={{ backgroundColor: `${item.color}15` }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div className="text-lg font-bold text-white">{formatMinutes(item.value)}</div>
            <div className="text-xs text-[#484f58]">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 最近里程碑 */}
      {recentMilestones.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#8b949e] flex items-center gap-1.5">
            <Award size={14} />
            最近达成的里程碑
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentMilestones.map(ms => {
              const cat = categories.find(c => c.id === ms.categoryId)
              if (!cat) return null
              return (
                <MilestoneCard
                  key={ms.id}
                  milestone={ms}
                  category={cat}
                  entries={entries}
                  allCategories={categories}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* 目标进度 */}
      {categoriesWithGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#8b949e] flex items-center gap-1.5">
            <Target size={14} />
            目标进度
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoriesWithGoals.map(({ cat, goal, total }) => {
              const percent = Math.min((total / goal.targetMinutes) * 100, 100)
              const targetH = Math.floor(goal.targetMinutes / 60)
              const targetLabel = targetH >= 1 ? `${targetH}小时` : `${goal.targetMinutes}分钟`
              return (
                <div key={cat.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#484f58] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-[#e6edf3]">{cat.name}</span>
                    </div>
                    <span className="text-xs text-[#484f58]">目标 {targetLabel}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#8b949e]">
                      {formatMinutes(total)} / {formatMinutes(goal.targetMinutes)}
                    </span>
                    <span className="text-xs font-medium" style={{ color: cat.color }}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: cat.color,
                        boxShadow: `0 0 8px ${cat.color}40`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 各大类累计时间 */}
      {topCategories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#8b949e]">技能总览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topCategories.map(cat => {
              const total = getCategoryTotalTime(cat.id, entries, categories)
              const goal = getGoalForCategory(cat.id, goals)
              const maxTime = goal
                ? goal.targetMinutes
                : Math.max(...topCategories.map(c => getCategoryTotalTime(c.id, entries, categories)), 1)
              const percent = goal
                ? Math.min((total / goal.targetMinutes) * 100, 100)
                : (total / maxTime) * 100
              return (
                <div key={cat.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#484f58] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-[#e6edf3]">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#8b949e]">{formatMinutes(total)}</span>
                  </div>
                  <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: cat.color,
                        boxShadow: `0 0 6px ${cat.color}30`,
                      }}
                    />
                  </div>
                  {goal && (
                    <div className="text-right mt-1">
                      <span className="text-[10px] text-[#484f58]">{percent.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 最近记录 */}
      {recentEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[#8b949e]">最近记录</h3>
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl divide-y divide-[#21262d]">
            {recentEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId)
              return (
                <div key={entry.id} className="px-4 py-3 flex items-center gap-3 hover:bg-[#1c2128] transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? '#484f58' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#e6edf3] truncate">
                      {entry.description || getCategoryPath(entry.categoryId, categories)}
                    </div>
                    <div className="text-xs text-[#484f58]">{entry.date}</div>
                  </div>
                  <span className="text-xs text-[#8b949e] font-medium shrink-0">{formatMinutes(entry.duration)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {categories.length === 0 && entries.length === 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-base font-semibold text-white mb-2">欢迎使用 Levelup</h3>
          <p className="text-sm text-[#8b949e] max-w-sm mx-auto">
            记录你的技能成长时间，让积累看得见。先去「分类」页面添加你的技能分类，然后开始记录吧。
          </p>
        </div>
      )}
    </div>
  )
}
