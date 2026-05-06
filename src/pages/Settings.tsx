import SyncSettings from '../components/SyncSettings'
import { Settings as SettingsIcon, Cloud, Smartphone } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
        >
          设置
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          管理同步和应用配置
        </p>
      </div>

      {/* Sync Section */}
      <div className="space-y-4">
        <h3 className="section-title flex items-center gap-2">
          <Cloud size={14} style={{ color: 'var(--teal)' }} />
          数据同步
        </h3>
        <SyncSettings />
      </div>

      {/* PWA Info */}
      <div className="space-y-4">
        <h3 className="section-title flex items-center gap-2">
          <Smartphone size={14} style={{ color: 'var(--iris)' }} />
          安装应用
        </h3>
        <div className="glass-card p-5">
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Levelup 可以像原生应用一样安装到你的设备上：
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(167, 139, 250, 0.1)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--iris)', fontFamily: "'Space Grotesk', sans-serif" }}>iP</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>iPhone / iPad</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Safari 打开 → 点击底部「分享」按钮 → 「添加到主屏幕」
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(78, 205, 196, 0.1)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--teal)', fontFamily: "'Space Grotesk', sans-serif" }}>An</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Android</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Chrome 打开 → 点击地址栏右侧安装图标 → 「安装」
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(245, 166, 35, 0.1)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--accent)', fontFamily: "'Space Grotesk', sans-serif" }}>PC</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>桌面端</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Chrome / Edge 打开 → 地址栏右侧安装图标 → 「安装」
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent-soft), var(--iris-glow))',
            }}
          >
            <SettingsIcon size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
            >
              Levelup v1.0
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              技能时间追踪器 · 数据存储在浏览器本地 + 可选云端同步
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
