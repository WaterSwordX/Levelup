import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveEntries, getCategoryPath } from '../store'
import CategoryPicker from '../components/CategoryPicker'
import RevealSection from '../components/RevealSection'
import TiltCard from '../components/TiltCard'
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
    <div className="space-y-6 animate-fade-in-up">
      <RevealSection>
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            记录事件
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--slate-ghost)' }}>
            手动记录你的技能练习时间
          </p>
        </div>
      </RevealSection>

      <RevealSection delay={80}>
        <TiltCard className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>选择分类</label>
              <CategoryPicker categories={categories} entries={entries} selectedId={categoryId} onSelect={setCategoryId} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>做了什么</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="例如：学习和弦进行"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>时长（分钟）</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="60"
                  min="1"
                  className="input-field"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>日期</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!categoryId || !duration || Number(duration) <= 0}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Plus size={16} />
              添加记录
            </button>
          </form>
        </TiltCard>
      </RevealSection>

      <RevealSection delay={150}>
        <div className="space-y-3">
          <h3 className="section-title">历史记录 ({entries.length})</h3>
          {sortedEntries.length === 0 ? (
            <div className="glass-card p-10 text-center text-sm" style={{ color: 'var(--slate-ghost)' }}>
              还没有记录，添加你的第一条吧
            </div>
          ) : (
            <div className="space-y-2">
              {sortedEntries.map((entry, i) => {
                const cat = categories.find(c => c.id === entry.categoryId)
                return (
                  <div
                    key={entry.id}
                    className="glass-card p-4 flex items-start gap-3 group animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: cat?.color ?? 'var(--slate-ghost)', boxShadow: `0 0 6px ${cat?.color ?? 'var(--slate-ghost)'}60` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--bright-chalk)' }}>
                          {entry.description || getCategoryPath(entry.categoryId, categories)}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--slate-ghost)' }}>
                          <Clock size={12} />
                          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatMinutes(entry.duration)}</span>
                        </span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
                        {getCategoryPath(entry.categoryId, categories)} · {entry.date}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200"
                      style={{ color: 'var(--slate-ghost)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--coral-pulse)'; e.currentTarget.style.background = 'var(--coral-soft)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-ghost)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </RevealSection>
    </div>
  )
}
