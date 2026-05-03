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
    <div className={level > 0 ? 'ml-4' : ''}>
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
        className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-all duration-150 group ${
          isSelected
            ? 'bg-[#58a6ff15] text-[#58a6ff] shadow-[inset_0_0_0_1px_rgba(88,166,255,0.2)]'
            : 'hover:bg-[#1c2128] text-[#e6edf3]'
        }`}
        onClick={() => onSelect?.(category)}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-[#30363d] rounded transition-colors"
            onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm font-medium flex-1 truncate">{category.name}</span>
        {showTime && totalTime > 0 && (
          <span className="text-xs text-[#484f58] flex items-center gap-1">
            <Clock size={12} />
            {formatMinutes(totalTime)}
          </span>
        )}
        {renderActions && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
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
