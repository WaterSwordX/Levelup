import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveEntries, getCategoryPath } from '../store'
import CategoryPicker from '../components/CategoryPicker'
import { Plus, Trash2, Clock } from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  setEntries: (entries: TimeEntry[]) => void
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

const inputClass = "w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:shadow-[0_0_0_3px_rgba(88,166,255,0.15)] transition-all"

export default function Record({ categories, entries, setEntries }: Props) {
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !duration || Number(duration) <= 0) return

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      categoryId,
      description: description.trim(),
      duration: Number(duration),
      date,
      createdAt: new Date().toISOString(),
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    saveEntries(updated)
    setDescription('')
    setDuration('')
  }

  const handleDelete = (id: string) => {
    if (!confirm('确定删除这条记录吗？')) return
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    saveEntries(updated)
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">记录事件</h2>

      <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#8b949e] mb-1">选择分类</label>
          <CategoryPicker categories={categories} entries={entries} selectedId={categoryId} onSelect={setCategoryId} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#8b949e] mb-1">做了什么</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="例如：学习和弦进行"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1">时长（分钟）</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60" min="1" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8b949e] mb-1">日期</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <button
          type="submit"
          disabled={!categoryId || !duration || Number(duration) <= 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#238636] text-white text-sm rounded-lg hover:bg-[#2ea043] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          添加记录
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[#8b949e]">历史记录 ({entries.length})</h3>
        {sortedEntries.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center text-[#484f58] text-sm">
            还没有记录，添加你的第一条吧
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEntries.map(entry => {
              const cat = categories.find(c => c.id === entry.categoryId)
              return (
                <div key={entry.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-3 flex items-start gap-3 group hover:border-[#484f58] transition-colors">
                  <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: cat?.color ?? '#484f58' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#e6edf3] truncate">
                        {entry.description || getCategoryPath(entry.categoryId, categories)}
                      </span>
                      <span className="text-xs text-[#484f58] flex items-center gap-1">
                        <Clock size={12} />
                        {formatMinutes(entry.duration)}
                      </span>
                    </div>
                    <div className="text-xs text-[#484f58] mt-0.5">
                      {getCategoryPath(entry.categoryId, categories)} · {entry.date}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#484f58] hover:text-[#f85149] transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
