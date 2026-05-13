import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveCategories, getCategoryTotalTime, PRESET_COLORS } from '../store'
import RevealSection from '../components/RevealSection'
import ColorPicker from '../components/ColorPicker'
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

// ─── 正数日卡片 ──────────────────────────────────────────

function CountUpCard({
  category, totalDays, now, entries, allCategories,
  onEdit, onRemove, onTogglePin,
}: {
  category: Category
  totalDays: number
  now: Date
  entries: TimeEntry[]
  allCategories: Category[]
  onEdit: () => void
  onRemove: () => void
  onTogglePin: () => void
}) {
  const total = getCategoryTotalTime(category.id, entries, allCategories)
  const bd = breakDownDays(totalDays, now, category.startDate!)
  const dateObj = new Date(category.startDate! + 'T00:00:00')

  return (
    <div
      className="relative overflow-hidden rounded-2xl group"
      style={{
        background: `linear-gradient(150deg, ${category.color}14, ${category.color}06, rgba(232,148,26,0.02))`,
        border: `1px solid ${category.color}1a`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}30, transparent)` }} />
      <div
        className="absolute -right-2 -top-5 select-none pointer-events-none"
        style={{ fontSize: '110px', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: `${category.color}06`, WebkitTextStroke: `1px ${category.color}0a` }}
      >
        {totalDays}
      </div>

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {category.pinned && <Pin size={11} style={{ color: category.color }} className="shrink-0" />}
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color, boxShadow: `0 0 8px ${category.color}40` }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--bright-chalk)' }}>{category.name}</span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onTogglePin} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}>{category.pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}><Pencil size={12} /></button>
            <button onClick={onRemove} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}><Trash2 size={12} /></button>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-black tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: category.color }}>{totalDays}</span>
          <span className="text-lg font-medium" style={{ color: 'var(--silver-mist)' }}>天</span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--silver-mist)' }}>
          {category.name}已经 <span className="font-semibold" style={{ color: 'var(--bright-chalk)' }}>{totalDays}</span> 天了
        </p>

        {category.note && (
          <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'var(--inset-bg)' }}>
            <StickyNote size={11} className="shrink-0 mt-0.5" style={{ color: 'var(--slate-ghost)' }} />
            <p className="text-xs" style={{ color: 'var(--silver-mist)' }}>{category.note}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden" style={{ background: 'var(--inset-bg)' }}>
          {[
            { val: bd.years, label: '年' },
            { val: bd.months, label: '月' },
            { val: bd.weeks, label: '周' },
            { val: total > 0 ? Math.round(total / 60) : null, label: '小时' },
          ].map((item, i) => (
            <div key={item.label} className="text-center py-2 px-2" style={i < 3 ? { borderRight: '1px solid var(--whisper-border)' } : undefined}>
              <div className="text-base font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}>
                {item.val ?? '—'}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>从 {fmtDate(dateObj)} 至今</p>
          {total > 0 && <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>累计 {formatMinutes(total)}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── 倒数日卡片 ──────────────────────────────────────────

function CountDownCard({
  category, totalDays, now, entries, allCategories,
  onEdit, onRemove, onTogglePin,
}: {
  category: Category
  totalDays: number
  now: Date
  entries: TimeEntry[]
  allCategories: Category[]
  onEdit: () => void
  onRemove: () => void
  onTogglePin: () => void
}) {
  const total = getCategoryTotalTime(category.id, entries, allCategories)
  const bd = breakDownDays(totalDays, now, category.targetDate!)
  const dateObj = new Date(category.targetDate! + 'T00:00:00')

  return (
    <div
      className="relative overflow-hidden rounded-2xl group"
      style={{
        background: `linear-gradient(150deg, ${category.color}10, ${category.color}05, rgba(78,205,196,0.02))`,
        border: `1px solid ${category.color}15`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}30, transparent)` }} />
      <div
        className="absolute -right-2 -top-5 select-none pointer-events-none"
        style={{ fontSize: '110px', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, color: `${category.color}06`, WebkitTextStroke: `1px ${category.color}0a` }}
      >
        {totalDays}
      </div>

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {category.pinned && <Pin size={11} style={{ color: category.color }} className="shrink-0" />}
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color, boxShadow: `0 0 8px ${category.color}40` }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--bright-chalk)' }}>{category.name}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: `${category.color}18`, color: category.color }}>倒数</span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onTogglePin} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}>{category.pinned ? <PinOff size={12} /> : <Pin size={12} />}</button>
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}><Pencil size={12} /></button>
            <button onClick={onRemove} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}><Trash2 size={12} /></button>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-black tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: category.color }}>{totalDays}</span>
          <span className="text-lg font-medium" style={{ color: 'var(--silver-mist)' }}>天</span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--silver-mist)' }}>
          距离{category.name}还有 <span className="font-semibold" style={{ color: 'var(--bright-chalk)' }}>{totalDays}</span> 天
        </p>

        {category.note && (
          <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'var(--inset-bg)' }}>
            <StickyNote size={11} className="shrink-0 mt-0.5" style={{ color: 'var(--slate-ghost)' }} />
            <p className="text-xs" style={{ color: 'var(--silver-mist)' }}>{category.note}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-0 rounded-xl overflow-hidden" style={{ background: 'var(--inset-bg)' }}>
          {[
            { val: bd.months + bd.years * 12, label: '月' },
            { val: bd.weeks, label: '周' },
            { val: bd.totalDays, label: '天' },
          ].map((item, i) => (
            <div key={item.label} className="text-center py-2 px-2" style={i < 2 ? { borderRight: '1px solid var(--whisper-border)' } : undefined}>
              <div className="text-base font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}>{item.val}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>目标 {fmtDate(dateObj)}</p>
          {total > 0 && <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>累计 {formatMinutes(total)}</p>}
        </div>
      </div>
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
  const children = categories.filter(c => c.parentId === parentId)
  const visible = children.filter(c => {
    if (availableCategories.some(a => a.id === c.id)) return true
    const has = (id: string): boolean => categories.some(cc => cc.parentId === id && (availableCategories.some(a => a.id === cc.id) || has(cc.id)))
    return has(c.id)
  })
  if (visible.length === 0) return null

  return (
    <div className={level > 0 ? 'ml-4 pl-2.5' : ''} style={level > 0 ? { borderLeft: '1px solid var(--whisper-border)' } : undefined}>
      {visible.map(cat => {
        const avail = availableCategories.some(a => a.id === cat.id)
        const sel = selectedId === cat.id
        const hasKids = categories.some(cc => cc.parentId === cat.id && (availableCategories.some(a => a.id === cc.id) || categories.some(ccc => ccc.parentId === cc.id)))
        return <TreePickerNode key={cat.id} cat={cat} categories={categories} availableCategories={availableCategories} selectedId={selectedId} onSelect={onSelect} isAvail={avail} isSel={sel} hasKids={hasKids} level={level} />
      })}
    </div>
  )
}

function TreePickerNode({ cat, categories, availableCategories, selectedId, onSelect, isAvail, isSel, hasKids, level }: {
  cat: Category; categories: Category[]; availableCategories: Category[]; selectedId: string; onSelect: (id: string) => void
  isAvail: boolean; isSel: boolean; hasKids: boolean; level: number
}) {
  const [expanded, setExpanded] = useState(level < 1)
  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-150"
        style={{ background: isSel ? 'var(--ember-soft)' : 'transparent', cursor: isAvail ? 'pointer' : 'default', opacity: isAvail ? 1 : 0.5 }}
        onClick={() => { if (isAvail) onSelect(cat.id) }}
      >
        {hasKids ? (
          <button className="p-0.5 rounded shrink-0" style={{ color: 'var(--slate-ghost)' }} onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : <span className="w-4 shrink-0" />}
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
        <span className="text-sm flex-1 truncate" style={{ color: isSel ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>{cat.name}</span>
        {isSel && <Check size={13} style={{ color: '#E8941A' }} className="shrink-0" />}
      </div>
      {expanded && hasKids && <CategoryTreePicker categories={categories} availableCategories={availableCategories} selectedId={selectedId} onSelect={onSelect} parentId={cat.id} level={level + 1} />}
    </div>
  )
}

// ─── 今日指示器 ──────────────────────────────────────────

function TodayPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
      <span className="text-xs font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color }}>{count}</span>
      <span className="text-[11px]" style={{ color: 'var(--silver-mist)' }}>{label}</span>
    </div>
  )
}

// ─── 主页面 ──────────────────────────────────────────────────

export default function Days({ categories, entries, setCategories }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedCatId, setSelectedCatId] = useState('')
  const [standaloneMode, setStandaloneMode] = useState(false)
  const [standaloneName, setStandaloneName] = useState('')
  const [standaloneColor, setStandaloneColor] = useState(PRESET_COLORS[0])
  const [mode, setMode] = useState<'countup' | 'countdown'>('countup')
  const [dateValue, setDateValue] = useState('')
  const [noteValue, setNoteValue] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('days')

  const now = new Date()
  const todayStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`

  const activeCategories = categories
    .filter(c => c.showCountdown && (c.startDate || c.targetDate))
    .map(c => {
      const isCd = c.countdownMode === 'countdown'
      const ds = isCd ? c.targetDate! : c.startDate!
      return { category: c, totalDays: Math.abs(diffDays(ds, now)), mode: isCd ? 'countdown' as const : 'countup' as const }
    })

  const sortFn = (a: typeof activeCategories[0], b: typeof activeCategories[0]) => {
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
  }

  const countupItems = activeCategories.filter(a => a.mode === 'countup').sort(sortFn)
  const countdownItems = activeCategories.filter(a => a.mode === 'countdown').sort(sortFn)

  const availableCategories = categories.filter(c => !c.showCountdown)

  const resetForm = () => {
    setShowForm(false); setEditId(null); setSelectedCatId('')
    setStandaloneMode(false); setStandaloneName(''); setStandaloneColor(PRESET_COLORS[0])
    setDateValue(''); setNoteValue(''); setMode('countup')
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id); setSelectedCatId(cat.id)
    setMode(cat.countdownMode || 'countup')
    setDateValue(cat.countdownMode === 'countdown' ? (cat.targetDate || '') : (cat.startDate || ''))
    setNoteValue(cat.note || '')
    if (!cat.parentId) { setStandaloneMode(true); setStandaloneName(cat.name); setStandaloneColor(cat.color) }
    setShowForm(true)
  }

  const handleSave = () => {
    if (!dateValue) return
    if (!standaloneMode && !selectedCatId) return
    if (standaloneMode && !standaloneName.trim()) return
    const isCd = mode === 'countdown'

    if (standaloneMode) {
      if (editId) {
        const updated = categories.map(c => c.id === editId ? {
          ...c, name: standaloneName.trim(), color: standaloneColor,
          countdownMode: mode, startDate: isCd ? undefined : dateValue, targetDate: isCd ? dateValue : undefined, note: noteValue || undefined,
        } : c)
        setCategories(updated); saveCategories(updated)
      } else {
        const newCat: Category = {
          id: crypto.randomUUID(), name: standaloneName.trim(), parentId: null,
          color: standaloneColor, createdAt: new Date().toISOString(),
          showCountdown: true, countdownMode: mode,
          startDate: isCd ? undefined : dateValue, targetDate: isCd ? dateValue : undefined,
          note: noteValue || undefined,
        }
        const updated = [...categories, newCat]; setCategories(updated); saveCategories(updated)
      }
    } else {
      const updated = categories.map(c => c.id === selectedCatId ? {
        ...c, showCountdown: true, countdownMode: mode,
        startDate: isCd ? undefined : dateValue, targetDate: isCd ? dateValue : undefined, note: noteValue || undefined,
      } : c)
      setCategories(updated); saveCategories(updated)
    }
    resetForm()
  }

  const handleRemove = (catId: string) => {
    if (!confirm('移除此计时日？')) return
    const updated = categories.map(c => c.id === catId ? { ...c, showCountdown: false, startDate: undefined, targetDate: undefined, countdownMode: undefined } : c)
    setCategories(updated); saveCategories(updated)
  }

  const handleTogglePin = (cat: Category) => {
    const updated = categories.map(c => c.id === cat.id ? { ...c, pinned: !c.pinned } : c)
    setCategories(updated); saveCategories(updated)
  }

  const hasAny = activeCategories.length > 0
  const hasBoth = countupItems.length > 0 && countdownItems.length > 0

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* ─── 顶部标题栏 ─── */}
      <RevealSection>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}>计时日</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>记录坚持的每一天</p>
          </div>
          <div className="flex items-center gap-2">
            {hasAny && (
              <div className="flex items-center gap-1">
                {(['days', 'date', 'name'] as SortMode[]).map(s => (
                  <button key={s} onClick={() => setSortMode(s)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                    style={{ background: sortMode === s ? 'var(--ember-soft)' : 'transparent', color: sortMode === s ? 'var(--ember-glow)' : 'var(--slate-ghost)', border: sortMode === s ? '1px solid rgba(232,148,26,0.15)' : '1px solid transparent' }}>
                    {s === 'days' ? '天数' : s === 'date' ? '日期' : '名称'}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={15} /> 添加
            </button>
          </div>
        </div>
      </RevealSection>

      {/* ─── 今日中心轴 ─── */}
      {hasAny && (
        <RevealSection delay={20}>
          <div
            className="relative flex items-center justify-center py-3 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, rgba(232,148,26,0.04), rgba(78,205,196,0.04))',
              border: '1px solid var(--whisper-border)',
            }}
          >
            {/* 左侧渐变线 */}
            <div className="absolute left-4 right-1/2 top-1/2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,148,26,0.3))' }} />
            {/* 右侧渐变线 */}
            <div className="absolute left-1/2 right-4 top-1/2 h-px" style={{ background: 'linear-gradient(90deg, rgba(78,205,196,0.3), transparent)' }} />

            <div className="relative flex items-center gap-4 px-5">
              {countupItems.length > 0 && <TodayPill count={countupItems.length} label="已出发" color="#E8941A" />}
              <div className="flex flex-col items-center px-3">
                <span className="text-[10px] font-medium" style={{ color: 'var(--slate-ghost)' }}>TODAY</span>
                <span className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}>{todayStr}</span>
              </div>
              {countdownItems.length > 0 && <TodayPill count={countdownItems.length} label="在途中" color="#4ECDC4" />}
            </div>
          </div>
        </RevealSection>
      )}

      {/* ─── 表单 ─── */}
      {showForm && (
        <div className="p-5 space-y-4 animate-fade-in-up" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}>{editId ? '编辑计时日' : '添加计时日'}</h3>
            <button onClick={resetForm} className="p-1.5 rounded-md" style={{ color: 'var(--slate-ghost)' }}><X size={16} /></button>
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('countup')} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: mode === 'countup' ? 'var(--ember-soft)' : 'var(--hover-bg)', border: mode === 'countup' ? '1px solid rgba(232,148,26,0.2)' : '1px solid var(--whisper-border)', color: mode === 'countup' ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
                <ArrowUpCircle size={16} style={{ color: mode === 'countup' ? '#E8941A' : 'var(--slate-ghost)' }} /> 正数日（已过）
              </button>
              <button onClick={() => setMode('countdown')} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ background: mode === 'countdown' ? 'var(--teal-soft)' : 'var(--hover-bg)', border: mode === 'countdown' ? '1px solid rgba(78,205,196,0.2)' : '1px solid var(--whisper-border)', color: mode === 'countdown' ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
                <ArrowDownCircle size={16} style={{ color: mode === 'countdown' ? '#4ECDC4' : 'var(--slate-ghost)' }} /> 倒数日（未来）
              </button>
            </div>
          </div>

          {/* 分类 */}
          {!editId && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>分类</label>
              <div className="flex gap-2 mb-3">
                <button onClick={() => { setStandaloneMode(false); setStandaloneName('') }} className="flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{ background: !standaloneMode ? 'var(--ember-soft)' : 'var(--hover-bg)', border: !standaloneMode ? '1px solid rgba(232,148,26,0.15)' : '1px solid var(--whisper-border)', color: !standaloneMode ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
                  选择已有分类
                </button>
                <button onClick={() => { setStandaloneMode(true); setSelectedCatId('') }} className="flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                  style={{ background: standaloneMode ? 'var(--ember-soft)' : 'var(--hover-bg)', border: standaloneMode ? '1px solid rgba(232,148,26,0.15)' : '1px solid var(--whisper-border)', color: standaloneMode ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
                  直接添加
                </button>
              </div>
              {standaloneMode ? (
                <div className="space-y-3">
                  <input type="text" value={standaloneName} onChange={e => setStandaloneName(e.target.value)} placeholder="输入名称，如：学吉他、备考雅思..." className="input-field" autoFocus />
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto rounded-xl p-2" style={{ background: 'var(--inset-bg)', border: '1px solid var(--whisper-border)' }}>
                  {availableCategories.length === 0 ? (
                    <p className="text-xs py-3 text-center" style={{ color: 'var(--slate-ghost)' }}>所有分类都已添加计时日</p>
                  ) : (
                    <CategoryTreePicker categories={categories} availableCategories={availableCategories} selectedId={selectedCatId} onSelect={setSelectedCatId} parentId={null} level={0} />
                  )}
                </div>
              )}
            </div>
          )}

          {/* 颜色选择器 */}
          {(standaloneMode || (editId && !categories.find(c => c.id === editId)?.parentId)) && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>颜色</label>
              <ColorPicker value={standaloneColor} onChange={setStandaloneColor} />
            </div>
          )}

          {/* 日期 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}><Calendar size={14} /> {mode === 'countup' ? '起始日期' : '目标日期'}</label>
            <input type="date" value={dateValue} onChange={e => setDateValue(e.target.value)} className="input-field" style={{ fontFamily: "'JetBrains Mono', monospace" }} />
          </div>

          {/* 备注 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}><StickyNote size={14} /> 备注（可选）</label>
            <input type="text" value={noteValue} onChange={e => setNoteValue(e.target.value)} placeholder="添加一句备注..." className="input-field" />
          </div>

          <button onClick={handleSave} disabled={!dateValue || (!standaloneMode && !selectedCatId) || (standaloneMode && !standaloneName.trim())}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm w-full justify-center">
            <Check size={15} /> {editId ? '保存修改' : '确认添加'}
          </button>
        </div>
      )}

      {/* ─── 双栏时间轴布局 ─── */}
      {hasAny && (
        <div className={`grid gap-4 ${hasBoth ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* ─── 左栏：正数日 ─── */}
          {countupItems.length > 0 && (
            <RevealSection delay={40}>
              <div className="space-y-3">
                <h3 className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: 'var(--bright-chalk)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(232,148,26,0.1)', border: '1px solid rgba(232,148,26,0.15)' }}>
                    <ArrowUpCircle size={13} style={{ color: '#E8941A' }} />
                    <span style={{ color: '#E8941A', fontSize: '11px' }}>正数日</span>
                  </div>
                  <span style={{ color: 'var(--silver-mist)', fontSize: '12px' }}>已经过去</span>
                  <span className="ml-auto text-[11px] font-normal" style={{ color: 'var(--slate-ghost)', fontFamily: "'JetBrains Mono', monospace" }}>{countupItems.length}</span>
                </h3>
                <div className="space-y-3">
                  {countupItems.map(({ category, totalDays }) => (
                    <CountUpCard key={category.id} category={category} totalDays={totalDays} now={now} entries={entries} allCategories={categories}
                      onEdit={() => startEdit(category)} onRemove={() => handleRemove(category.id)} onTogglePin={() => handleTogglePin(category)} />
                  ))}
                </div>
              </div>
            </RevealSection>
          )}

          {/* ─── 右栏：倒数日 ─── */}
          {countdownItems.length > 0 && (
            <RevealSection delay={60}>
              <div className="space-y-3">
                <h3 className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: 'var(--bright-chalk)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.15)' }}>
                    <ArrowDownCircle size={13} style={{ color: '#4ECDC4' }} />
                    <span style={{ color: '#4ECDC4', fontSize: '11px' }}>倒数日</span>
                  </div>
                  <span style={{ color: 'var(--silver-mist)', fontSize: '12px' }}>即将到来</span>
                  <span className="ml-auto text-[11px] font-normal" style={{ color: 'var(--slate-ghost)', fontFamily: "'JetBrains Mono', monospace" }}>{countdownItems.length}</span>
                </h3>
                <div className="space-y-3">
                  {countdownItems.map(({ category, totalDays }) => (
                    <CountDownCard key={category.id} category={category} totalDays={totalDays} now={now} entries={entries} allCategories={categories}
                      onEdit={() => startEdit(category)} onRemove={() => handleRemove(category.id)} onTogglePin={() => handleTogglePin(category)} />
                  ))}
                </div>
              </div>
            </RevealSection>
          )}
        </div>
      )}

      {/* ─── 空状态 ─── */}
      {!hasAny && (
        <RevealSection delay={60}>
          <div className="p-12 text-center" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--ember-soft)' }}>
              <Timer size={28} style={{ color: 'var(--ember-glow)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}>还没有计时日</h3>
            <p className="text-sm max-w-sm mx-auto mb-5" style={{ color: 'var(--silver-mist)' }}>记录你坚持一件事已经多久，或倒数某个重要目标的到来</p>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm mx-auto">
              <Plus size={15} /> 添加计时日
            </button>
          </div>
        </RevealSection>
      )}
    </div>
  )
}
