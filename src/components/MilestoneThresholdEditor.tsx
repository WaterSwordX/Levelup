import { useState } from 'react'
import type { CategoryMilestoneConfig } from '../types'
import { MILESTONE_THRESHOLDS } from '../types'
import { saveCustomMilestonesForCategory } from '../store'
import { Plus, X, RotateCcw } from 'lucide-react'

interface Props {
  categoryId: string
  customConfigs: CategoryMilestoneConfig[]
  setCustomConfigs: (configs: CategoryMilestoneConfig[]) => void
  onSaved?: () => void
}

export default function MilestoneThresholdEditor({ categoryId, customConfigs, setCustomConfigs, onSaved }: Props) {
  const [inputValue, setInputValue] = useState('')

  const currentCustom = customConfigs.find(c => c.categoryId === categoryId)?.customThresholds ?? []
  const allEffective = [...new Set([...MILESTONE_THRESHOLDS, ...currentCustom])].sort((a, b) => a - b)

  const handleAdd = () => {
    const val = Number(inputValue)
    if (!inputValue || val <= 0 || !Number.isInteger(val)) return
    if (MILESTONE_THRESHOLDS.includes(val)) return // 全局已有
    if (currentCustom.includes(val)) return
    const updated = saveCustomMilestonesForCategory(categoryId, [...currentCustom, val], customConfigs)
    setCustomConfigs(updated)
    setInputValue('')
    onSaved?.()
  }

  const handleRemove = (threshold: number) => {
    const updated = saveCustomMilestonesForCategory(categoryId, currentCustom.filter(t => t !== threshold), customConfigs)
    setCustomConfigs(updated)
    onSaved?.()
  }

  const handleReset = () => {
    const updated = saveCustomMilestonesForCategory(categoryId, [], customConfigs)
    setCustomConfigs(updated)
    onSaved?.()
  }

  return (
    <div className="space-y-3">
      {/* Effective thresholds display */}
      <div className="flex flex-wrap gap-1.5">
        {allEffective.map(h => {
          const isGlobal = MILESTONE_THRESHOLDS.includes(h)
          const isCustom = currentCustom.includes(h)
          return (
            <span
              key={h}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md"
              style={{
                background: isCustom ? 'var(--ember-soft)' : 'var(--inset-bg)',
                color: isCustom ? 'var(--ember-glow)' : 'var(--silver-mist)',
                border: `1px solid ${isCustom ? 'rgba(232,148,26,0.2)' : 'var(--whisper-border)'}`,
              }}
            >
              {h}h
              {isCustom && (
                <button
                  onClick={() => handleRemove(h)}
                  className="ml-0.5 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--ember-glow)' }}
                >
                  <X size={10} />
                </button>
              )}
            </span>
          )
        })}
      </div>

      {/* Add custom threshold */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          placeholder="自定义小时数"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="input-field flex-1 text-sm"
          style={{ padding: '8px 12px' }}
        />
        <button
          onClick={handleAdd}
          className="btn-ghost flex items-center gap-1.5 text-xs font-medium px-3 py-2"
        >
          <Plus size={14} />
          添加
        </button>
        {currentCustom.length > 0 && (
          <button
            onClick={handleReset}
            className="btn-ghost flex items-center gap-1.5 text-xs font-medium px-3 py-2"
            style={{ color: 'var(--coral-pulse)' }}
          >
            <RotateCcw size={13} />
            重置
          </button>
        )}
      </div>

      <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
        全局里程碑：{MILESTONE_THRESHOLDS.map(h => `${h}h`).join('、')}
      </p>
    </div>
  )
}
