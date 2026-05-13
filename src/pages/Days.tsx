import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveCategories, getCategoryTotalTime } from '../store'
import RevealSection from '../components/RevealSection'
import {
  Plus, X, Check, Calendar, Timer, ChevronDown, ChevronRight,
  Pin, PinOff, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle,
  StickyNote,
} from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  setCategories: (cats: Category[]) => void
}

type SortMode = 'days' | 'date' | 'name'

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

function diffDays(dateStr: string, now: Date): number {
  const d = new Date(dateStr + 'T00:00:00')
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** 将天数分解为年月周日 */
function breakDownDays(totalDays: number, now: Date, refDateStr: string) {
  const ref = new Date(refDateStr + 'T00:00:00')
  let years = now.getFullYear() - ref.getFullYear()
  let months = now.getMonth() - ref.getMonth()
  let days = now.getDate() - ref.getDate()
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
  if (months < 0) { years--; months += 12 }
  const weeks = Math.floor(totalDays / 7)
  return { years, months, weeks, days, totalDays }
}

// ─── 单条计时日卡片 ──────────────────────────────────────────

function DayCard({
  category, totalDays, mode, now, entries, allCategories,
  onEdit, onRemove, onTogglePin,
}: {
  category: Category
  totalDays: number
  mode: 'countup' | 'countdown'
  now: Date
  entries: TimeEntry[]
  allCategories: Category[]
  onEdit: () => void
  onRemove: () => void
  onTogglePin: () => void
}) {
  const total = getCategoryTotalTime(category.id, entries, allCategories)
  const dateStr = mode === 'countup' ? category.startDate! : category.targetDate!
  const bd = breakDownDays(totalDays, now, dateStr)
  const dateObj = new Date(dateStr + 'T00:00:00')
  const isCountdown = mode === 'countdown'

  const verb = isCountdown ? '距离' : ''
  const suffix = isCountdown ? '还有' : '已经'
  const timeUnit = isCountdown ? '天' : '天了'

  return (
    <div
      className="relative overflow-hidden rounded-2xl group"
      style={{
        background: `linear-gradient(160deg, ${category.color}12, ${category.color}05, transparent)`,
        border: `1px solid ${category.color}18`,
      }}
    >
      {/* 顶部渐变条 */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}40, transparent)` }}
      />

      {/* 装饰性大数字 */}
      <div
        className="absolute -right-2 -top-5 select-none pointer-events-none"
        style={{
          fontSize: '120px',
          lineHeight: 1,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 900,
          color: `${category.color}06`,
          WebkitTextStroke: `1px ${category.color}0a`,
        }}
      >
        {totalDays}
      </div>

      <div className="relative p-5">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {category.pinned && <Pin size={12} style={{ color: category.color }} className="shrink-0" />}
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: category.color, boxShadow: `0 0 10px ${category.color}40` }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--bright-chalk)' }}>
              {category.name}
            </span>
            {isCountdown && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: `${category.color}20`, color: category.color }}
              >
                倒数
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={onTogglePin} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--slate-ghost)' }} title={category.pinned ? '取消置顶' : '置顶'}>
              {category.pinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
            <button onClick={onEdit} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--slate-ghost)' }} title="编辑">
              <Pencil size={13} />
            </button>
            <button onClick={onRemove} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--slate-ghost)' }} title="删除">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* 主数字 */}
        <div className="flex items-baseline gap-2 mb-1.5">
          <span
            className="text-5xl font-black tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: category.color }}
          >
            {isCountdown && totalDays < 0 ? Math.abs(totalDays) : totalDays}
          </span>
          <span className="text-lg font-medium" style={{ color: 'var(--silver-mist)' }}>天</span>
        </div>

        {/* 描述 */}
        <p className="text-sm mb-4" style={{ color: 'var(--silver-mist)' }}>
          {verb}{category.name}{suffix}{' '}
          <span className="font-semibold" style={{ color: 'var(--bright-chalk)' }}>
            {isCountdown && totalDays < 0 ? Math.abs(totalDays) : totalDays}
          </span> {timeUnit}
        </p>

        {/* 备注 */}
        {category.note && (
          <div className="flex items-start gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.15)' }}>
            <StickyNote size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--slate-ghost)' }} />
            <p className="text-xs" style={{ color: 'var(--silver-mist)' }}>{category.note}</p>
          </div>
        )}

        {/* 详情网格 */}
        <div
          className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          {[
            { val: bd.years, label: '年' },
            { val: bd.months, label: '月' },
            { val: bd.weeks, label: '周' },
            { val: total > 0 ? Math.round(total / 60) : null, label: '小时' },
          ].map((item, i) => (
            <div key={item.label} className="text-center py-2.5 px-2" style={i < 3 ? { borderRight: '1px solid var(--whisper-border)' } : undefined}>
              <div className="text-base font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}>
                {item.val !== null && item.val !== undefined ? item.val : '—'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
            {isCountdown ? '目标' : '从'} {fmtDate(dateObj)} {isCountdown ? '' : '至今'}
          </p>
          {total > 0 && (
            <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
              累计 {formatMinutes(total)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 可折叠的分类分组 ──────────────────────────────────────────

function CategoryGroup({
  parent, children: childCats, now, entries, allCategories,
  onEdit, onRemove, onTogglePin,
}: {
  parent: { name: string; color: string } | null
  children: { category: Category; totalDays: number; mode: 'countup' | 'countdown' }[]
  now: Date
  entries: TimeEntry[]
  allCategories: Category[]
  onEdit: (cat: Category) => void
  onRemove: (catId: string) => void
  onTogglePin: (cat: Category) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      {/* 分组头部 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 py-2.5 px-1 rounded-lg transition-colors duration-150"
        style={{ color: 'var(--bright-chalk)' }}
      >
        {expanded ? <ChevronDown size={14} style={{ color: 'var(--slate-ghost)' }} /> : <ChevronRight size={14} style={{ color: 'var(--slate-ghost)' }} />}
        {parent ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: parent.color }} />
            <span className="text-sm font-semibold">{parent.name}</span>
          </>
        ) : (
          <span className="text-sm font-semibold">未分组</span>
        )}
        <span className="text-[11px] ml-auto" style={{ color: 'var(--slate-ghost)', fontFamily: "'JetBrains Mono', monospace" }}>
          {childCats.length}
        </span>
      </button>

      {/* 卡片列表 */}
      {expanded && (
        <div className="space-y-3 ml-4 pl-3" style={{ borderLeft: '1px solid var(--whisper-border)' }}>
          {childCats.map(({ category, totalDays, mode }) => (
            <DayCard
              key={category.id}
              category={category}
              totalDays={totalDays}
              mode={mode}
              now={now}
              entries={entries}
              allCategories={allCategories}
              onEdit={() => onEdit(category)}
              onRemove={() => onRemove(category.id)}
              onTogglePin={() => onTogglePin(category)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 树形分类选择器 ──────────────────────────────────────────

function CategoryTreePicker({
  categories, availableCategories, selectedId, onSelect, parentId, level,
}: {
  categories: Category[]
  availableCategories: Category[]
  selectedId: string
  onSelect: (id: string) => void
  parentId: string | null
  level: number
}) {
  // 当前层级的子分类（只显示 available 中的，或者有 available 子孙的父级）
  const children = categories.filter(c => c.parentId === parentId)
  const visible = children.filter(c => {
    if (availableCategories.some(a => a.id === c.id)) return true
    // 检查是否有可用的子孙
    const hasAvailableDescendant = (catId: string): boolean => {
      return categories.some(cc => cc.parentId === catId && (
        availableCategories.some(a => a.id === cc.id) || hasAvailableDescendant(cc.id)
      ))
    }
    return hasAvailableDescendant(c.id)
  })

  if (visible.length === 0) return null

  return (
    <div className={level > 0 ? 'ml-4 pl-2.5' : ''} style={level > 0 ? { borderLeft: '1px solid var(--whisper-border)' } : undefined}>
      {visible.map(cat => {
        const isAvailable = availableCategories.some(a => a.id === cat.id)
        const isSelected = selectedId === cat.id
        const hasAvailableChildren = categories.some(cc => cc.parentId === cat.id && availableCategories.some(a => a.id === cc.id))

        return (
          <CategoryTreePickerNode
            key={cat.id}
            category={cat}
            categories={categories}
            availableCategories={availableCategories}
            selectedId={selectedId}
            onSelect={onSelect}
            isAvailable={isAvailable}
            isSelected={isSelected}
            hasAvailableChildren={hasAvailableChildren}
            level={level}
          />
        )
      })}
    </div>
  )
}

function CategoryTreePickerNode({
  category, categories, availableCategories, selectedId, onSelect,
  isAvailable, isSelected, hasAvailableChildren, level,
}: {
  category: Category
  categories: Category[]
  availableCategories: Category[]
  selectedId: string
  onSelect: (id: string) => void
  isAvailable: boolean
  isSelected: boolean
  hasAvailableChildren: boolean
  level: number
}) {
  const [expanded, setExpanded] = useState(level < 1)

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-150"
        style={{
          background: isSelected ? 'var(--ember-soft)' : 'transparent',
          cursor: isAvailable ? 'pointer' : 'default',
          opacity: isAvailable ? 1 : 0.6,
        }}
        onClick={() => { if (isAvailable) onSelect(category.id) }}
      >
        {/* 展开/折叠按钮 */}
        {hasAvailableChildren ? (
          <button
            className="p-0.5 rounded transition-colors duration-150 shrink-0"
            style={{ color: 'var(--slate-ghost)' }}
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* 色点 */}
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: category.color }} />

        {/* 名称 */}
        <span className="text-sm flex-1 truncate" style={{ color: isSelected ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
          {category.name}
        </span>

        {/* 选中标记 */}
        {isSelected && <Check size={13} style={{ color: '#E8941A' }} className="shrink-0" />}
      </div>

      {/* 子分类 */}
      {expanded && hasAvailableChildren && (
        <CategoryTreePicker
          categories={categories}
          availableCategories={availableCategories}
          selectedId={selectedId}
          onSelect={onSelect}
          parentId={category.id}
          level={level + 1}
        />
      )}
    </div>
  )
}

// ─── 主页面 ──────────────────────────────────────────────────

export default function Days({ categories, entries, setCategories }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedCatId, setSelectedCatId] = useState('')
  const [mode, setMode] = useState<'countup' | 'countdown'>('countup')
  const [dateValue, setDateValue] = useState('')
  const [noteValue, setNoteValue] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('days')

  const now = new Date()

  // 所有已开启计时日的分类
  const activeCategories = categories
    .filter(c => c.showCountdown && (c.startDate || c.targetDate))
    .map(c => {
      const isCountdown = c.countdownMode === 'countdown'
      const dateStr = isCountdown ? c.targetDate! : c.startDate!
      const d = diffDays(dateStr, now)
      return { category: c, totalDays: Math.abs(d), mode: isCountdown ? 'countdown' as const : 'countup' as const }
    })

  // 排序
  const sorted = [...activeCategories].sort((a, b) => {
    // 置顶优先
    if (a.category.pinned && !b.category.pinned) return -1
    if (!a.category.pinned && b.category.pinned) return 1
    switch (sortMode) {
      case 'days': return b.totalDays - a.totalDays
      case 'date': {
        const da = a.mode === 'countup' ? a.category.startDate! : a.category.targetDate!
        const db = b.mode === 'countup' ? b.category.startDate! : b.category.targetDate!
        return da < db ? 1 : -1
      }
      case 'name': return a.category.name.localeCompare(b.category.name)
    }
  })

  // 按父级分组
  const groups = new Map<string | null, typeof sorted>()
  for (const item of sorted) {
    const pid = item.category.parentId
    if (!groups.has(pid)) groups.set(pid, [])
    groups.get(pid)!.push(item)
  }

  // 可用分类（未开启计时日的）
  const availableCategories = categories.filter(c => !c.showCountdown)

  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setSelectedCatId('')
    setDateValue('')
    setNoteValue('')
    setMode('countup')
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setSelectedCatId(cat.id)
    setMode(cat.countdownMode || 'countup')
    setDateValue(cat.countdownMode === 'countdown' ? (cat.targetDate || '') : (cat.startDate || ''))
    setNoteValue(cat.note || '')
    setShowForm(true)
  }

  const handleSave = () => {
    if (!selectedCatId || !dateValue) return
    const isCountdown = mode === 'countdown'
    const updated = categories.map(c => {
      if (c.id !== selectedCatId) return c
      return {
        ...c,
        showCountdown: true,
        countdownMode: mode,
        startDate: isCountdown ? undefined : dateValue,
        targetDate: isCountdown ? dateValue : undefined,
        note: noteValue || undefined,
      }
    })
    setCategories(updated)
    saveCategories(updated)
    resetForm()
  }

  const handleRemove = (catId: string) => {
    if (!confirm('移除此计时日？')) return
    const updated = categories.map(c =>
      c.id === catId ? { ...c, showCountdown: false, startDate: undefined, targetDate: undefined, countdownMode: undefined } : c
    )
    setCategories(updated)
    saveCategories(updated)
  }

  const handleTogglePin = (cat: Category) => {
    const updated = categories.map(c =>
      c.id === cat.id ? { ...c, pinned: !c.pinned } : c
    )
    setCategories(updated)
    saveCategories(updated)
  }

  const hasAny = activeCategories.length > 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 头部 */}
      <RevealSection>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}>
              计时日
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
              记录每件事已经坚持了多久，或距离目标还有多久
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasAny && (
              <div className="flex items-center gap-1">
                {(['days', 'date', 'name'] as SortMode[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortMode(s)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                    style={{
                      background: sortMode === s ? 'var(--ember-soft)' : 'transparent',
                      color: sortMode === s ? 'var(--ember-glow)' : 'var(--slate-ghost)',
                      border: sortMode === s ? '1px solid rgba(232,148,26,0.15)' : '1px solid transparent',
                    }}
                  >
                    {s === 'days' ? '天数' : s === 'date' ? '日期' : '名称'}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus size={15} />
              添加
            </button>
          </div>
        </div>
      </RevealSection>

      {/* 添加/编辑表单 */}
      {showForm && (
        <div
          className="p-5 space-y-4 animate-fade-in-up"
          style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}>
              {editId ? '编辑计时日' : '添加计时日'}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}>
              <X size={16} />
            </button>
          </div>

          {/* 模式选择 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('countup')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === 'countup' ? 'var(--ember-soft)' : 'rgba(255,255,255,0.02)',
                  border: mode === 'countup' ? '1px solid rgba(232,148,26,0.2)' : '1px solid var(--whisper-border)',
                  color: mode === 'countup' ? 'var(--bright-chalk)' : 'var(--silver-mist)',
                }}
              >
                <ArrowUpCircle size={16} style={{ color: mode === 'countup' ? '#E8941A' : 'var(--slate-ghost)' }} />
                正数日（已过）
              </button>
              <button
                onClick={() => setMode('countdown')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === 'countdown' ? 'var(--teal-soft)' : 'rgba(255,255,255,0.02)',
                  border: mode === 'countdown' ? '1px solid rgba(78,205,196,0.2)' : '1px solid var(--whisper-border)',
                  color: mode === 'countdown' ? 'var(--bright-chalk)' : 'var(--silver-mist)',
                }}
              >
                <ArrowDownCircle size={16} style={{ color: mode === 'countdown' ? '#4ECDC4' : 'var(--slate-ghost)' }} />
                倒数日（未来）
              </button>
            </div>
          </div>

          {/* 选择分类 - 树形结构 */}
          {!editId && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>选择分类</label>
              <div className="max-h-52 overflow-y-auto rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--whisper-border)' }}>
                {availableCategories.length === 0 ? (
                  <p className="text-xs py-3 text-center" style={{ color: 'var(--slate-ghost)' }}>所有分类都已添加计时日</p>
                ) : (
                  <CategoryTreePicker
                    categories={categories}
                    availableCategories={availableCategories}
                    selectedId={selectedCatId}
                    onSelect={setSelectedCatId}
                    parentId={null}
                    level={0}
                  />
                )}
              </div>
            </div>
          )}

          {/* 日期 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>
              <Calendar size={14} />
              {mode === 'countup' ? '起始日期' : '目标日期'}
            </label>
            <input
              type="date"
              value={dateValue}
              onChange={e => setDateValue(e.target.value)}
              className="input-field"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>
              <StickyNote size={14} />
              备注（可选）
            </label>
            <input
              type="text"
              value={noteValue}
              onChange={e => setNoteValue(e.target.value)}
              placeholder="添加一句备注..."
              className="input-field"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!selectedCatId || !dateValue}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm w-full justify-center"
          >
            <Check size={15} />
            {editId ? '保存修改' : '确认添加'}
          </button>
        </div>
      )}

      {/* 计时日列表 - 按分类分组 */}
      {hasAny ? (
        <div className="space-y-2">
          {Array.from(groups.entries()).map(([parentId, items]) => {
            const parent = parentId ? categories.find(c => c.id === parentId) : null
            return (
              <RevealSection key={parentId || '__root'} delay={40}>
                <CategoryGroup
                  parent={parent ? { name: parent.name, color: parent.color } : null}
                  children={items}
                  now={now}
                  entries={entries}
                  allCategories={categories}
                  onEdit={startEdit}
                  onRemove={handleRemove}
                  onTogglePin={handleTogglePin}
                />
              </RevealSection>
            )
          })}
        </div>
      ) : (
        <RevealSection delay={60}>
          <div className="p-12 text-center" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--ember-soft)' }}>
              <Timer size={28} style={{ color: 'var(--ember-glow)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}>
              还没有计时日
            </h3>
            <p className="text-sm max-w-sm mx-auto mb-5" style={{ color: 'var(--silver-mist)' }}>
              记录你坚持一件事已经多久，或倒数某个重要目标的到来
            </p>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm mx-auto"
            >
              <Plus size={15} />
              添加计时日
            </button>
          </div>
        </RevealSection>
      )}
    </div>
  )
}
