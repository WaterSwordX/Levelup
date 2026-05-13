import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Category, TimeEntry } from '../types'
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const selectedPath = selectedId ? getCategoryPath(selectedId, categories) : ''

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleScroll = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
      }
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-left rounded-xl transition-all duration-200"
        style={{
          background: 'var(--inset-bg-strong)',
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
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)' }}
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

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-fade-in"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            background: 'var(--carbon-base)',
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
        </div>,
        document.body
      )}
    </>
  )
}
