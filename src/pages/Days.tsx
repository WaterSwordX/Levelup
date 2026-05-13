import { useState } from 'react'
import type { Category, TimeEntry } from '../types'
import { saveCategories, getCategoryTotalTime } from '../store'
import RevealSection from '../components/RevealSection'
import { Plus, X, Check, Calendar, Timer } from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  setCategories: (cats: Category[]) => void
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

export default function Days({ categories, entries, setCategories }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState('')
  const [startDate, setStartDate] = useState('')

  const now = new Date()

  // 已开启倒数日的分类
  const countdownCategories = categories
    .filter(c => c.showCountdown && c.startDate)
    .map(c => {
      const start = new Date(c.startDate + 'T00:00:00')
      const diffMs = now.getTime() - start.getTime()
      const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
      return { category: c, days, startDate: start }
    })
    .sort((a, b) => b.days - a.days)

  // 未开启倒数日的分类（用于添加）
  const availableCategories = categories.filter(c => !c.showCountdown || !c.startDate)

  const handleAdd = () => {
    if (!selectedCatId || !startDate) return
    const updated = categories.map(c =>
      c.id === selectedCatId ? { ...c, startDate, showCountdown: true } : c
    )
    setCategories(updated)
    saveCategories(updated)
    setShowForm(false)
    setSelectedCatId('')
    setStartDate('')
  }

  const handleRemove = (catId: string) => {
    if (!confirm('关闭此分类的正计时日？')) return
    const updated = categories.map(c =>
      c.id === catId ? { ...c, showCountdown: false } : c
    )
    setCategories(updated)
    saveCategories(updated)
  }

  const handleUpdateDate = (catId: string, newDate: string) => {
    const updated = categories.map(c =>
      c.id === catId ? { ...c, startDate: newDate } : c
    )
    setCategories(updated)
    saveCategories(updated)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <RevealSection>
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              正计时日
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
              记录每件事已经坚持了多久
            </p>
          </div>
          {availableCategories.length > 0 && (
            <button
              onClick={() => { setShowForm(true); setSelectedCatId(''); setStartDate('') }}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus size={15} />
              添加
            </button>
          )}
        </div>
      </RevealSection>

      {/* 添加表单 */}
      {showForm && (
        <div
          className="p-5 space-y-4 animate-fade-in-up"
          style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              添加正计时日
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-md transition-colors duration-150"
              style={{ color: 'var(--slate-ghost)' }}
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>
              选择分类
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {availableCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: selectedCatId === cat.id ? 'var(--ember-soft)' : 'rgba(255,255,255,0.02)',
                    border: selectedCatId === cat.id ? '1px solid rgba(232,148,26,0.2)' : '1px solid var(--whisper-border)',
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}50` }}
                  />
                  <span className="text-sm flex-1" style={{ color: selectedCatId === cat.id ? 'var(--bright-chalk)' : 'var(--silver-mist)' }}>
                    {cat.name}
                  </span>
                  {selectedCatId === cat.id && (
                    <Check size={14} style={{ color: '#E8941A' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>
              <Calendar size={14} />
              起始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="input-field"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--slate-ghost)' }}>
              选择你实际开始做这件事的日期
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedCatId || !startDate}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm w-full justify-center"
          >
            <Check size={15} />
            确认添加
          </button>
        </div>
      )}

      {/* 正计时日列表 */}
      {countdownCategories.length > 0 ? (
        <div className="space-y-4">
          {countdownCategories.map(({ category, days, startDate: start }, index) => {
            const total = getCategoryTotalTime(category.id, entries, categories)
            const weeks = Math.floor(days / 7)
            const months = Math.floor(days / 30.44)
            const years = Math.floor(days / 365.25)
            const startStr = `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')}`

            return (
              <RevealSection key={category.id} delay={index * 60}>
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    background: `linear-gradient(160deg, ${category.color}15, ${category.color}05, transparent)`,
                    border: `1px solid ${category.color}20`,
                  }}
                >
                  {/* 顶部渐变条 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}40, transparent)` }}
                  />

                  {/* 装饰性大数字 */}
                  <div
                    className="absolute -right-2 -top-6 select-none pointer-events-none"
                    style={{
                      fontSize: '140px',
                      lineHeight: 1,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900,
                      color: `${category.color}06`,
                      WebkitTextStroke: `1px ${category.color}10`,
                    }}
                  >
                    {days}
                  </div>

                  <div className="relative p-6">
                    {/* 头部：分类名 + 操作 */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: category.color, boxShadow: `0 0 12px ${category.color}50` }}
                        />
                        <span className="text-base font-semibold" style={{ color: 'var(--bright-chalk)' }}>
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const d = prompt('修改起始日期 (YYYY-MM-DD)', category.startDate)
                            if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) handleUpdateDate(category.id, d)
                          }}
                          className="p-2 rounded-lg transition-colors duration-150"
                          style={{ color: 'var(--slate-ghost)' }}
                          title="修改日期"
                        >
                          <Calendar size={14} />
                        </button>
                        <button
                          onClick={() => handleRemove(category.id)}
                          className="p-2 rounded-lg transition-colors duration-150"
                          style={{ color: 'var(--slate-ghost)' }}
                          title="关闭计时"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 主数字区域 */}
                    <div className="mb-2">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-6xl font-black tracking-tight"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: category.color }}
                        >
                          {days}
                        </span>
                        <span className="text-xl font-medium" style={{ color: 'var(--silver-mist)' }}>天</span>
                      </div>
                    </div>

                    {/* 描述 */}
                    <p className="text-sm mb-5" style={{ color: 'var(--silver-mist)' }}>
                      {category.name}已经 <span className="font-semibold" style={{ color: 'var(--bright-chalk)' }}>{days}</span> 天了
                    </p>

                    {/* 详情网格 */}
                    <div
                      className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden"
                      style={{ background: 'rgba(0,0,0,0.25)' }}
                    >
                      <div className="text-center py-3 px-2" style={{ borderRight: '1px solid var(--whisper-border)' }}>
                        <div
                          className="text-lg font-bold"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                        >
                          {years > 0 ? years : '—'}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>年</div>
                      </div>
                      <div className="text-center py-3 px-2" style={{ borderRight: '1px solid var(--whisper-border)' }}>
                        <div
                          className="text-lg font-bold"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                        >
                          {months}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>月</div>
                      </div>
                      <div className="text-center py-3 px-2" style={{ borderRight: '1px solid var(--whisper-border)' }}>
                        <div
                          className="text-lg font-bold"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                        >
                          {weeks}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>周</div>
                      </div>
                      <div className="text-center py-3 px-2">
                        <div
                          className="text-lg font-bold"
                          style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--bright-chalk)' }}
                        >
                          {total > 0 ? Math.round(total / 60) : '—'}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--slate-ghost)' }}>小时</div>
                      </div>
                    </div>

                    {/* 底部日期 */}
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                        从 {startStr} 开始至今
                      </p>
                      {total > 0 && (
                        <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                          累计练习 {formatMinutes(total)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </RevealSection>
            )
          })}
        </div>
      ) : (
        <RevealSection delay={60}>
          <div
            className="p-12 text-center"
            style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--ember-soft)' }}
            >
              <Timer size={28} style={{ color: 'var(--ember-glow)' }} />
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              还没有正计时日
            </h3>
            <p className="text-sm max-w-sm mx-auto mb-5" style={{ color: 'var(--silver-mist)' }}>
              为你正在坚持的事情添加一个正计时日，看看已经坚持了多久
            </p>
            {availableCategories.length > 0 ? (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm mx-auto"
              >
                <Plus size={15} />
                添加正计时日
              </button>
            ) : (
              <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
                请先在「分类」页面添加技能分类
              </p>
            )}
          </div>
        </RevealSection>
      )}
    </div>
  )
}
