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

  // 最近达成的里程碑（最多3个）
  const recentMilestones = [...milestones]
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">看板</h2>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '今日', value: todayMinutes, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
          { label: '本周', value: weekMinutes, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: '本月', value: monthMinutes, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: '总计', value: totalMinutes, icon: Clock, color: 'text-purple-600 bg-purple-50' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-3">
            <div className={`inline-flex p-1.5 rounded-lg ${item.color} mb-2`}>
              <item.icon size={16} />
            </div>
            <div className="text-lg font-bold text-gray-800">{formatMinutes(item.value)}</div>
            <div className="text-xs text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>

      {/* 最近里程碑 */}
      {recentMilestones.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
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
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
            <Target size={14} />
            目标进度
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoriesWithGoals.map(({ cat, goal, total }) => {
              const percent = Math.min((total / goal.targetMinutes) * 100, 100)
              const targetH = Math.floor(goal.targetMinutes / 60)
              const targetLabel = targetH >= 1 ? `${targetH}小时` : `${goal.targetMinutes}分钟`
              return (
                <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">目标 {targetLabel}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">
                      {formatMinutes(total)} / {formatMinutes(goal.targetMinutes)}
                    </span>
                    <span className="text-xs font-medium" style={{ color: cat.color }}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: cat.color }}
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
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">技能总览</h3>
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
                <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{formatMinutes(total)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  {goal && (
                    <div className="text-right mt-1">
                      <span className="text-[10px] text-gray-400">{percent.toFixed(1)}%</span>
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
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">最近记录</h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId)
              return (
                <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? '#9ca3af' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 truncate">
                      {entry.description || getCategoryPath(entry.categoryId, categories)}
                    </div>
                    <div className="text-xs text-gray-400">{entry.date}</div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium shrink-0">{formatMinutes(entry.duration)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {categories.length === 0 && entries.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-base font-medium text-gray-700 mb-1">欢迎使用 Levelup</h3>
          <p className="text-sm text-gray-400">
            记录你的技能成长时间，让积累看得见。先去「分类」页面添加你的技能分类，然后开始记录吧。
          </p>
        </div>
      )}
    </div>
  )
}
