import { useState } from 'react'
import type { Category, TimeEntry, Goal } from '../types'
import { saveCategories, saveGoals, getGoalForCategory, getCategoryTotalTime, PRESET_COLORS } from '../store'
import CategoryTree from '../components/CategoryTree'
import RevealSection from '../components/RevealSection'
import { Plus, Pencil, Trash2, FolderPlus, Target, X, Check, Calendar, Timer } from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  setCategories: (cats: Category[]) => void
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
}

export default function Categories({ categories, entries, setCategories, goals, setGoals }: Props) {
  const [showAdd, setShowAdd] = useState<'top' | string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [goalCatId, setGoalCatId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [goalHours, setGoalHours] = useState('')
  const [startDate, setStartDate] = useState('')
  const [showCountdown, setShowCountdown] = useState(false)

  const handleAdd = () => {
    if (!name.trim()) return
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      parentId: showAdd === 'top' ? null : showAdd,
      color,
      createdAt: new Date().toISOString(),
      startDate: startDate || undefined,
      showCountdown: showCountdown || undefined,
    }
    const updated = [...categories, newCat]
    setCategories(updated)
    saveCategories(updated)
    setName('')
    setStartDate('')
    setShowCountdown(false)
    setShowAdd(null)
  }

  const handleEdit = () => {
    if (!name.trim() || !editId) return
    const updated = categories.map(c =>
      c.id === editId ? { ...c, name: name.trim(), color, startDate: startDate || undefined, showCountdown: showCountdown || undefined } : c
    )
    setCategories(updated)
    saveCategories(updated)
    setEditId(null)
    setName('')
    setStartDate('')
    setShowCountdown(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('删除分类将同时删除所有子分类，确定吗？')) return
    const toDelete = new Set<string>()
    const findDescendants = (parentId: string) => {
      toDelete.add(parentId)
      categories.filter(c => c.parentId === parentId).forEach(c => findDescendants(c.id))
    }
    findDescendants(id)
    const updated = categories.filter(c => !toDelete.has(c.id))
    setCategories(updated)
    saveCategories(updated)
    const updatedGoals = goals.filter(g => !toDelete.has(g.categoryId))
    setGoals(updatedGoals)
    saveGoals(updatedGoals)
  }

  const handleSaveGoal = () => {
    if (!goalCatId || !goalHours || Number(goalHours) <= 0) return
    const targetMinutes = Math.round(Number(goalHours) * 60)
    const existing = getGoalForCategory(goalCatId, goals)
    let updated: Goal[]
    if (existing) {
      updated = goals.map(g => g.id === existing.id ? { ...g, targetMinutes } : g)
    } else {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        categoryId: goalCatId,
        targetMinutes,
        createdAt: new Date().toISOString(),
      }
      updated = [...goals, newGoal]
    }
    setGoals(updated)
    saveGoals(updated)
    setGoalCatId(null)
    setGoalHours('')
  }

  const handleDeleteGoal = (categoryId: string) => {
    const updated = goals.filter(g => g.categoryId !== categoryId)
    setGoals(updated)
    saveGoals(updated)
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setName(cat.name)
    setColor(cat.color)
    setStartDate(cat.startDate || '')
    setShowCountdown(cat.showCountdown || false)
    setShowAdd(null)
    setGoalCatId(null)
  }

  const startGoal = (cat: Category) => {
    setGoalCatId(cat.id)
    const existing = getGoalForCategory(cat.id, goals)
    setGoalHours(existing ? String(existing.targetMinutes / 60) : '')
    setShowAdd(null)
    setEditId(null)
    setStartDate('')
    setShowCountdown(false)
  }

  const cancelForm = () => {
    setShowAdd(null)
    setEditId(null)
    setGoalCatId(null)
    setName('')
    setStartDate('')
    setShowCountdown(false)
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <RevealSection>
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              技能分类
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
              管理你的技能树
            </p>
          </div>
          <button
            onClick={() => { setShowAdd('top'); setName(''); setColor(PRESET_COLORS[categories.length % PRESET_COLORS.length]) }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={15} />
            添加大类
          </button>
        </div>
      </RevealSection>

      {/* Form */}
      {(showAdd !== null || editId !== null || goalCatId !== null) && (
        <div className="p-5 space-y-4" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              {editId ? '编辑分类' : goalCatId ? '设定目标' : showAdd === 'top' ? '添加大类' : '添加子类'}
            </h3>
            <button
              onClick={cancelForm}
              className="p-1.5 rounded-md transition-colors duration-150"
              style={{ color: 'var(--slate-ghost)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-surface)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <X size={16} />
            </button>
          </div>

          {goalCatId ? (
            <>
              <div className="text-sm" style={{ color: 'var(--silver-mist)' }}>
                为 <span className="font-semibold" style={{ color: 'var(--bright-chalk)' }}>{categories.find(c => c.id === goalCatId)?.name}</span> 设定目标小时数
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>目标小时数</label>
                <input
                  type="number"
                  value={goalHours}
                  onChange={e => setGoalHours(e.target.value)}
                  placeholder="例如：500"
                  min="1"
                  step="0.5"
                  className="input-field"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
                />
                <p className="text-[11px] mt-2" style={{ color: 'var(--slate-ghost)' }}>10000小时定律建议长期目标设为10000小时</p>
              </div>
              {getGoalForCategory(goalCatId, goals) && (
                <button
                  onClick={() => { handleDeleteGoal(goalCatId); setGoalCatId(null) }}
                  className="text-xs transition-colors duration-150"
                  style={{ color: 'var(--coral-pulse)' }}
                >
                  清除目标
                </button>
              )}
              <button
                onClick={handleSaveGoal}
                disabled={!goalHours || Number(goalHours) <= 0}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Check size={15} />
                保存目标
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="分类名称"
                className="input-field"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && (editId ? handleEdit() : handleAdd())}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--slate-ghost)' }}>颜色</span>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-all duration-150"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px var(--deep-void), 0 0 0 3px ${c}` : 'none',
                      transform: color === c ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>
                  <Calendar size={14} />
                  起始时间（可选）
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="input-field"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--slate-ghost)' }}>
                  选择你实际开始学习/练习此技能的日期，用于计算已持续时间
                </p>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background: showCountdown ? 'var(--ember-soft)' : 'rgba(255,255,255,0.02)',
                  border: showCountdown ? '1px solid rgba(232,148,26,0.2)' : '1px solid var(--whisper-border)',
                }}
                onClick={() => setShowCountdown(!showCountdown)}
              >
                <div className="flex items-center gap-2">
                  <Timer size={14} style={{ color: showCountdown ? '#E8941A' : 'var(--slate-ghost)' }} />
                  <div>
                    <span className="text-sm" style={{ color: showCountdown ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
                      倒数日卡片
                    </span>
                    <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                      在看板显示已持续天数
                    </p>
                  </div>
                </div>
                <div
                  className="w-10 h-5 rounded-full transition-all duration-200 relative"
                  style={{ background: showCountdown ? '#E8941A' : 'var(--slate-surface)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                    style={{
                      background: 'white',
                      left: showCountdown ? '22px' : '2px',
                    }}
                  />
                </div>
              </div>
              <button
                onClick={editId ? handleEdit : handleAdd}
                disabled={!name.trim()}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Check size={15} />
                {editId ? '保存' : '添加'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Category Tree */}
      <RevealSection delay={80}>
        <div className="p-3" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
          {categories.length === 0 && showAdd === null ? (
            <div className="p-10 text-center text-sm" style={{ color: 'var(--slate-ghost)' }}>
              还没有分类，点击上方「添加大类」开始
            </div>
          ) : (
            <CategoryTree
              categories={categories}
              entries={entries}
              showTime={true}
              renderActions={(cat) => {
                const goal = getGoalForCategory(cat.id, goals)
                const total = getCategoryTotalTime(cat.id, entries, categories)
                const percent = goal ? Math.min((total / goal.targetMinutes) * 100, 100) : 0
                return (
                  <div className="flex items-center gap-0.5">
                    {goal && (
                      <span
                        className="text-[10px] font-medium mr-1"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ember-glow)' }}
                      >
                        {percent.toFixed(0)}%
                      </span>
                    )}
                    <button
                      onClick={() => startGoal(cat)}
                      className="p-1.5 rounded-md transition-colors duration-150"
                      style={{ color: goal ? 'var(--ember-glow)' : 'var(--slate-ghost)' }}
                      title={goal ? '修改目标' : '设定目标'}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--ember-soft)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <Target size={13} />
                    </button>
                    <button
                      onClick={() => { setShowAdd(cat.id); setName(''); setColor(PRESET_COLORS[(categories.length + 1) % PRESET_COLORS.length]) }}
                      className="p-1.5 rounded-md transition-colors duration-150"
                      style={{ color: 'var(--slate-ghost)' }}
                      title="添加子类"
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-surface)'; e.currentTarget.style.color = 'var(--teal-flow)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--slate-ghost)' }}
                    >
                      <FolderPlus size={13} />
                    </button>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-md transition-colors duration-150"
                      style={{ color: 'var(--slate-ghost)' }}
                      title="编辑"
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-surface)'; e.currentTarget.style.color = 'var(--ember-glow)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--slate-ghost)' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-md transition-colors duration-150"
                      style={{ color: 'var(--slate-ghost)' }}
                      title="删除"
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--coral-soft)'; e.currentTarget.style.color = 'var(--coral-pulse)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--slate-ghost)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              }}
            />
          )}
        </div>
      </RevealSection>
    </div>
  )
}
