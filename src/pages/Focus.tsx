import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveEntries, getCategoryPath } from '../store'
import CategoryPicker from '../components/CategoryPicker'
import Timer from '../components/Timer'
import { Check } from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  setEntries: (entries: TimeEntry[]) => void
}

export default function Focus({ categories, entries, setEntries }: Props) {
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDuration, setPendingDuration] = useState(0)
  const [description, setDescription] = useState('')

  const handleTimerFinish = (durationMinutes: number) => {
    setPendingDuration(durationMinutes)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!categoryId) return
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      categoryId,
      description: description.trim(),
      duration: pendingDuration,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    saveEntries(updated)
    setShowForm(false)
    setDescription('')
    setPendingDuration(0)
  }

  const handleDiscard = () => {
    setShowForm(false)
    setDescription('')
    setPendingDuration(0)
  }

  // 今日专注记录
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(e => e.date === today)
  const todayTotal = todayEntries.reduce((s, e) => s + e.duration, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800">专注计时</h2>

      {/* 分类选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">选择技能分类</label>
        <CategoryPicker
          categories={categories}
          entries={entries}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />
      </div>

      {/* 计时器 */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <Timer onFinish={handleTimerFinish} disabled={!categoryId} />
      </div>

      {/* 结束后弹出的保存表单 */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-3">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Check size={16} />
            专注完成！共 {pendingDuration} 分钟
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">做了什么（可选）</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="简要描述本次专注内容"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存记录
            </button>
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-gray-500 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              放弃
            </button>
          </div>
        </div>
      )}

      {/* 今日专注记录 */}
      {todayEntries.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">今日专注 · 共 {todayTotal} 分钟</h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {todayEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId)
              return (
                <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat?.color ?? '#9ca3af' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 truncate">
                      {entry.description || getCategoryPath(entry.categoryId, categories)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{entry.duration}分钟</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 空状态提示 */}
      {!categoryId && categories.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          请先在"分类"页面添加技能分类
        </div>
      )}
    </div>
  )
}
