import { useState } from 'react'
import type { Category, TimeEntry, Goal } from '../types'
import { saveCategories, saveGoals, getGoalForCategory, getCategoryTotalTime, PRESET_COLORS } from '../store'
import CategoryTree from '../components/CategoryTree'
import { Plus, Pencil, Trash2, FolderPlus, Target, X, Check } from 'lucide-react'

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

  const handleAdd = () => {
    if (!name.trim()) return
    const newCat: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      parentId: showAdd === 'top' ? null : showAdd,
      color,
      createdAt: new Date().toISOString(),
    }
    const updated = [...categories, newCat]
    setCategories(updated)
    saveCategories(updated)
    setName('')
    setShowAdd(null)
  }

  const handleEdit = () => {
    if (!name.trim() || !editId) return
    const updated = categories.map(c =>
      c.id === editId ? { ...c, name: name.trim(), color } : c
    )
    setCategories(updated)
    saveCategories(updated)
    setEditId(null)
    setName('')
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
    // 同时删除关联目标
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
    setShowAdd(null)
    setGoalCatId(null)
  }

  const startGoal = (cat: Category) => {
    setGoalCatId(cat.id)
    const existing = getGoalForCategory(cat.id, goals)
    setGoalHours(existing ? String(existing.targetMinutes / 60) : '')
    setShowAdd(null)
    setEditId(null)
  }

  const cancelForm = () => {
    setShowAdd(null)
    setEditId(null)
    setGoalCatId(null)
    setName('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">技能分类</h2>
        <button
          onClick={() => { setShowAdd('top'); setName(''); setColor(PRESET_COLORS[categories.length % PRESET_COLORS.length]) }}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          添加大类
        </button>
      </div>

      {/* 添加/编辑/目标表单 */}
      {(showAdd !== null || editId !== null || goalCatId !== null) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              {editId ? '编辑分类' : goalCatId ? '设定目标' : showAdd === 'top' ? '添加大类' : '添加子类'}
            </h3>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {goalCatId ? (
            <>
              <div className="text-sm text-gray-500">
                为 <span className="font-medium text-gray-700">{categories.find(c => c.id === goalCatId)?.name}</span> 设定目标小时数
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标小时数</label>
                <input
                  type="number"
                  value={goalHours}
                  onChange={e => setGoalHours(e.target.value)}
                  placeholder="例如：500"
                  min="1"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
                />
                <p className="text-xs text-gray-400 mt-1">10000小时定律建议长期目标设为10000小时</p>
              </div>
              {getGoalForCategory(goalCatId, goals) && (
                <button
                  onClick={() => { handleDeleteGoal(goalCatId); setGoalCatId(null) }}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  清除目标
                </button>
              )}
              <button
                onClick={handleSaveGoal}
                disabled={!goalHours || Number(goalHours) <= 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={16} />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && (editId ? handleEdit() : handleAdd())}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">颜色：</span>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={editId ? handleEdit : handleAdd}
                disabled={!name.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={16} />
                {editId ? '保存' : '添加'}
              </button>
            </>
          )}
        </div>
      )}

      {/* 分类树 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        {categories.length === 0 && showAdd === null ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            还没有分类，点击上方"添加大类"开始
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
                    <span className="text-[10px] text-gray-400 mr-1">{percent.toFixed(0)}%</span>
                  )}
                  <button
                    onClick={() => startGoal(cat)}
                    className={`p-1 rounded transition-colors ${goal ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
                    title={goal ? '修改目标' : '设定目标'}
                  >
                    <Target size={14} />
                  </button>
                  <button
                    onClick={() => { setShowAdd(cat.id); setName(''); setColor(PRESET_COLORS[(categories.length + 1) % PRESET_COLORS.length]) }}
                    className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    title="添加子类"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors"
                    title="编辑"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }}
          />
        )}
      </div>
    </div>
  )
}
