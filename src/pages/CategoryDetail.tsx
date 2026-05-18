import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import type { Category, TimeEntry, Goal, Milestone, CategoryMilestoneConfig } from '../types'
import { MILESTONE_THRESHOLDS } from '../types'
import { getCategoryTotalTime, getGoalForCategory, getMilestonesForCategory, getChildCategories, getCustomMilestonesForCategory, detectNewMilestones, saveMilestones, saveCategories } from '../store'
import MilestoneThresholdEditor from '../components/MilestoneThresholdEditor'
import RevealSection from '../components/RevealSection'
import { ArrowLeft, Clock, Calendar, Target, Download, ChevronRight, Award, Share2, Edit3, X, Check } from 'lucide-react'
import html2canvas from 'html2canvas'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  goals: Goal[]
  milestones: Milestone[]
  customConfigs: CategoryMilestoneConfig[]
  setCustomConfigs: (configs: CategoryMilestoneConfig[]) => void
  setMilestones: (milestones: Milestone[]) => void
  setCategories: (categories: Category[]) => void
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

function MilestoneTimelineItem({ ms, category, isLast }: { ms: Milestone; category: Category; isLast: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null })
      const link = document.createElement('a')
      link.download = `${category.name}-${ms.milestoneHours}h-成就.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
    }
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-3 h-3 rounded-full shrink-0 ring-2"
          style={{ backgroundColor: category.color, ringColor: `${category.color}30`, boxShadow: `0 0 10px ${category.color}40` }}
        />
        {!isLast && (
          <div className="w-px flex-1 min-h-[24px]" style={{ background: 'var(--whisper-border)' }} />
        )}
      </div>

      <div ref={cardRef} className="flex-1 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: category.color }}
            >
              {ms.milestoneHours}h
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--slate-ghost)' }}>
              {new Date(ms.achievedAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-colors duration-150"
            style={{ color: 'var(--slate-ghost)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--silver-mist)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--slate-ghost)' }}
          >
            <Download size={12} />
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CategoryDetail({ categories, entries, goals, milestones, customConfigs, setCustomConfigs, setMilestones, setCategories }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [editingStartDate, setEditingStartDate] = useState(false)
  const [startDateInput, setStartDateInput] = useState('')

  const category = categories.find(c => c.id === id)
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p style={{ color: 'var(--slate-ghost)' }}>分类不存在</p>
        <button onClick={() => navigate('/')} className="btn-ghost px-4 py-2 text-sm">返回看板</button>
      </div>
    )
  }

  const totalMinutes = getCategoryTotalTime(category.id, entries, categories)
  const goal = getGoalForCategory(category.id, goals)
  const percent = goal ? Math.min((totalMinutes / goal.targetMinutes) * 100, 100) : 0
  const remaining = goal ? Math.max(goal.targetMinutes - totalMinutes, 0) : 0
  const children = getChildCategories(category.id, categories)
  const catMilestones = getMilestonesForCategory(category.id, milestones)

  const customThresholds = getCustomMilestonesForCategory(category.id, customConfigs)
  const allThresholds = [...new Set([...MILESTONE_THRESHOLDS, ...customThresholds])].sort((a, b) => a - b)
  const totalHours = totalMinutes / 60
  const nextThreshold = allThresholds.find(h => h > totalHours)
  const nextProgress = nextThreshold
    ? ((totalHours - (allThresholds.filter(h => h <= totalHours).pop() || 0)) / (nextThreshold - (allThresholds.filter(h => h <= totalHours).pop() || 0))) * 100
    : 0

  const recentEntries = entries
    .filter(e => e.categoryId === category.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)

  const handleRecheck = useCallback(() => {
    const newThresholds = detectNewMilestones(category.id, totalMinutes, milestones, customThresholds)
    if (newThresholds.length > 0) {
      const newMilestones = newThresholds.map(h => ({
        id: crypto.randomUUID(),
        categoryId: category.id,
        milestoneHours: h,
        achievedAt: new Date().toISOString(),
      }))
      const updated = [...milestones, ...newMilestones]
      setMilestones(updated)
      saveMilestones(updated)
    }
  }, [category.id, totalMinutes, milestones, customThresholds, setMilestones])

  // 导出分享卡片为图片
  const handleExportCard = async () => {
    if (!shareCardRef.current) return
    try {
      const canvas = await html2canvas(shareCardRef.current, { scale: 2, backgroundColor: null })
      const link = document.createElement('a')
      link.download = `${category.name}-技能卡片.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('导出失败:', err)
    }
  }

  // 开始日期编辑
  const handleStartEdit = () => {
    setStartDateInput(category.startDate || new Date().toISOString().split('T')[0])
    setEditingStartDate(true)
  }

  const handleStartSave = () => {
    const updated = categories.map(c =>
      c.id === category.id ? { ...c, startDate: startDateInput || undefined } : c
    )
    setCategories(updated)
    saveCategories(updated)
    setEditingStartDate(false)
  }

  const handleStartClear = () => {
    const updated = categories.map(c =>
      c.id === category.id ? { ...c, startDate: undefined } : c
    )
    setCategories(updated)
    saveCategories(updated)
    setEditingStartDate(false)
  }

  // 计算开始以来的天数
  const daysSinceStart = category.startDate
    ? Math.floor((Date.now() - new Date(category.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const firstEntryDate = recentEntries.length > 0 ? recentEntries[recentEntries.length - 1].date : null

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back button */}
      <RevealSection>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm transition-colors duration-150"
          style={{ color: 'var(--silver-mist)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--bright-chalk)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--silver-mist)' }}
        >
          <ArrowLeft size={16} />
          返回
        </button>
      </RevealSection>

      {/* 可分享卡片 */}
      <RevealSection delay={20}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2">
              <Share2 size={13} style={{ color: category.color }} />
              技能卡片
            </h3>
            <button
              onClick={handleExportCard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors duration-150"
              style={{ color: 'var(--silver-mist)', border: '1px solid var(--whisper-border)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--bright-chalk)'; e.currentTarget.style.borderColor = 'var(--ghost-border)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--silver-mist)'; e.currentTarget.style.borderColor = 'var(--whisper-border)' }}
            >
              <Download size={13} />
              保存为图片
            </button>
          </div>
          <div
            ref={shareCardRef}
            className="p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${category.color}12, var(--carbon-base) 60%)`,
              border: `1px solid ${category.color}30`,
              borderRadius: 'var(--radius-xl)',
              minHeight: '180px',
            }}
          >
            {/* 装饰背景 */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, ${category.color}, transparent)` }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${category.color}, transparent)` }}
            />

            <div className="relative space-y-4">
              {/* 顶行：分类名 + 颜色标识 */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                  style={{ background: `${category.color}20`, color: category.color, boxShadow: `0 0 20px ${category.color}25` }}
                >
                  {category.name.charAt(0)}
                </div>
                <div>
                  <h2
                    className="text-xl font-bold tracking-tight"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
                  >
                    {category.name}
                  </h2>
                  {children.length > 0 && (
                    <span className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
                      {children.length} 个子分类
                    </span>
                  )}
                </div>
              </div>

              {/* 数据行 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--slate-ghost)' }}>累计投入</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ember-bright)' }}
                  >
                    {totalHours.toFixed(0)}h
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--silver-mist)' }}>{formatMinutes(totalMinutes)}</p>
                </div>
                {daysSinceStart !== null && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--slate-ghost)' }}>已坚持</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                    >
                      {daysSinceStart}天
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--silver-mist)' }}>
                      自 {category.startDate}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--slate-ghost)' }}>记录次数</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                  >
                    {recentEntries.length}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--silver-mist)' }}>
                    {firstEntryDate ? `最早 ${firstEntryDate}` : '暂无记录'}
                  </p>
                </div>
                {goal && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--slate-ghost)' }}>目标进度</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: '#4ECDC4' }}
                    >
                      {percent.toFixed(0)}%
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--silver-mist)' }}>
                      {remaining > 0 ? `还差 ${formatMinutes(remaining)}` : '已达成'}
                    </p>
                  </div>
                )}
              </div>

              {/* 底部水印 */}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${category.color}15` }}>
                <span className="text-[10px] tracking-widest" style={{ color: 'var(--slate-ghost)' }}>
                  LEVELUP SKILL TRACKER
                </span>
                <span className="text-[10px]" style={{ color: category.color }}>
                  {new Date().toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 开始日期编辑 */}
      <RevealSection delay={30}>
        <div
          className="p-5 space-y-3"
          style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: category.color }} />
              <span className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>开始日期</span>
              <span className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>（可选，设定后卡片会显示坚持天数）</span>
            </div>
            {!editingStartDate && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors duration-150"
                style={{ color: 'var(--silver-mist)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--bright-chalk)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--silver-mist)' }}
              >
                <Edit3 size={12} />
                {category.startDate ? '修改' : '设定'}
              </button>
            )}
          </div>

          {editingStartDate ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateInput}
                onChange={e => setStartDateInput(e.target.value)}
                className="input-field text-sm"
                style={{ padding: '6px 10px' }}
              />
              <button
                onClick={handleStartSave}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors duration-150"
                style={{ color: 'var(--ember-glow)', background: 'var(--ember-soft)' }}
              >
                <Check size={14} />
                保存
              </button>
              <button
                onClick={handleStartClear}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors duration-150"
                style={{ color: 'var(--slate-ghost)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                清除
              </button>
              <button
                onClick={() => setEditingStartDate(false)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors duration-150"
                style={{ color: 'var(--slate-ghost)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <X size={14} />
              </button>
            </div>
          ) : category.startDate ? (
            <div className="flex items-center gap-4">
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ember-glow)' }}
              >
                {category.startDate}
              </span>
              {daysSinceStart !== null && (
                <span className="text-xs" style={{ color: 'var(--silver-mist)' }}>
                  已坚持 <span style={{ color: 'var(--ember-bright)', fontFamily: "'JetBrains Mono', monospace" }}>{daysSinceStart}</span> 天
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
              未设定开始日期，点击「设定」选择你开始这项技能的日期
            </p>
          )}
        </div>
      </RevealSection>

      {/* 目标进度 */}
      {goal && (
        <RevealSection delay={35}>
          <div
            className="p-5 space-y-2"
            style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--silver-mist)' }}>
                <Target size={14} style={{ color: '#4ECDC4' }} />
                目标 {formatMinutes(goal.targetMinutes)}
              </span>
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ember-glow)' }}
              >
                {percent.toFixed(1)}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${percent}%`, background: category.color }}
              />
            </div>
            {remaining > 0 && (
              <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                还差 {formatMinutes(remaining)} 达成目标
              </p>
            )}
          </div>
        </RevealSection>
      )}

      {/* Milestones */}
      <RevealSection delay={40}>
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Award size={13} style={{ color: '#A78BFA' }} />
            里程碑
          </h3>
          <div
            className="p-5"
            style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
          >
            {catMilestones.length > 0 ? (
              <div>
                {catMilestones.map((ms, i) => (
                  <MilestoneTimelineItem
                    key={ms.id}
                    ms={ms}
                    category={category}
                    isLast={i === catMilestones.length - 1 && !nextThreshold}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'var(--slate-ghost)' }}>
                暂无里程碑，继续加油！
              </p>
            )}

            {nextThreshold && (
              <div className="flex gap-4 mt-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      border: `2px solid ${category.color}40`,
                      background: 'transparent',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-medium"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--slate-ghost)' }}
                    >
                      下一个：{nextThreshold}h
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--slate-ghost)' }}>
                      ({totalHours.toFixed(1)}h / {nextThreshold}h)
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: '4px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(nextProgress, 100)}%`,
                        background: category.color,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </RevealSection>

      {/* Custom milestones editor */}
      <RevealSection delay={60}>
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Calendar size={13} style={{ color: '#E8941A' }} />
            自定义里程碑
          </h3>
          <div
            className="p-5"
            style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
          >
            <MilestoneThresholdEditor
              categoryId={category.id}
              customConfigs={customConfigs}
              setCustomConfigs={setCustomConfigs}
              onSaved={handleRecheck}
            />
          </div>
        </div>
      </RevealSection>

      {/* Child categories */}
      {children.length > 0 && (
        <RevealSection delay={80}>
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2">
              <ChevronRight size={13} style={{ color: 'var(--slate-ghost)' }} />
              子分类
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {children.map(child => {
                const childTotal = getCategoryTotalTime(child.id, entries, categories)
                return (
                  <button
                    key={child.id}
                    onClick={() => navigate(`/category/${child.id}`)}
                    className="p-4 text-left transition-all duration-200"
                    style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ghost-border)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--whisper-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: child.color }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>
                          {child.name}
                        </span>
                      </div>
                      <span
                        className="text-xs"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--silver-mist)' }}
                      >
                        {formatMinutes(childTotal)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </RevealSection>
      )}

      {/* Recent entries */}
      <RevealSection delay={100}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2">
              <Clock size={13} style={{ color: 'var(--silver-mist)' }} />
              时间记录
            </h3>
            <span className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
              最近 {Math.min(recentEntries.length, 20)} 条
            </span>
          </div>
          {recentEntries.length > 0 ? (
            <div
              style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
            >
              <div className="divide-y" style={{ borderColor: 'var(--whisper-border)' }}>
                {recentEntries.map(entry => (
                  <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0">
                      {entry.description ? (
                        <p className="text-sm truncate" style={{ color: 'var(--bright-chalk)' }}>
                          {entry.description}
                        </p>
                      ) : (
                        <p className="text-sm truncate italic" style={{ color: 'var(--slate-ghost)' }}>
                          无描述
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                          {entry.date}
                        </span>
                        {entry.startTime && (
                          <span className="text-[11px]" style={{ color: 'var(--silver-mist)' }}>
                            {entry.startTime}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium shrink-0"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ember-glow)' }}
                    >
                      +{formatMinutes(entry.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="p-10 text-center text-sm"
              style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)', color: 'var(--slate-ghost)' }}
            >
              暂无时间记录
            </div>
          )}
        </div>
      </RevealSection>
    </div>
  )
}
