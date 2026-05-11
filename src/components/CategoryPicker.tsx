import type { Category, TimeEntry } from '../types'
import { useState } from 'react'
import CategoryTree from './CategoryTree'
import { getCategoryPath } from '../store'
import { ChevronDown, X } from 'lucide-react'

interface Props {
  categories: Category[]
  entries: TimeEntry[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function CategoryPicker({ categories, entries, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false)

  const selectedPath = selectedId ? getCategoryPath(selectedId, categories) : ''

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-left rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: `1px solid ${open ? '#E8941A' : 'var(--whisper-border)'}`,
          boxShadow: open ? '0 0 0 3px var(--ember-soft)' : 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ color: selectedId ? 'var(--bright-chalk)' : 'var(--slate-ghost)' }}>
          {selectedId ? selectedPath : '选择分类...'}
        </span>
        <div className="flex items-center gap-1">
          {selectedId && (
            <span
              className="p-1 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--slate-ghost)' }}
              onClick={e => { e.stopPropagation(); onSelect(null) }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className="transition-transform duration-200"
            style={{
              color: 'var(--slate-ghost)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {open && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-fade-in"
          style={{
            background: 'rgba(21, 23, 30, 0.95)',
            border: '1px solid var(--whisper-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {categories.length === 0 ? (
            <p className="text-sm p-3" style={{ color: 'var(--slate-ghost)' }}>暂无分类，请先添加</p>
          ) : (
            <CategoryTree
              categories={categories}
              entries={entries}
              showTime={false}
              onSelect={(cat) => { onSelect(cat.id); setOpen(false) }}
              selectedId={selectedId ?? undefined}
            />
          )}
        </div>
      )}
    </div>
  )
}
