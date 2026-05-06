import { useState, useEffect } from 'react'
import type { SyncData, SyncStatus } from '../sync'
import {
  getStoredToken, setStoredToken, getStoredGistId, setStoredGistId,
  getLastSyncTime, isSyncConfigured, verifyToken,
  createGist, syncToCloud, syncFromCloud, disconnectSync,
} from '../sync'
import { exportAllData, importAllData } from '../store'
import { Cloud, CloudOff, Upload, Download, Unlink, Eye, EyeOff, Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react'

export default function SyncSettings() {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [connected, setConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const stored = getStoredToken()
    if (stored) {
      setToken(stored)
      if (isSyncConfigured()) {
        setConnected(true)
        // Try to get username
        verifyToken(stored).then(r => { if (r.username) setUsername(r.username) })
      }
    }
    setLastSync(getLastSyncTime())
  }, [])

  const clearMessages = () => { setError(''); setMessage('') }

  const handleConnect = async () => {
    if (!token.trim()) return
    clearMessages()
    setStatus('syncing')

    try {
      const result = await verifyToken(token.trim())
      if (!result.valid) {
        setError('Token 无效，请检查后重试')
        setStatus('error')
        return
      }

      setStoredToken(token.trim())
      setUsername(result.username || '')

      const gistId = getStoredGistId()
      if (gistId) {
        try {
          await syncFromCloud()
          setConnected(true)
          setMessage(`已连接 @${result.username}`)
          setLastSync(getLastSyncTime())
        } catch {
          // Gist not found, create new
          const localData: SyncData = { ...exportAllData(), syncedAt: new Date().toISOString() }
          const newId = await createGist(token.trim(), localData)
          setStoredGistId(newId)
          setConnected(true)
          setLastSync(getLastSyncTime())
          setMessage(`已连接 @${result.username}，本地数据已上传`)
        }
      } else {
        const localData: SyncData = { ...exportAllData(), syncedAt: new Date().toISOString() }
        const newId = await createGist(token.trim(), localData)
        setStoredGistId(newId)
        setConnected(true)
        setLastSync(getLastSyncTime())
        setMessage(`已连接 @${result.username}，本地数据已上传`)
      }

      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
      setStatus('error')
    }
  }

  const handlePush = async () => {
    clearMessages()
    setStatus('syncing')
    try {
      const data: SyncData = { ...exportAllData(), syncedAt: new Date().toISOString() }
      await syncToCloud(data)
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
      const cloudData = await syncFromCloud()
      importAllData(cloudData)
      setLastSync(getLastSyncTime())
      setMessage('数据已从云端拉取，页面将刷新')
      setStatus('success')
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : '拉取失败')
      setStatus('error')
    }
  }

  const handleDisconnect = () => {
    disconnectSync()
    setConnected(false)
    setToken('')
    setUsername('')
    setLastSync(null)
    setMessage('已断开连接')
    setStatus('idle')
  }

  const syncing = status === 'syncing'

  return (
    <div className="space-y-4">
      <div
        className="glass-card p-5"
        style={{ border: connected ? '1px solid rgba(78, 205, 196, 0.2)' : '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: connected ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}
          >
            {connected ? <Cloud size={20} style={{ color: 'var(--teal)' }} /> : <CloudOff size={20} style={{ color: 'var(--text-muted)' }} />}
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
            >
              {connected ? `已连接 @${username}` : 'GitHub Gist 同步'}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {connected
                ? lastSync ? `上次同步: ${new Date(lastSync).toLocaleString('zh-CN')}` : '已连接，等待首次同步'
                : '通过 GitHub Gist 跨设备同步数据'}
            </p>
          </div>
        </div>

        {!connected && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="input-field pr-10"
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div
              className="text-xs p-3 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}
            >
              <p className="mb-1">如何获取 Token：</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>打开 GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</li>
                <li>创建新 Token，权限选择 <strong style={{ color: 'var(--text-secondary)' }}>Gist（读写）</strong></li>
                <li>复制 Token 粘贴到上方</li>
              </ol>
              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 transition-colors duration-200"
                style={{ color: 'var(--accent)' }}
              >
                前往创建 Token <ExternalLink size={12} />
              </a>
            </div>

            <button
              onClick={handleConnect}
              disabled={!token.trim() || syncing}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm w-full justify-center"
            >
              {syncing ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />}
              连接
            </button>
          </div>
        )}

        {connected && (
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
              onClick={handleDisconnect}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all duration-200"
              style={{ color: 'var(--coral)', border: '1px solid rgba(255, 107, 107, 0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Unlink size={14} />
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{ background: 'rgba(78, 205, 196, 0.08)', color: 'var(--teal)' }}>
          <Check size={16} /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{ background: 'rgba(255, 107, 107, 0.08)', color: 'var(--coral)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  )
}
