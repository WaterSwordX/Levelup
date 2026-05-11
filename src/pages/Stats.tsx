import { useMemo } from 'react'
import type { Category, TimeEntry } from '../types'
import { getTopCategories, getCategoryTotalTime, getCategoryPath } from '../store'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, FileSpreadsheet, BarChart3 } from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

export default function Stats({ categories, entries }: Props) {
  const topCategories = getTopCategories(categories)

  const pieData = useMemo(() => {
    return topCategories
      .map(cat => ({
        name: cat.name,
        value: getCategoryTotalTime(cat.id, entries, categories),
        color: cat.color,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [categories, entries])

  const barData = useMemo(() => {
    const weeks: { name: string; start: Date; minutes: number }[] = []
    const now = new Date()
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1 - i * 7)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      const startStr = weekStart.toISOString().split('T')[0]
      const endStr = weekEnd.toISOString().split('T')[0]
      const minutes = entries.filter(e => e.date >= startStr && e.date <= endStr).reduce((s, e) => s + e.duration, 0)
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`
      weeks.push({ name: label, start: weekStart, minutes })
    }
    return weeks
  }, [entries])

  const heatmapData = useMemo(() => {
    const dayMap = new Map<string, number>()
    entries.forEach(e => { dayMap.set(e.date, (dayMap.get(e.date) || 0) + e.duration) })
    const days: { date: string; minutes: number; day: number; week: number }[] = []
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 89)
    const startDay = startDate.getDay()
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay
    const monday = new Date(startDate)
    monday.setDate(startDate.getDate() + mondayOffset)
    let current = new Date(monday)
    let weekIndex = 0
    while (current <= now) {
      const dateStr = current.toISOString().split('T')[0]
      const dayOfWeek = current.getDay() === 0 ? 6 : current.getDay() - 1
      if (current.getDay() === 1 && current.getTime() !== monday.getTime()) weekIndex++
      days.push({ date: dateStr, minutes: dayMap.get(dateStr) || 0, day: dayOfWeek, week: weekIndex })
      current.setDate(current.getDate() + 1)
    }
    return days
  }, [entries])

  const maxHeatmap = Math.max(...heatmapData.map(d => d.minutes), 1)
  const totalWeeks = heatmapData.length > 0 ? heatmapData[heatmapData.length - 1].week + 1 : 0

  const getHeatColor = (minutes: number) => {
    if (minutes === 0) return 'rgba(255, 255, 255, 0.04)'
    const ratio = minutes / maxHeatmap
    if (ratio < 0.25) return 'rgba(232, 148, 26, 0.15)'
    if (ratio < 0.5) return 'rgba(232, 148, 26, 0.3)'
    if (ratio < 0.75) return 'rgba(232, 148, 26, 0.5)'
    return 'rgba(232, 148, 26, 0.8)'
  }

  const exportCSV = () => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    const header = '日期,分类,描述,时长(分钟),时长(小时)\n'
    const rows = sorted.map(e => {
      const path = getCategoryPath(e.categoryId, categories)
      const hours = (e.duration / 60).toFixed(1)
      const desc = `"${(e.description || '').replace(/"/g, '""')}"`
      return `${e.date},${path},${desc},${e.duration},${hours}`
    }).join('\n')
    const totalMin = entries.reduce((s, e) => s + e.duration, 0)
    const summary = `\n\n总计,,,"${totalMin}","${(totalMin / 60).toFixed(1)}"`
    const bom = '﻿'
    const blob = new Blob([bom + header + rows + summary], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Levelup_技能时间记录_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    const totalMin = entries.reduce((s, e) => s + e.duration, 0)
    const categorySummary = topCategories.map(cat => {
      const total = getCategoryTotalTime(cat.id, entries, categories)
      return `<tr><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cat.color};margin-right:10px;vertical-align:middle;box-shadow:0 0 8px ${cat.color}60"></span>${cat.name}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;color:#F0F1F3;font-family:'JetBrains Mono',monospace;font-weight:600">${formatMinutes(total)}</td><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;color:#9CA0AB">${(total / totalMin * 100).toFixed(1)}%</td></tr>`
    }).join('')
    const entryRows = sorted.map(e => {
      const path = getCategoryPath(e.categoryId, categories)
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#9CA0AB">${e.date}</td><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#F0F1F3">${path}</td><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#9CA0AB">${e.description || '-'}</td><td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:right;color:#F0F1F3;font-family:'JetBrains Mono',monospace">${e.duration}分钟</td></tr>`
    }).join('')
    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>Levelup 技能时间报告</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans','PingFang SC','Microsoft YaHei',sans-serif;max-width:800px;margin:0 auto;padding:48px 32px;background:#0A0B0F;color:#F0F1F3;-webkit-font-smoothing:antialiased}h1{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;margin-bottom:6px}.subtitle{color:#5A5E6B;font-size:14px;margin-bottom:36px}.summary-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:36px}.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px}.card-value{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:600;color:#F0F1F3}.card-label{font-size:12px;color:#5A5E6B;margin-top:4px;text-transform:uppercase;letter-spacing:0.05em}h2{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;margin:28px 0 14px;color:#F0F1F3;letter-spacing:0.02em}table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;padding:10px 12px;border-bottom:2px solid rgba(255,255,255,0.08);font-size:11px;color:#5A5E6B;text-transform:uppercase;letter-spacing:0.05em;font-family:'Space Grotesk',sans-serif}.footer{margin-top:48px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#5A5E6B;text-align:center;font-family:'Space Grotesk',sans-serif;letter-spacing:0.05em}</style></head><body><h1>Levelup</h1><div class="subtitle">技能时间报告 · ${new Date().toLocaleDateString('zh-CN')}</div><div class="summary-cards"><div class="card"><div class="card-value">${formatMinutes(totalMin)}</div><div class="card-label">总投入时间</div></div><div class="card"><div class="card-value">${entries.length}</div><div class="card-label">记录条数</div></div><div class="card"><div class="card-value">${topCategories.length}</div><div class="card-label">技能分类</div></div></div><h2>分类汇总</h2><table><thead><tr><th>分类</th><th style="text-align:right">累计时间</th><th style="text-align:right">占比</th></tr></thead><tbody>${categorySummary}</tbody></table><h2>详细记录</h2><table><thead><tr><th>日期</th><th>分类</th><th>描述</th><th style="text-align:right">时长</th></tr></thead><tbody>${entryRows}</tbody></table><div class="footer">LEVELUP · DATA EXPORT</div></body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 300) }
  }

  const tooltipStyle = {
    contentStyle: {
      background: 'rgba(21, 23, 30, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      color: '#F0F1F3',
      fontSize: '12px',
      backdropFilter: 'blur(12px)',
      fontFamily: "'DM Sans', sans-serif",
    },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            统计
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--slate-ghost)' }}>
            可视化你的成长数据
          </p>
        </div>
        {entries.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-xs">
              <FileSpreadsheet size={14} /> 导出CSV
            </button>
            <button onClick={exportPDF} className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-xs">
              <FileText size={14} /> 导出PDF
            </button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BarChart3 size={40} style={{ color: 'var(--slate-ghost)', margin: '0 auto 16px' }} />
          <p className="text-sm" style={{ color: 'var(--slate-ghost)' }}>暂无数据，开始记录后查看统计</p>
        </div>
      ) : (
        <>
          {pieData.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="section-title mb-5">时间占比</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-52 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value) => formatMinutes(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}60` }}
                      />
                      <span style={{ color: 'var(--silver-mist)' }}>{item.name}</span>
                      <span style={{ color: 'var(--slate-ghost)', fontFamily: "'JetBrains Mono', monospace" }}>{formatMinutes(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-5">
            <h3 className="section-title mb-5">每周投入趋势</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5A5E6B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#5A5E6B' }} axisLine={false} tickLine={false} tickFormatter={v => formatMinutes(Number(v))} />
                  <Tooltip {...tooltipStyle} formatter={(value) => formatMinutes(Number(value))} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8941A" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#E8941A" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="minutes" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title mb-5">每日活跃（近90天）</h3>
            <div className="overflow-x-auto">
              <div className="inline-flex gap-[3px]">
                {Array.from({ length: totalWeeks }, (_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const cell = heatmapData.find(d => d.week === weekIdx && d.day === dayIdx)
                      return (
                        <div
                          key={dayIdx}
                          className="w-[13px] h-[13px] rounded-[3px] transition-all duration-200"
                          style={{
                            backgroundColor: cell ? getHeatColor(cell.minutes) : 'rgba(255,255,255,0.02)',
                            boxShadow: cell && cell.minutes > 0 ? `0 0 6px ${getHeatColor(cell.minutes)}` : 'none',
                          }}
                          title={cell ? `${cell.date}: ${cell.minutes}分钟` : ''}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--slate-ghost)' }}>
                <span>少</span>
                {['rgba(255,255,255,0.04)', 'rgba(232,148,26,0.15)', 'rgba(232,148,26,0.3)', 'rgba(232,148,26,0.5)', 'rgba(232,148,26,0.8)'].map(c => (
                  <span key={c} className="w-[13px] h-[13px] rounded-[3px]" style={{ backgroundColor: c }} />
                ))}
                <span>多</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
