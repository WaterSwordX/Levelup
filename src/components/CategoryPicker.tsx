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
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-left hover:border-[#484f58] transition-colors"
      >
        <span className={selectedId ? 'text-[#e6edf3]' : 'text-[#484f58]'}>
          {selectedId ? selectedPath : '选择分类...'}
        </span>
        <div className="flex items-center gap-1">
          {selectedId && (
            <span
              className="p-0.5 hover:bg-[#30363d] rounded"
              onClick={e => { e.stopPropagation(); onSelect(null) }}
            >
              <X size={14} className="text-[#484f58]" />
            </span>
          )}
          <ChevronDown size={16} className={`text-[#484f58] transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl max-h-60 overflow-y-auto p-2">
          {categories.length === 0 ? (
            <p className="text-sm text-[#484f58] p-2">暂无分类，请先添加</p>
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
