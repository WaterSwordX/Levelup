import { useState, useEffect } from 'react'
import type { Category, TimeEntry, Goal, Milestone } from '../types'
import { MILESTONE_TIERS } from '../types'
import { getTopCategories, getCategoryTotalTime, getCategoryPath, getGoalForCategory, loadDashboardSections, saveDashboardSections, loadDashboardSubSections, saveDashboardSubSections, loadHiddenDashboardItems, saveHiddenDashboardItems, resetAllDashboardSettings, DEFAULT_DASHBOARD_SECTIONS, DEFAULT_DASHBOARD_SUB_SECTIONS } from '../store'
import type { DashboardSections, DashboardSubSections, HiddenDashboardItems } from '../store'
import { Clock, TrendingUp, Calendar, Target, Award, Rocket, Flame, BarChart3, Zap, ChevronRight, CalendarDays, Settings, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import MilestoneCard from '../components/MilestoneCard'
import RevealSection from '../components/RevealSection'
import TiltCard from '../components/TiltCard'

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

function StatCard({ item, index }: { item: { label: string; value: number; icon: React.ElementType; color: string; unit?: string; sub?: string; display?: string }; index: number }) {
  return (
    <TiltCard
      className="stat-card p-4 animate-fade-in-up"
      style={{
        '--accent-color': item.color,
        animationDelay: `${index * 50}ms`,
        padding: '16px',
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: `${item.color}15`, boxShadow: `0 0 12px ${item.color}20` }}
        >
          <item.icon size={16} style={{ color: item.color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--slate-ghost)' }}>
          {item.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-xl font-bold"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
        >
          {item.display ?? item.value}
        </span>
        {item.unit && (
          <span className="text-sm font-medium" style={{ color: 'var(--silver-mist)' }}>{item.unit}</span>
        )}
      </div>
      {item.sub && (
        <p className="text-[10px] mt-1" style={{ color: 'var(--slate-ghost)' }}>{item.sub}</p>
      )}
    </TiltCard>
  )
}

export default function Dashboard({ categories, entries, goals, milestones }: Props) {
  const [sections, setSections] = useState<DashboardSections>(loadDashboardSections)
  const [subSections, setSubSections] = useState<DashboardSubSections>(loadDashboardSubSections)
  const [hiddenItems, setHiddenItems] = useState<HiddenDashboardItems>(loadHiddenDashboardItems)
  const [customizing, setCustomizing] = useState(false)

  useEffect(() => { saveDashboardSections(sections) }, [sections])
  useEffect(() => { saveDashboardSubSections(subSections) }, [subSections])
  useEffect(() => { saveHiddenDashboardItems(hiddenItems) }, [hiddenItems])

  const toggleSection = (key: keyof DashboardSections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleSubSection = (key: keyof DashboardSubSections) => {
    setSubSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleHiddenSkill = (skillId: string) => {
    setHiddenItems(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId],
    }))
  }

  const toggleHiddenGoal = (catId: string) => {
    setHiddenItems(prev => ({
      ...prev,
      goalCategoryIds: prev.goalCategoryIds.includes(catId)
        ? prev.goalCategoryIds.filter(id => id !== catId)
        : [...prev.goalCategoryIds, catId],
    }))
  }

  const handleReset = () => {
    resetAllDashboardSettings()
    setSections({ ...DEFAULT_DASHBOARD_SECTIONS })
    setSubSections({ ...DEFAULT_DASHBOARD_SUB_SECTIONS })
    setHiddenItems({ skillIds: [], goalCategoryIds: [] })
  }

  // 辅助：区块标题 + 可见性切换
  const SectionToggle = ({ sectionKey, children }: { sectionKey: keyof DashboardSections; children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      {children}
      {customizing && (
        <button
          onClick={() => toggleSection(sectionKey)}
          className="p-0.5 rounded transition-colors duration-150"
          style={{ color: 'var(--slate-ghost)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)' }}
          title={sections[sectionKey] ? '隐藏此区块' : '显示此区块'}
        >
          {sections[sectionKey] ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
      )}
    </div>
  )

  const topCategories = getTopCategories(categories).filter(c => !c.showCountdown && !c.standalone)
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const todayMinutes = entries.filter(e => e.date === today).reduce((s, e) => s + e.duration, 0)
  const yesterdayMinutes = entries.filter(e => e.date === yesterdayStr).reduce((s, e) => s + e.duration, 0)
  const weekMinutes = entries.filter(e => e.date >= weekStartStr && e.date <= weekEndStr).reduce((s, e) => s + e.duration, 0)
  const monthMinutes = entries.filter(e => e.date >= monthStart).reduce((s, e) => s + e.duration, 0)
  const totalMinutes = entries.reduce((s, e) => s + e.duration, 0)

  const weekDays = entries
    .filter(e => e.date >= weekStartStr && e.date <= weekEndStr)
    .map(e => e.date)
  const uniqueWeekDays = new Set(weekDays).size

  const weekAvg = uniqueWeekDays > 0 ? Math.round(weekMinutes / uniqueWeekDays) : 0

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

  const todayDiff = todayMinutes - yesterdayMinutes

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

  const significantMilestones = milestones
    .filter(m => m.milestoneHours >= 100)
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())

  const tieredMilestones = MILESTONE_TIERS.map(tier => ({
    tier,
    items: significantMilestones.filter(
      m => m.milestoneHours >= tier.minHours && m.milestoneHours <= tier.maxHours
    ),
  })).filter(group => group.items.length > 0)

  const fmtDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`
  const weekRange = `${fmtDate(weekStart)} — ${fmtDate(weekEnd)}`

  const statCards = [
    { label: '今日', value: todayMinutes, icon: Calendar, color: '#E8941A', display: formatMinutes(todayMinutes) },
    { label: '本周', value: weekMinutes, icon: TrendingUp, color: '#4ECDC4', display: formatMinutes(weekMinutes) },
    { label: '本月', value: monthMinutes, icon: BarChart3, color: '#A78BFA', display: formatMinutes(monthMinutes) },
    { label: '连击', value: streak, icon: Flame, color: '#F59E0B', unit: '天', sub: todayMinutes > 0 ? '今日已打卡，连击保持中' : '今天还没记录，快去练一会儿' },
    { label: '总计', value: totalMinutes, icon: Clock, color: '#E86B6B', display: formatMinutes(totalMinutes) },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Decorative art elements */}
      <div className="art-line" style={{ top: '12px', right: '-40px' }} />
      <div className="art-line" style={{ top: '280px', left: '-60px', animationDelay: '-3s' }} />
      <div className="art-dot" style={{ top: '60px', right: '80px' }} />
      <div className="art-dot" style={{ top: '320px', left: '40px', animationDelay: '-2s' }} />

      {/* Header */}
      <RevealSection>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
              >
                看板
              </h2>
              {streak > 0 && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ background: 'var(--ember-soft)', color: 'var(--ember-glow)' }}
                >
                  <Flame size={13} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{streak}</span> 天连续
                </div>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
              {fmtDate(now)} 周{WEEKDAYS[now.getDay()]} · {weekRange}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {customizing && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200 hover:bg-[var(--slate-surface)]"
                style={{
                  color: 'var(--slate-ghost)',
                  border: '1px solid var(--whisper-border)',
                }}
              >
                恢复默认
              </button>
            )}
            <button
              onClick={() => setCustomizing(!customizing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-200 hover:bg-[var(--slate-surface)]"
              style={{
                color: customizing ? 'var(--ember-glow)' : 'var(--slate-ghost)',
                background: customizing ? 'var(--ember-soft)' : 'transparent',
                border: customizing ? '1px solid var(--ember-ghost)' : '1px solid transparent',
              }}
            >
              <Settings size={13} />
              {customizing ? '完成' : '自定义看板'}
            </button>
          </div>
        </div>
        {customizing && (
          <p className="text-[11px] mt-2" style={{ color: 'var(--slate-ghost)' }}>
            点击眼睛图标来显示或隐藏板块、子卡片和单项技能/目标
          </p>
        )}
      </RevealSection>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statCards.map((item, i) => (
          <StatCard key={item.label} item={item} index={i} />
        ))}
      </div>

      {/* 计时日小卡片 */}
      {(() => {
        const allHidden = !sections.countdowns && !sections.insights && !sections.milestones && !sections.goals && !sections.skills && !sections.recent
        if (allHidden) {
          return (
            <div className="p-10 text-center animate-fade-in-up" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--silver-mist)' }}>所有板块已隐藏</p>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 text-xs rounded-md transition-all duration-200"
                style={{ color: 'var(--ember-glow)', background: 'var(--ember-soft)', border: '1px solid var(--ember-ghost)' }}
              >
                恢复默认布局
              </button>
            </div>
          )
        }
        return null
      })()}
      {sections.countdowns && (() => {
        const countdownCats = categories
          .filter(c => c.showCountdown && (c.startDate || c.targetDate))
          .map(c => {
            const isCountdown = c.countdownMode === 'countdown'
            const dateStr = isCountdown ? c.targetDate! : c.startDate!
            const d = new Date(dateStr + 'T00:00:00')
            const diffMs = now.getTime() - d.getTime()
            const days = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)))
            return { cat: c, days, isCountdown }
          })
          .sort((a, b) => (a.cat.pinned ? 0 : 1) - (b.cat.pinned ? 0 : 1) || b.days - a.days)
          .slice(0, 4)
        if (countdownCats.length === 0) return null
        return (
          <RevealSection delay={60}>
            <div className="space-y-2.5">
              <h3 className="section-title flex items-center gap-2">
                <CalendarDays size={13} style={{ color: '#E8941A' }} />
                <SectionToggle sectionKey="countdowns">计时日</SectionToggle>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {countdownCats.map(({ cat, days, isCountdown }) => (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, ${cat.color}12, ${cat.color}05)`,
                      border: `1px solid ${cat.color}18`,
                    }}
                  >
                    <div
                      className="absolute -right-1 -top-3 text-[60px] font-black leading-none select-none pointer-events-none"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: `${cat.color}08` }}
                    >
                      {days}
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--bright-chalk)' }}>{cat.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black" style={{ fontFamily: "'JetBrains Mono', monospace", color: cat.color }}>
                          {days}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--silver-mist)' }}>天</span>
                        {isCountdown && (
                          <span className="text-[9px] ml-1 px-1 py-0.5 rounded" style={{ background: `${cat.color}20`, color: cat.color }}>倒数</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        )
      })()}

      {/* Today's insights row */}
      {sections.insights && (
      <RevealSection delay={80}>
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <BarChart3 size={13} style={{ color: '#4ECDC4' }} />
            <SectionToggle sectionKey="insights">今日数据</SectionToggle>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Yesterday comparison */}
          {subSections.insightsYesterday && (
          <div className="p-4 relative" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
            {customizing && (
              <button
                onClick={() => toggleSubSection('insightsYesterday')}
                className="absolute top-2 right-2 p-0.5 rounded transition-colors duration-150"
                style={{ color: 'var(--slate-ghost)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)' }}
                title="隐藏此卡片"
              >
                <Eye size={12} />
              </button>
            )}
            <div className="flex items-center gap-2 mb-2.5">
              <BarChart3 size={13} style={{ color: '#4ECDC4' }} />
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
                  className="text-xs font-medium"
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
          )}

          {/* Weekly average */}
          {subSections.insightsWeekly && (
          <div className="p-4 relative" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
            {customizing && (
              <button
                onClick={() => toggleSubSection('insightsWeekly')}
                className="absolute top-2 right-2 p-0.5 rounded transition-colors duration-150"
                style={{ color: 'var(--slate-ghost)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)' }}
                title="隐藏此卡片"
              >
                <Eye size={12} />
              </button>
            )}
            <div className="flex items-center gap-2 mb-2.5">
              <Zap size={13} style={{ color: '#A78BFA' }} />
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
          )}

          {/* Today breakdown */}
          {subSections.insightsToday && (
          <div className="p-4 relative" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
            {customizing && (
              <button
                onClick={() => toggleSubSection('insightsToday')}
                className="absolute top-2 right-2 p-0.5 rounded transition-colors duration-150"
                style={{ color: 'var(--slate-ghost)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)' }}
                title="隐藏此卡片"
              >
                <Eye size={12} />
              </button>
            )}
            <div className="flex items-center gap-2 mb-2.5">
              <Target size={13} style={{ color: '#E8941A' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--slate-ghost)' }}>今日练习</span>
            </div>
            {todayCategoryBreakdown.length > 0 ? (
              <div className="space-y-1.5">
                {todayCategoryBreakdown.slice(0, 3).map(({ cat, minutes }) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
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
          )}
        </div>
        {!subSections.insightsYesterday && !subSections.insightsWeekly && !subSections.insightsToday && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--slate-ghost)' }}>所有子卡片已隐藏</p>
        )}
        </div>
      </RevealSection>
      )}

      {/* Milestones */}
      {sections.milestones && tieredMilestones.length > 0 && (
        <RevealSection delay={150}>
          <div className="space-y-4">
            <h3 className="section-title flex items-center gap-2">
              <Award size={13} style={{ color: '#A78BFA' }} />
              <SectionToggle sectionKey="milestones">里程碑</SectionToggle>
            </h3>
            {tieredMilestones.map(({ tier, items }) => (
              <div key={tier.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{ background: `${tier.color}15`, color: tier.color }}
                  >
                    {tier.label}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--slate-ghost)' }}>
                    {items.length} 项
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {items.slice(0, 3).map(ms => {
                    const cat = categories.find(c => c.id === ms.categoryId)
                    if (!cat) return null
                    return (
                      <Link key={ms.id} to={`/category/${ms.categoryId}`} className="block">
                        <MilestoneCard
                          milestone={ms}
                          category={cat}
                          entries={entries}
                          allCategories={categories}
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      )}

      {/* Goals */}
      {sections.goals && categoriesWithGoals.length > 0 && (() => {
        const visibleGoals = categoriesWithGoals.filter(g => !hiddenItems.goalCategoryIds.includes(g.cat.id))
        const hiddenCount = categoriesWithGoals.length - visibleGoals.length
        return (
        <RevealSection delay={120}>
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2">
              <Target size={13} style={{ color: '#4ECDC4' }} />
              <SectionToggle sectionKey="goals">目标进度</SectionToggle>
              {customizing && hiddenCount > 0 && (
                <span className="text-[10px]" style={{ color: 'var(--slate-ghost)' }}>（{hiddenCount} 项已隐藏）</span>
              )}
            </h3>
            {visibleGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleGoals.map(({ cat, goal, total }) => {
                const percent = Math.min((total / goal.targetMinutes) * 100, 100)
                const remaining = Math.max(0, goal.targetMinutes - total)
                const targetH = Math.floor(goal.targetMinutes / 60)
                const targetLabel = targetH >= 1 ? `${targetH}小时` : `${goal.targetMinutes}分钟`
                return (
                  <div key={cat.id} className="relative">
                    {customizing && (
                      <button
                        onClick={() => toggleHiddenGoal(cat.id)}
                        className="absolute top-2 right-2 p-0.5 rounded transition-colors duration-150 z-10"
                        style={{ color: 'var(--slate-ghost)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)' }}
                        title="隐藏此目标"
                      >
                        <Eye size={12} />
                      </button>
                    )}
                    <div className="p-4" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                        目标 {targetLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: 'var(--silver-mist)' }}>
                        {formatMinutes(total)} / {formatMinutes(goal.targetMinutes)}
                      </span>
                      <span
                        className="text-xs font-medium"
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
                          background: cat.color,
                        }}
                      />
                    </div>
                    {remaining > 0 && (
                      <p className="text-[10px] mt-2" style={{ color: 'var(--slate-ghost)' }}>
                        还差 {formatMinutes(remaining)} 达成目标
                      </p>
                    )}
                    </div>
                  </div>
                )
              })}
            </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'var(--slate-ghost)' }}>所有目标已隐藏</p>
            )}
          </div>
        </RevealSection>
        )
      })()}

      {/* All skills overview */}
      {sections.skills && topCategories.length > 0 && (() => {
        const visibleSkills = topCategories.filter(c => !hiddenItems.skillIds.includes(c.id))
        const hiddenCount = topCategories.length - visibleSkills.length
        return (
        <RevealSection delay={80}>
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2">
              <ChevronRight size={13} style={{ color: 'var(--slate-ghost)' }} />
              <SectionToggle sectionKey="skills">技能总览</SectionToggle>
              {customizing && hiddenCount > 0 && (
                <span className="text-[10px]" style={{ color: 'var(--slate-ghost)' }}>（{hiddenCount} 项已隐藏）</span>
              )}
            </h3>
            {visibleSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleSkills.map(cat => {
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
                  <div key={cat.id} className="relative">
                    {customizing && (
                      <button
                        onClick={() => toggleHiddenSkill(cat.id)}
                        className="absolute top-2 right-2 p-0.5 rounded transition-colors duration-150 z-10"
                        style={{ color: 'var(--slate-ghost)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)' }}
                        title="隐藏此技能"
                      >
                        <Eye size={12} />
                      </button>
                    )}
                    <Link to={`/category/${cat.id}`} className="block p-4 transition-all duration-200" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ghost-border)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--whisper-border)' }}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
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
                          className="text-sm font-medium"
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
                            background: cat.color,
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
                    </Link>
                  </div>
                )
              })}
            </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'var(--slate-ghost)' }}>所有技能已隐藏</p>
            )}
          </div>
        </RevealSection>
        )
      })()}

      {/* Recent entries */}
      {sections.recent && recentEntries.length > 0 && (
        <RevealSection delay={80}>
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2">
              <span>最近记录</span>
              <SectionToggle sectionKey="recent"><span /></SectionToggle>
            </h3>
            <div style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="divide-y" style={{ borderColor: 'var(--whisper-border)' }}>
                {recentEntries.map((entry, i) => {
                  const cat = categories.find(c => c.id === entry.categoryId)
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
                      className="px-4 py-3 flex items-center gap-3 transition-colors duration-150 hover:bg-[var(--slate-surface)] animate-fade-in"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat?.color ?? 'var(--slate-ghost)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: 'var(--bright-chalk)' }}>
                          {entry.description || getCategoryPath(entry.categoryId, categories)}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>{dateLabel}</div>
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
        </RevealSection>
      )}

      {/* Empty state */}
      {categories.length === 0 && entries.length === 0 && (
        <div className="p-12 text-center animate-fade-in-up" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--ember-soft)' }}
          >
            <Rocket size={28} style={{ color: 'var(--ember-glow)' }} />
          </div>
          <h3
            className="text-lg font-bold mb-2"
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
