import type { Category, TimeEntry, Goal, Milestone } from '../types'
import { getTopCategories, getCategoryTotalTime, getCategoryPath, getGoalForCategory } from '../store'
import { Clock, TrendingUp, Calendar, Target, Award, Rocket } from 'lucide-react'
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
    { label: '今日', value: todayMinutes, icon: Calendar, color: '#f5a623' },
    { label: '本周', value: weekMinutes, icon: TrendingUp, color: '#4ecdc4' },
    { label: '本月', value: monthMinutes, icon: Clock, color: '#a78bfa' },
    { label: '总计', value: totalMinutes, icon: Clock, color: '#ff6b6b' },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
        >
          看板
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          你的技能成长概览
        </p>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {statCards.map(item => (
          <div
            key={item.label}
            className="glass-card p-4 animate-fade-in-up group"
            style={{ '--glow-color': item.color } as React.CSSProperties}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
              style={{
                background: `${item.color}15`,
                boxShadow: `0 0 20px ${item.color}10`,
              }}
            >
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
            >
              {formatMinutes(item.value)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* 最近里程碑 */}
      {recentMilestones.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Award size={14} style={{ color: 'var(--accent)' }} />
            最近达成的里程碑
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            {recentMilestones.map(ms => {
              const cat = categories.find(c => c.id === ms.categoryId)
              if (!cat) return null
              return (
                <div key={ms.id} className="animate-fade-in-up">
                  <MilestoneCard
                    milestone={ms}
                    category={cat}
                    entries={entries}
                    allCategories={categories}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 目标进度 */}
      {categoriesWithGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Target size={14} style={{ color: 'var(--teal)' }} />
            目标进度
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
            {categoriesWithGoals.map(({ cat, goal, total }) => {
              const percent = Math.min((total / goal.targetMinutes) * 100, 100)
              const targetH = Math.floor(goal.targetMinutes / 60)
              const targetLabel = targetH >= 1 ? `${targetH}小时` : `${goal.targetMinutes}分钟`
              return (
                <div key={cat.id} className="glass-card p-4 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}60` }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      目标 {targetLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {formatMinutes(total)} / {formatMinutes(goal.targetMinutes)}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: cat.color }}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`,
                        boxShadow: `0 0 12px ${cat.color}40`,
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
        <div className="space-y-4">
          <h3 className="section-title">技能总览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
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
                <div key={cat.id} className="glass-card p-4 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}60` }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-secondary)' }}
                    >
                      {formatMinutes(total)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`,
                        boxShadow: `0 0 8px ${cat.color}30`,
                      }}
                    />
                  </div>
                  {goal && (
                    <div className="text-right mt-1.5">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {percent.toFixed(1)}%
                      </span>
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
        <div className="space-y-4">
          <h3 className="section-title">最近记录</h3>
          <div className="glass-card-solid overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentEntries.map((entry, i) => {
                const cat = categories.find(c => c.id === entry.categoryId)
                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3 flex items-center gap-3 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)] animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat?.color ?? 'var(--text-muted)', boxShadow: `0 0 6px ${cat?.color ?? 'var(--text-muted)'}60` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {entry.description || getCategoryPath(entry.categoryId, categories)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.date}</div>
                    </div>
                    <span
                      className="text-xs font-medium shrink-0"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-secondary)' }}
                    >
                      {formatMinutes(entry.duration)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {categories.length === 0 && entries.length === 0 && (
        <div className="glass-card p-16 text-center animate-fade-in-up">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, var(--accent-soft), var(--iris-glow))',
              boxShadow: '0 0 40px var(--accent-glow)',
            }}
          >
            <Rocket size={36} style={{ color: 'var(--accent)' }} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
          >
            欢迎使用 Levelup
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            记录你的技能成长时间，让积累看得见。先去「分类」页面添加你的技能分类，然后开始记录吧。
          </p>
        </div>
      )}
    </div>
  )
}
