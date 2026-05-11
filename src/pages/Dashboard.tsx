import type { Category, TimeEntry, Goal, Milestone } from '../types'
import { getTopCategories, getCategoryTotalTime, getCategoryPath, getGoalForCategory } from '../store'
import { Clock, TrendingUp, Calendar, Target, Award, Rocket, Flame, BarChart3, Zap, ChevronRight } from 'lucide-react'
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

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function Dashboard({ categories, entries, goals, milestones }: Props) {
  const topCategories = getTopCategories(categories)
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1

  // Week boundaries
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Time calculations
  const todayMinutes = entries.filter(e => e.date === today).reduce((s, e) => s + e.duration, 0)
  const yesterdayMinutes = entries.filter(e => e.date === yesterdayStr).reduce((s, e) => s + e.duration, 0)
  const weekMinutes = entries.filter(e => e.date >= weekStartStr && e.date <= weekEndStr).reduce((s, e) => s + e.duration, 0)
  const monthMinutes = entries.filter(e => e.date >= monthStart).reduce((s, e) => s + e.duration, 0)
  const totalMinutes = entries.reduce((s, e) => s + e.duration, 0)

  // Days with records this week
  const weekDays = entries
    .filter(e => e.date >= weekStartStr && e.date <= weekEndStr)
    .map(e => e.date)
  const uniqueWeekDays = new Set(weekDays).size

  // Daily average (this week)
  const weekAvg = uniqueWeekDays > 0 ? Math.round(weekMinutes / uniqueWeekDays) : 0

  // Streak: consecutive days with records ending today
  let streak = 0
  const datesWithRecords = new Set(entries.map(e => e.date))
  const checkDate = new Date(now)
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (datesWithRecords.has(dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Today's entries by category
  const todayEntries = entries.filter(e => e.date === today)
  const todayByCategory = new Map<string, number>()
  for (const entry of todayEntries) {
    todayByCategory.set(entry.categoryId, (todayByCategory.get(entry.categoryId) || 0) + entry.duration)
  }
  const todayCategoryBreakdown = Array.from(todayByCategory.entries())
    .map(([catId, minutes]) => {
      const cat = categories.find(c => c.id === catId)
      return cat ? { cat, minutes } : null
    })
    .filter(Boolean)
    .sort((a, b) => b!.minutes - a!.minutes) as { cat: Category; minutes: number }[]

  // Today's comparison with yesterday
  const todayDiff = todayMinutes - yesterdayMinutes

  // Recent entries
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)

  // Goals
  const categoriesWithGoals = topCategories
    .map(cat => {
      const goal = getGoalForCategory(cat.id, goals)
      if (!goal) return null
      const total = getCategoryTotalTime(cat.id, entries, categories)
      return { cat, goal, total }
    })
    .filter(Boolean) as { cat: Category; goal: Goal; total: number }[]

  // Recent milestones
  const recentMilestones = [...milestones]
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 3)

  // Date formatting helpers
  const fmtDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`
  const weekRange = `${fmtDate(weekStart)} — ${fmtDate(weekEnd)}`

  const statCards = [
    { label: '今日', value: todayMinutes, icon: Calendar, color: '#E8941A' },
    { label: '本周', value: weekMinutes, icon: TrendingUp, color: '#4ECDC4' },
    { label: '本月', value: monthMinutes, icon: Clock, color: '#A78BFA' },
    { label: '总计', value: totalMinutes, icon: Clock, color: '#E86B6B' },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              看板
            </h2>
            {streak > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--ember-soft)', color: 'var(--ember-glow)' }}
              >
                <Flame size={14} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{streak}</span> 天连续
              </div>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--slate-ghost)' }}>
            {fmtDate(now)} 周{WEEKDAYS[now.getDay()]} · {weekRange}
          </p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {statCards.map(item => (
          <div
            key={item.label}
            className="glass-card p-4 animate-fade-in-up stat-card group"
            style={{ '--accent-color': item.color } as React.CSSProperties}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-105"
              style={{
                background: `${item.color}12`,
              }}
            >
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
            >
              {formatMinutes(item.value)}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Today's insights row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger-children">
        {/* Today vs Yesterday */}
        <div className="glass-card p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} style={{ color: '#4ECDC4' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--slate-ghost)' }}>昨日对比</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
            >
              {formatMinutes(todayMinutes)}
            </span>
            {todayMinutes > 0 && yesterdayMinutes > 0 && (
              <span
                className="text-xs font-semibold"
                style={{ color: todayDiff >= 0 ? '#4ECDC4' : '#E86B6B' }}
              >
                {todayDiff >= 0 ? '+' : ''}{formatMinutes(Math.abs(todayDiff))}
              </span>
            )}
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--slate-ghost)' }}>
            昨日 {formatMinutes(yesterdayMinutes)}
          </p>
        </div>

        {/* Weekly average */}
        <div className="glass-card p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: '#A78BFA' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--slate-ghost)' }}>本周日均</span>
          </div>
          <div
            className="text-lg font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
          >
            {formatMinutes(weekAvg)}
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--slate-ghost)' }}>
            已记录 {uniqueWeekDays} 天
          </p>
        </div>

        {/* Today's active categories */}
        <div className="glass-card p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} style={{ color: '#E8941A' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--slate-ghost)' }}>今日练习</span>
          </div>
          {todayCategoryBreakdown.length > 0 ? (
            <div className="space-y-2">
              {todayCategoryBreakdown.slice(0, 3).map(({ cat, minutes }) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--silver-mist)' }}>
                    {cat.name}
                  </span>
                  <span
                    className="text-xs font-medium shrink-0"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                  >
                    {formatMinutes(minutes)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>暂无记录</p>
          )}
        </div>
      </div>

      {/* Milestones */}
      {recentMilestones.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Award size={14} style={{ color: '#A78BFA' }} />
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

      {/* Goals */}
      {categoriesWithGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Target size={14} style={{ color: '#4ECDC4' }} />
            目标进度
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
            {categoriesWithGoals.map(({ cat, goal, total }) => {
              const percent = Math.min((total / goal.targetMinutes) * 100, 100)
              const remaining = Math.max(0, goal.targetMinutes - total)
              const targetH = Math.floor(goal.targetMinutes / 60)
              const targetLabel = targetH >= 1 ? `${targetH}小时` : `${goal.targetMinutes}分钟`
              return (
                <div key={cat.id} className="glass-card p-4 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}60` }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
                      目标 {targetLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: 'var(--silver-mist)' }}>
                      {formatMinutes(total)} / {formatMinutes(goal.targetMinutes)}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: cat.color }}
                    >
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
                  {remaining > 0 && (
                    <p className="text-[10px] mt-2" style={{ color: 'var(--slate-ghost)' }}>
                      还差 {formatMinutes(remaining)} 达成目标
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All skills overview */}
      {topCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <ChevronRight size={14} style={{ color: 'var(--slate-ghost)' }} />
            技能总览
          </h3>
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
              const childCount = categories.filter(c => c.parentId === cat.id).length
              return (
                <div key={cat.id} className="glass-card p-4 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}60` }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>
                        {cat.name}
                      </span>
                      {childCount > 0 && (
                        <span className="text-[10px]" style={{ color: 'var(--slate-ghost)' }}>
                          {childCount} 子分类
                        </span>
                      )}
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--silver-mist)' }}
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
                      <span
                        className="text-[10px]"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--slate-ghost)' }}
                      >
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

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div className="space-y-4">
          <h3 className="section-title">最近记录</h3>
          <div className="glass-card-solid overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'var(--whisper-border)' }}>
              {recentEntries.map((entry, i) => {
                const cat = categories.find(c => c.id === entry.categoryId)
                // Format date as relative or absolute
                const entryDate = new Date(entry.date + 'T00:00:00')
                const diffDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
                let dateLabel = entry.date
                if (diffDays === 0) dateLabel = '今天'
                else if (diffDays === 1) dateLabel = '昨天'
                else if (diffDays === 2) dateLabel = '前天'
                else dateLabel = `${entryDate.getMonth() + 1}/${entryDate.getDate()}`

                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3.5 flex items-center gap-3 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)] animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat?.color ?? 'var(--slate-ghost)', boxShadow: `0 0 6px ${cat?.color ?? 'var(--slate-ghost)'}60` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: 'var(--bright-chalk)' }}>
                        {entry.description || getCategoryPath(entry.categoryId, categories)}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--slate-ghost)' }}>{dateLabel}</div>
                    </div>
                    <span
                      className="text-xs font-medium shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--silver-mist)' }}
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

      {/* Empty state */}
      {categories.length === 0 && entries.length === 0 && (
        <div className="glass-card p-16 text-center animate-fade-in-up">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'var(--ember-soft)',
              boxShadow: '0 0 40px var(--ember-ghost)',
            }}
          >
            <Rocket size={36} style={{ color: 'var(--ember-glow)' }} />
          </div>
          <h3
            className="text-xl font-bold mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            欢迎使用 Levelup
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--silver-mist)' }}>
            记录你的技能成长时间，让积累看得见。先去「分类」页面添加你的技能分类，然后开始记录吧。
          </p>
        </div>
      )}
    </div>
  )
}
