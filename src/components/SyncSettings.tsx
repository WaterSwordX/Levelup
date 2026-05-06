import { useState, useEffect } from 'react'
import type { SyncData, SyncStatus } from '../sync'
import {
  getCurrentUser, onAuthStateChange, signOut,
  pushToCloud, pullFromCloud, getLastSyncTime,
} from '../sync'
import { exportAllData, importAllData } from '../store'
import { isSupabaseConfigured } from '../lib/supabase'
import AuthPanel from './AuthPanel'
import type { User } from '@supabase/supabase-js'
import { Cloud, Upload, Download, LogOut, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react'

export default function SyncSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    getCurrentUser().then(u => {
      setUser(u)
      setLoading(false)
    })

    const unsub = onAuthStateChange(u => setUser(u))
    return unsub
  }, [])

  useEffect(() => {
    setLastSync(getLastSyncTime())
  }, [user])

  const clearMessages = () => {
    setError('')
    setMessage('')
  }

  const handleAuthSuccess = () => {
    // After login, auto-sync
    handleAutoSync()
  }

  const handleAutoSync = async () => {
    clearMessages()
    setStatus('syncing')
    try {
      const localData: SyncData = {
        ...exportAllData(),
        synced_at: new Date().toISOString(),
      }

      const cloudData = await pullFromCloud()

      if (!cloudData) {
        // No cloud data, push local
        await pushToCloud(localData)
        setMessage('首次同步完成，本地数据已上传')
      } else {
        // Cloud has data, pull it
        importAllData(cloudData)
        setMessage('数据已从云端同步')
        setTimeout(() => window.location.reload(), 800)
      }

      setLastSync(getLastSyncTime())
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '同步失败')
      setStatus('error')
    }
  }

  const handlePush = async () => {
    clearMessages()
    setStatus('syncing')
    try {
      const data: SyncData = {
        ...exportAllData(),
        synced_at: new Date().toISOString(),
      }
      await pushToCloud(data)
      setLastSync(getLastSyncTime())
      setMessage('数据已推送到云端')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '推送失败')
      setStatus('error')
    }
  }

  const handlePull = async () => {
    clearMessages()
    setStatus('syncing')
    try {
      const cloudData = await pullFromCloud()
      if (!cloudData) {
        setMessage('云端暂无数据')
        setStatus('success')
        return
      }
      importAllData(cloudData)
      setLastSync(getLastSyncTime())
      setMessage('数据已从云端拉取')
      setStatus('success')
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : '拉取失败')
      setStatus('error')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setLastSync(null)
    setMessage('已退出登录')
  }

  const syncing = status === 'syncing'

  // Not configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="glass-card p-5">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          数据同步功能需要配置 Supabase。请在代码中设置 Supabase URL 和 Anon Key。
        </p>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="glass-card p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <AuthPanel onAuthSuccess={handleAuthSuccess} />
  }

  // Logged in
  return (
    <div className="space-y-4">
      {/* User Info */}
      <div
        className="glass-card p-5"
        style={{ border: '1px solid rgba(78, 205, 196, 0.2)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(78, 205, 196, 0.1)' }}
            >
              <Cloud size={20} style={{ color: 'var(--teal)' }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
              >
                已登录
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--coral)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <LogOut size={14} />
            退出
          </button>
        </div>

        {lastSync && (
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            上次同步: {new Date(lastSync).toLocaleString('zh-CN')}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handlePush}
            disabled={syncing}
            className="btn-ghost flex items-center gap-2 px-4 py-2 text-xs flex-1 justify-center"
          >
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            推送到云端
          </button>
          <button
            onClick={handlePull}
            disabled={syncing}
            className="btn-ghost flex items-center gap-2 px-4 py-2 text-xs flex-1 justify-center"
          >
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            从云端拉取
          </button>
          <button
            onClick={handleAutoSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all duration-200"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            title="自动同步"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{ background: 'rgba(78, 205, 196, 0.08)', color: 'var(--teal)' }}
        >
          <Check size={16} />
          {message}
        </div>
      )}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{ background: 'rgba(255, 107, 107, 0.08)', color: 'var(--coral)' }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  )
}
