import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveEntries, getCategoryPath } from '../store'
import CategoryPicker from '../components/CategoryPicker'
import Timer from '../components/Timer'
import RevealSection from '../components/RevealSection'
import { Check, Flame } from 'lucide-react'

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
  const [startTime, setStartTime] = useState('')

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
      startTime: startTime.trim() || undefined,
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    saveEntries(updated)
    setShowForm(false)
    setDescription('')
    setStartTime('')
    setPendingDuration(0)
  }

  const handleDiscard = () => {
    setShowForm(false)
    setDescription('')
    setStartTime('')
    setPendingDuration(0)
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(e => e.date === today)
  const todayTotal = todayEntries.reduce((s, e) => s + e.duration, 0)

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      <div className="art-line" style={{ top: '40px', right: '-20px' }} />
      <div className="art-dot" style={{ top: '80px', left: '60px', animationDelay: '-1s' }} />

      <RevealSection>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            专注计时
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
            沉浸在练习中，让时间为你积累
          </p>
        </div>
      </RevealSection>

      <RevealSection delay={50}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>选择技能分类</label>
          <CategoryPicker categories={categories} entries={entries} selectedId={categoryId} onSelect={setCategoryId} />
        </div>
      </RevealSection>

      <RevealSection delay={100}>
        <div className="p-8 md:p-12" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
          <Timer onFinish={handleTimerFinish} disabled={!categoryId} />
        </div>
      </RevealSection>

      {showForm && (
        <div
          className="p-5 space-y-4 animate-fade-in-up"
          style={{
            background: 'var(--carbon-base)',
            border: '1px solid var(--ember-ghost)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--ember-glow)' }}>
            <Check size={16} />
            <span>专注完成</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pendingDuration}</span> 分钟
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>做了什么（可选）</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="简要描述本次专注内容"
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>开始时间（可选）</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              保存记录
            </button>
            <button
              onClick={handleDiscard}
              className="btn-ghost px-5 py-2.5 text-sm"
            >
              放弃
            </button>
          </div>
        </div>
      )}

      {todayEntries.length > 0 && (
        <RevealSection delay={80}>
          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2">
              <Flame size={13} style={{ color: '#E86B6B' }} />
              <span>今日专注</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>共 {todayTotal} 分钟</span>
            </h3>
            <div style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div className="divide-y" style={{ borderColor: 'var(--whisper-border)' }}>
                {todayEntries.map(entry => {
                  const cat = categories.find(c => c.id === entry.categoryId)
                  return (
                    <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat?.color ?? 'var(--slate-ghost)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: 'var(--bright-chalk)' }}>
                          {entry.description || getCategoryPath(entry.categoryId, categories)}
                        </div>
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--silver-mist)' }}
                      >
                        {entry.duration}分钟
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </RevealSection>
      )}

      {!categoryId && categories.length === 0 && (
        <div
          className="p-10 text-center text-sm"
          style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)', color: 'var(--slate-ghost)' }}
        >
          请先在「分类」页面添加技能分类
        </div>
      )}
    </div>
  )
}
