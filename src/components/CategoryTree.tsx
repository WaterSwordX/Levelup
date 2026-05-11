import type { Category, TimeEntry } from '../types'
import type { ReactNode } from 'react'
import { getChildCategories, getCategoryTotalTime } from '../store'
import { ChevronRight, ChevronDown, Clock } from 'lucide-react'
import { useState } from 'react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  onSelect?: (category: Category) => void
  selectedId?: string
  level?: number
  parentId?: string | null
  showTime?: boolean
  renderActions?: (category: Category) => ReactNode
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

export default function CategoryTree({ categories, entries, onSelect, selectedId, level = 0, parentId = null, showTime = true, renderActions }: Props) {
  const children = getChildCategories(parentId, categories)

  if (children.length === 0 && level === 0) return null

  return (
    <div className={level > 0 ? 'ml-5 pl-3' : ''} style={level > 0 ? { borderLeft: '1px solid var(--whisper-border)' } : undefined}>
      {children.map(cat => (
        <CategoryNode
          key={cat.id}
          category={cat}
          categories={categories}
          entries={entries}
          onSelect={onSelect}
          selectedId={selectedId}
          level={level}
          showTime={showTime}
          renderActions={renderActions}
        />
      ))}
    </div>
  )
}

function CategoryNode({ category, categories, entries, onSelect, selectedId, level, showTime, renderActions }: {
  category: Category
  categories: Category[]
  entries: TimeEntry[]
  onSelect?: (category: Category) => void
  selectedId?: string
  level: number
  showTime: boolean
  renderActions?: (category: Category) => ReactNode
}) {
  const [expanded, setExpanded] = useState(true)
  const children = getChildCategories(category.id, categories)
  const totalTime = getCategoryTotalTime(category.id, entries, categories)
  const hasChildren = children.length > 0
  const isSelected = selectedId === category.id

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 px-2.5 rounded-xl cursor-pointer transition-all duration-200 group"
        style={{
          background: isSelected ? 'var(--ember-soft)' : 'transparent',
          color: isSelected ? '#E8941A' : 'var(--bright-chalk)',
          border: isSelected ? '1px solid rgba(232, 148, 26, 0.15)' : '1px solid transparent',
        }}
        onClick={() => onSelect?.(category)}
        onMouseEnter={e => {
          if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
        }}
        onMouseLeave={e => {
          if (!isSelected) e.currentTarget.style.background = 'transparent'
        }}
      >
        {hasChildren ? (
          <button
            className="p-0.5 rounded-md transition-colors duration-200"
            style={{ color: 'var(--slate-ghost)' }}
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: category.color, boxShadow: `0 0 6px ${category.color}60` }}
        />
        <span className="text-sm font-medium flex-1 truncate">{category.name}</span>
        {showTime && totalTime > 0 && (
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--slate-ghost)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Clock size={12} />
            {formatMinutes(totalTime)}
          </span>
        )}
        {renderActions && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
            {renderActions(category)}
          </div>
        )}
      </div>
      {hasChildren && expanded && (
        <CategoryTree
          categories={categories}
          entries={entries}
          onSelect={onSelect}
          selectedId={selectedId}
          level={level + 1}
          parentId={category.id}
          showTime={showTime}
          renderActions={renderActions}
        />
      )}
    </div>
  )
}

export { formatMinutes }
