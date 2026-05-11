import SyncSettings from '../components/SyncSettings'
import type { Category, TimeEntry, Goal, Milestone } from '../types'
import { Settings as SettingsIcon, Cloud, Smartphone } from 'lucide-react'
import RevealSection from '../components/RevealSection'
import TiltCard from '../components/TiltCard'

interface Props {
  currentData?: {
    categories: Category[]
    entries: TimeEntry[]
    goals: Goal[]
    milestones: Milestone[]
  }
}

export default function Settings({ currentData }: Props) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <RevealSection>
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
          >
            设置
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--slate-ghost)' }}>
            管理同步和应用配置
          </p>
        </div>
      </RevealSection>

      {/* Sync Section */}
      <RevealSection delay={80}>
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Cloud size={14} style={{ color: '#4ECDC4' }} />
            数据同步
          </h3>
          <SyncSettings currentData={currentData} />
        </div>
      </RevealSection>

      {/* PWA Info */}
      <RevealSection delay={120}>
        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Smartphone size={14} style={{ color: '#A78BFA' }} />
            安装应用
          </h3>
          <TiltCard className="p-5">
            <p className="text-sm mb-4" style={{ color: 'var(--silver-mist)' }}>
              Levelup 可以像原生应用一样安装到你的设备上：
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--iris-soft)' }}
                >
                  <span
                    className="text-xs font-bold"
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
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--teal-soft)' }}
                >
                  <span
                    className="text-xs font-bold"
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
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--ember-soft)' }}
                >
                  <span
                    className="text-xs font-bold"
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
          </TiltCard>
        </div>
      </RevealSection>

      {/* About */}
      <RevealSection delay={160}>
        <TiltCard className="p-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--ember-soft)' }}
            >
              <SettingsIcon size={18} style={{ color: '#E8941A' }} />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
              >
                Levelup v1.0
              </p>
              <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
                技能时间追踪器 · 数据存储在浏览器本地 + 可选云端同步
              </p>
            </div>
          </div>
        </TiltCard>
      </RevealSection>
    </div>
  )
}
