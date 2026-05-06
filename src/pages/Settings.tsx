import { useState } from 'react'
import SyncSettings from '../components/SyncSettings'
import { Settings as SettingsIcon, Cloud, Smartphone, Database, ExternalLink, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { getSupabaseUrl, getSupabaseKey, setSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured } from '../lib/supabase'

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseUrl())
  const [supabaseKey, setSupabaseKey] = useState(getSupabaseKey())
  const [showKey, setShowKey] = useState(false)
  const [configured, setConfigured] = useState(isSupabaseConfigured())
  const [msg, setMsg] = useState('')

  const handleSaveConfig = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setMsg('')
      return
    }
    setSupabaseConfig(supabaseUrl, supabaseKey)
    setConfigured(isSupabaseConfigured())
    setMsg('配置已保存，页面将刷新')
    setTimeout(() => window.location.reload(), 800)
  }

  const handleClearConfig = () => {
    clearSupabaseConfig()
    setSupabaseUrl('')
    setSupabaseKey('')
    setConfigured(false)
    setMsg('配置已清除')
  }

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

      {/* Supabase Config Section */}
      <div className="space-y-4">
        <h3 className="section-title flex items-center gap-2">
          <Database size={14} style={{ color: 'var(--iris)' }} />
          Supabase 配置
        </h3>
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            数据同步需要 Supabase 项目。前往 supabase.com 创建免费项目，然后填入以下信息。
          </p>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Anon Public Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveConfig}
              disabled={!supabaseUrl.trim() || !supabaseKey.trim()}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Check size={16} />
              保存配置
            </button>
            {configured && (
              <button
                onClick={handleClearConfig}
                className="btn-ghost px-4 py-2 text-sm"
              >
                清除
              </button>
            )}
          </div>

          {configured && (
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: 'var(--teal)' }}
            >
              <Check size={14} />
              Supabase 已配置
            </div>
          )}

          {msg && (
            <div
              className="flex items-center gap-2 text-xs animate-fade-in"
              style={{ color: 'var(--teal)' }}
            >
              <AlertCircle size={14} />
              {msg}
            </div>
          )}

          <div
            className="text-xs p-3 rounded-xl"
            style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}
          >
            <p className="mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>设置步骤：</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>注册 <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>supabase.com <ExternalLink size={10} /></a> 并创建项目</li>
              <li>进入 SQL Editor，运行建表 SQL（见下方）</li>
              <li>进入 Settings → API，复制 URL 和 anon key</li>
              <li>粘贴到上方输入框并保存</li>
            </ol>
          </div>

          <details className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <summary className="cursor-pointer font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              点击查看建表 SQL
            </summary>
            <pre
              className="p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed"
              style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}
            >{`create table user_data (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  categories jsonb default '[]'::jsonb,
  entries jsonb default '[]'::jsonb,
  goals jsonb default '[]'::jsonb,
  milestones jsonb default '[]'::jsonb,
  synced_at timestamptz default now()
);

alter table user_data
  enable row level security;

create policy "Users can read own data"
  on user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on user_data for update
  using (auth.uid() = user_id);`}</pre>
          </details>
        </div>
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
