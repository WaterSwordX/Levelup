import { useState } from 'react'
import SyncSettings from '../components/SyncSettings'
import type { Category, TimeEntry, Goal, Milestone } from '../types'
import type { ThemeMode } from '../store'
import { getTheme, saveTheme } from '../store'
import { Settings as SettingsIcon, Cloud, Smartphone, Sun, Moon, Check } from 'lucide-react'
import RevealSection from '../components/RevealSection'

interface Props {
  currentData?: {
    categories: Category[]
    entries: TimeEntry[]
    goals: Goal[]
    milestones: Milestone[]
  }
}

export default function Settings({ currentData }: Props) {
  const [theme, setTheme] = useState<ThemeMode>(getTheme)

  const handleSetTheme = (t: ThemeMode) => {
    setTheme(t)
    saveTheme(t)
    document.documentElement.dataset.theme = t
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <RevealSection>
        <div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            设置
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--slate-ghost)' }}>
            管理同步和应用配置
          </p>
        </div>
      </RevealSection>

      {/* Appearance Section */}
      <RevealSection delay={40}>
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Sun size={13} style={{ color: '#E8941A' }} />
            外观主题
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Dark Theme Card */}
            <button
              onClick={() => handleSetTheme('dark')}
              className="relative p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: theme === 'dark' ? 'var(--ember-soft)' : 'var(--carbon-base)',
                border: theme === 'dark' ? '1px solid rgba(232,148,26,0.25)' : '1px solid var(--whisper-border)',
              }}
            >
              {theme === 'dark' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--ember-glow)' }}>
                  <Check size={12} style={{ color: '#110d08' }} />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0d0f14', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Moon size={14} style={{ color: '#f0ece4' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--bright-chalk)', fontFamily: "'Space Grotesk', sans-serif" }}>深色</span>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ background: '#050509', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-2.5 py-1.5" style={{ background: '#0d0f14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-1.5 rounded-full" style={{ background: '#e8941a' }} />
                </div>
                <div className="p-2 space-y-1">
                  <div className="h-1.5 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  <div className="h-1.5 rounded-full w-1/2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              </div>
            </button>

            {/* Light Theme Card */}
            <button
              onClick={() => handleSetTheme('light')}
              className="relative p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: theme === 'light' ? 'var(--ember-soft)' : 'var(--carbon-base)',
                border: theme === 'light' ? '1px solid rgba(232,148,26,0.25)' : '1px solid var(--whisper-border)',
              }}
            >
              {theme === 'light' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--ember-glow)' }}>
                  <Check size={12} style={{ color: '#110d08' }} />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#faf9f7', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <Sun size={14} style={{ color: '#b87318' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--bright-chalk)', fontFamily: "'Space Grotesk', sans-serif" }}>浅色</span>
              </div>
              <div className="rounded-lg overflow-hidden" style={{ background: '#f2f0ed', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="px-2.5 py-1.5" style={{ background: '#faf9f7', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="w-8 h-1.5 rounded-full" style={{ background: '#b87318' }} />
                </div>
                <div className="p-2 space-y-1">
                  <div className="h-1.5 rounded-full w-3/4" style={{ background: 'rgba(0,0,0,0.1)' }} />
                  <div className="h-1.5 rounded-full w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </RevealSection>

      {/* Sync Section */}
      <RevealSection delay={60}>
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Cloud size={13} style={{ color: '#4ECDC4' }} />
            数据同步
          </h3>
          <SyncSettings currentData={currentData} />
        </div>
      </RevealSection>

      {/* PWA Info */}
      <RevealSection delay={100}>
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Smartphone size={13} style={{ color: '#A78BFA' }} />
            安装应用
          </h3>
          <div className="p-5" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--silver-mist)' }}>
              Levelup 可以像原生应用一样安装到你的设备上：
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--iris-soft)' }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: '#A78BFA', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    iP
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>iPhone / iPad</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--slate-ghost)' }}>
                    Safari 打开 → 点击底部「分享」按钮 → 「添加到主屏幕」
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--teal-soft)' }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: '#4ECDC4', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    An
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>Android</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--slate-ghost)' }}>
                    Chrome 打开 → 点击地址栏右侧安装图标 → 「安装」
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--ember-soft)' }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: '#E8941A', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    PC
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--bright-chalk)' }}>桌面端</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--slate-ghost)' }}>
                    Chrome / Edge 打开 → 地址栏右侧安装图标 → 「安装」
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* About */}
      <RevealSection delay={140}>
        <div className="p-5" style={{ background: 'var(--carbon-base)', border: '1px solid var(--whisper-border)', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--ember-soft)' }}
            >
              <SettingsIcon size={16} style={{ color: '#E8941A' }} />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
              >
                Levelup v1.0
              </p>
              <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
                技能时间追踪器 · 数据存储在浏览器本地 + 可选云端同步
              </p>
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  )
}
