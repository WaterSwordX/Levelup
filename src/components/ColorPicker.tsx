import { useState, useRef } from 'react'
import { PRESET_COLORS } from '../store'
import { Pipette } from 'lucide-react'

interface Props {
  value: string
  onChange: (color: string) => void
  size?: 'sm' | 'md'
}

export default function ColorPicker({ value, onChange, size = 'md' }: Props) {
  const [customHex, setCustomHex] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const dotSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'
  const isPreset = PRESET_COLORS.includes(value)

  const handleCustomHex = () => {
    const hex = customHex.trim()
    const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)
    if (valid) {
      // Expand 3-digit hex
      const expanded = hex.length === 4
        ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
        : hex
      onChange(expanded.toLowerCase())
      setCustomHex('')
      setShowCustom(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* 预设色网格 */}
      <div className="grid grid-cols-8 gap-2">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`${dotSize} rounded-full transition-all duration-150 cursor-pointer`}
            style={{
              backgroundColor: c,
              boxShadow: value === c ? `0 0 0 2px var(--deep-void), 0 0 0 3.5px ${c}` : 'none',
              transform: value === c ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* 自定义颜色区域 */}
      <div className="flex items-center gap-2">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
            style={{
              background: !isPreset ? `${value}18` : 'rgba(255,255,255,0.04)',
              color: !isPreset ? value : 'var(--slate-ghost)',
              border: `1px solid ${!isPreset ? `${value}30` : 'var(--whisper-border)'}`,
            }}
          >
            <Pipette size={12} />
            {!isPreset ? value : '自定义颜色'}
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            {/* 原生取色器 */}
            <input
              ref={colorInputRef}
              type="color"
              value={value}
              onChange={e => { onChange(e.target.value); setShowCustom(false) }}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
              style={{ background: 'transparent' }}
            />
            {/* Hex 输入 */}
            <input
              type="text"
              value={customHex}
              onChange={e => setCustomHex(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomHex()}
              placeholder="#ff6b35"
              className="input-field text-xs flex-1"
              style={{ fontFamily: "'JetBrains Mono', monospace", padding: '6px 10px' }}
              autoFocus
            />
            <button
              onClick={handleCustomHex}
              disabled={!customHex.trim()}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
              style={{
                background: 'var(--ember-soft)',
                color: 'var(--ember-glow)',
                border: '1px solid rgba(232,148,26,0.15)',
                opacity: customHex.trim() ? 1 : 0.4,
              }}
            >
              确定
            </button>
            <button
              onClick={() => { setShowCustom(false); setCustomHex('') }}
              className="px-2 py-1.5 rounded-lg text-[11px]"
              style={{ color: 'var(--slate-ghost)' }}
            >
              取消
            </button>
          </div>
        )}

        {/* 当前选中色预览 */}
        {!showCustom && !isPreset && (
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: value, borderColor: 'var(--whisper-border)' }} />
            <span className="text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--slate-ghost)' }}>{value}</span>
          </div>
        )}
      </div>
    </div>
  )
}
