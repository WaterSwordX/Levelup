import { useMemo } from 'react'
import type { Category, TimeEntry } from '../types'
import { getTopCategories, getCategoryTotalTime, getCategoryPath } from '../store'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, FileSpreadsheet } from 'lucide-react'

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
    if (minutes === 0) return '#21262d'
    const ratio = minutes / maxHeatmap
    if (ratio < 0.25) return '#0e4429'
    if (ratio < 0.5) return '#006d32'
    if (ratio < 0.75) return '#26a641'
    return '#39d353'
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
      return `<tr><td style="padding:8px;border-bottom:1px solid #30363d"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cat.color};margin-right:8px;vertical-align:middle"></span>${cat.name}</td><td style="padding:8px;border-bottom:1px solid #30363d;text-align:right;color:#e6edf3">${formatMinutes(total)}</td><td style="padding:8px;border-bottom:1px solid #30363d;text-align:right;color:#8b949e">${(total / totalMin * 100).toFixed(1)}%</td></tr>`
    }).join('')
    const entryRows = sorted.map(e => {
      const path = getCategoryPath(e.categoryId, categories)
      return `<tr><td style="padding:6px 8px;border-bottom:1px solid #21262d;color:#8b949e">${e.date}</td><td style="padding:6px 8px;border-bottom:1px solid #21262d;color:#e6edf3">${path}</td><td style="padding:6px 8px;border-bottom:1px solid #21262d;color:#8b949e">${e.description || '-'}</td><td style="padding:6px 8px;border-bottom:1px solid #21262d;text-align:right;color:#e6edf3">${e.duration}分钟</td></tr>`
    }).join('')
    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>Levelup 技能时间报告</title><style>body{font-family:-apple-system,"Microsoft YaHei",sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;background:#0d1117;color:#e6edf3}h1{font-size:24px;margin-bottom:8px}.subtitle{color:#8b949e;font-size:14px;margin-bottom:32px}.summary-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px}.card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px}.card-value{font-size:24px;font-weight:bold;color:#fff}.card-label{font-size:12px;color:#8b949e;margin-top:4px}h2{font-size:18px;margin:24px 0 12px;color:#fff}table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;padding:8px;border-bottom:2px solid #30363d;font-size:12px;color:#8b949e}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #21262d;font-size:12px;color:#484f58;text-align:center}</style></head><body><h1>Levelup 技能时间报告</h1><div class="subtitle">生成于 ${new Date().toLocaleDateString('zh-CN')}</div><div class="summary-cards"><div class="card"><div class="card-value">${formatMinutes(totalMin)}</div><div class="card-label">总投入时间</div></div><div class="card"><div class="card-value">${entries.length}</div><div class="card-label">记录条数</div></div><div class="card"><div class="card-value">${topCategories.length}</div><div class="card-label">技能分类</div></div></div><h2>分类汇总</h2><table><thead><tr><th>分类</th><th style="text-align:right">累计时间</th><th style="text-align:right">占比</th></tr></thead><tbody>${categorySummary}</tbody></table><h2>详细记录</h2><table><thead><tr><th>日期</th><th>分类</th><th>描述</th><th style="text-align:right">时长</th></tr></thead><tbody>${entryRows}</tbody></table><div class="footer">Levelup · 数据导出</div></body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 300) }
  }

  const tooltipStyle = { contentStyle: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3', fontSize: '12px' } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">统计</h2>
        {entries.length > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] bg-[#21262d] border border-[#30363d] rounded-lg hover:border-[#484f58] hover:text-[#e6edf3] transition-colors">
              <FileSpreadsheet size={14} /> 导出CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] bg-[#21262d] border border-[#30363d] rounded-lg hover:border-[#484f58] hover:text-[#e6edf3] transition-colors">
              <FileText size={14} /> 导出PDF
            </button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-12 text-center text-[#484f58] text-sm">
          暂无数据，开始记录后查看统计
        </div>
      ) : (
        <>
          {pieData.length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
              <h3 className="text-sm font-medium text-[#8b949e] mb-4">时间占比</h3>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value) => formatMinutes(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[#8b949e]">{item.name}</span>
                      <span className="text-[#484f58]">{formatMinutes(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <h3 className="text-sm font-medium text-[#8b949e] mb-4">每周投入趋势</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#484f58' }} axisLine={{ stroke: '#30363d' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#484f58' }} axisLine={false} tickLine={false} tickFormatter={v => formatMinutes(Number(v))} />
                  <Tooltip {...tooltipStyle} formatter={(value) => formatMinutes(Number(value))} />
                  <Bar dataKey="minutes" fill="#58a6ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <h3 className="text-sm font-medium text-[#8b949e] mb-4">每日活跃（近90天）</h3>
            <div className="overflow-x-auto">
              <div className="inline-flex gap-0.5">
                {Array.from({ length: totalWeeks }, (_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-0.5">
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const cell = heatmapData.find(d => d.week === weekIdx && d.day === dayIdx)
                      return (
                        <div key={dayIdx} className="w-3 h-3 rounded-sm" style={{ backgroundColor: cell ? getHeatColor(cell.minutes) : '#21262d' }} title={cell ? `${cell.date}: ${cell.minutes}分钟` : ''} />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-[#484f58]">
                <span>少</span>
                {['#21262d', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
                  <span key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
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
