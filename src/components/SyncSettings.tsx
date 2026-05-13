import { useState, useEffect } from 'react'
import type { SyncData, SyncStatus } from '../sync'
import type { Category, TimeEntry, Goal, Milestone } from '../types'
import {
  getStoredToken, setStoredToken, getStoredGistId, setStoredGistId,
  getLastSyncTime, setLastSyncTime, isSyncConfigured, verifyToken,
  createGist, updateGist, syncToCloud, syncFromCloud, disconnectSync, readGist,
  findBestExistingGist, cleanupDuplicateGists,
} from '../sync'
import { exportAllData, importAllData, mergeAllData } from '../store'
import { Cloud, CloudOff, Upload, Download, Unlink, Eye, EyeOff, Check, Loader2, AlertCircle, ExternalLink, Bug } from 'lucide-react'

interface Props {
  currentData?: {
    categories: Category[]
    entries: TimeEntry[]
    goals: Goal[]
    milestones: Milestone[]
  }
}

export default function SyncSettings({ currentData }: Props) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [connected, setConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const stored = getStoredToken()
    if (stored) {
      setToken(stored)
      if (isSyncConfigured()) {
        setConnected(true)
        verifyToken(stored).then(r => { if (r.username) setUsername(r.username) })
      }
    }
    setLastSync(getLastSyncTime())
  }, [])

  const clearMessages = () => { setError(''); setMessage('') }

  // Use currentData (React state) if available, otherwise fall back to localStorage
  const getLocalData = () => {
    if (currentData) {
      console.log('[Sync] Using currentData from React state:', { cat: currentData.categories.length, entries: currentData.entries.length })
      return currentData
    }
    const data = exportAllData()
    console.log('[Sync] Using exportAllData from localStorage:', { cat: data.categories.length, entries: data.entries.length })
    return data
  }

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
      console.log('[Connect] Existing Gist ID:', gistId)

      // Always read local data BEFORE any cloud operation
      const localBeforeConnect = getLocalData()
      console.log('[Connect] Local data before connect:', {
        categories: localBeforeConnect.categories.length,
        entries: localBeforeConnect.entries.length,
      })

      // Helper: connect with a given Gist ID, merge cloud+local, push merged result
      const connectWithGist = async (id: string) => {
        setStoredGistId(id)
        try {
          const cloudData = await readGist(token.trim(), id)
          console.log('[Connect] Cloud data:', {
            categories: cloudData?.categories?.length,
            entries: cloudData?.entries?.length,
          })
          if (cloudData && (cloudData.categories?.length || cloudData.entries?.length)) {
            // Merge cloud data with local data (union, local wins on conflicts)
            const merged = mergeAllData(cloudData, currentData)
            console.log('[Connect] Merged result:', {
              categories: merged.categories.length,
              entries: merged.entries.length,
            })
            const mergedSync: SyncData = { ...merged, syncedAt: new Date().toISOString() }
            // Push merged result back so all devices stay in sync
            await updateGist(token.trim(), id, mergedSync)
            setLastSyncTime()
            setConnected(true)
            setMessage(`已连接 @${result.username}，已合并云端数据，页面将刷新`)
            // Always reload to sync React state with localStorage
            setTimeout(() => window.location.reload(), 1500)
          } else {
            // Cloud is empty, push local data up
            const localData: SyncData = { ...getLocalData(), syncedAt: new Date().toISOString() }
            console.log('[Connect] Pushing local data:', {
              categories: localData.categories.length,
              entries: localData.entries.length,
            })
            await updateGist(token.trim(), id, localData)
            setLastSyncTime()
            setConnected(true)
            setMessage(`已连接 @${result.username}，已推送 ${localData.categories.length} 个分类、${localData.entries.length} 条记录到云端`)
          }
        } catch (e) {
          console.log('[Connect] Read/push failed:', e)
          try {
            const localData: SyncData = { ...getLocalData(), syncedAt: new Date().toISOString() }
            await updateGist(token.trim(), id, localData)
            setLastSyncTime()
            setConnected(true)
            setMessage(`已连接 @${result.username}，本地数据已推送到云端`)
          } catch {
            setConnected(true)
            setMessage(`已连接 @${result.username}，同步失败，请手动推送`)
          }
        }
      }

      if (gistId) {
        try {
          await connectWithGist(gistId)
        } catch (e) {
          console.log('[Connect] Stored Gist failed, searching for existing:', e)
          const existingId = await findBestExistingGist(token.trim())
          if (existingId) {
            await connectWithGist(existingId)
          } else {
            const localData: SyncData = { ...getLocalData(), syncedAt: new Date().toISOString() }
            const newId = await createGist(token.trim(), localData)
            setStoredGistId(newId)
            setConnected(true)
            setMessage(`已连接 @${result.username}，本地数据已上传到新 Gist`)
          }
        }
      } else {
        console.log('[Connect] No stored Gist ID, searching for existing...')
        const existingId = await findBestExistingGist(token.trim())
        console.log('[Connect] Found existing Gist:', existingId)
        if (existingId) {
          await connectWithGist(existingId)
        } else {
          const localData: SyncData = { ...getLocalData(), syncedAt: new Date().toISOString() }
          const newId = await createGist(token.trim(), localData)
          setStoredGistId(newId)
          setConnected(true)
          setMessage(`已连接 @${result.username}，本地数据已上传`)
        }
      }

      setLastSync(getLastSyncTime())
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
      const localData = getLocalData()
      const data: SyncData = { ...localData, syncedAt: new Date().toISOString() }
      await syncToCloud(data)
      setLastSync(getLastSyncTime())
      setMessage(`已推送 ${localData.categories.length} 个分类、${localData.entries.length} 条记录到云端`)
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

      if (!cloudData.categories?.length && !cloudData.entries?.length) {
        setMessage('云端暂无数据，请先在其他设备推送数据')
        setStatus('success')
        return
      }

      importAllData(cloudData)
      setLastSync(getLastSyncTime())
      setMessage(`已拉取 ${cloudData.categories.length} 个分类、${cloudData.entries.length} 条记录，页面将刷新`)
      setStatus('success')
      setTimeout(() => window.location.reload(), 1000)
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

  const handleDebug = async () => {
    const lines: string[] = []

    // Local data
    const local = exportAllData()
    lines.push('=== 本地数据 ===')
    lines.push(`分类: ${local.categories.length} 条`)
    lines.push(`记录: ${local.entries.length} 条`)
    lines.push(`目标: ${local.goals.length} 条`)
    lines.push(`里程碑: ${local.milestones.length} 条`)
    if (local.categories.length > 0) {
      lines.push(`分类列表: ${local.categories.map(c => c.name).join(', ')}`)
    }

    // Gist info
    lines.push('')
    lines.push('=== Gist 信息 ===')
    const gistId = getStoredGistId()
    lines.push(`Gist ID: ${gistId || '未设置'}`)
    lines.push(`Token: ${getStoredToken() ? '已设置' : '未设置'}`)
    lines.push(`上次同步: ${getLastSyncTime() || '无'}`)

    // Try to read Gist directly
    if (gistId && getStoredToken()) {
      try {
        lines.push('')
        lines.push('=== 云端 Gist 原始数据 ===')
        const raw = await readGist(getStoredToken()!, gistId)
        lines.push(`类型: ${typeof raw}`)
        lines.push(`键: ${Object.keys(raw).join(', ')}`)
        lines.push(`分类: ${JSON.stringify(raw.categories?.length)}`)
        lines.push(`记录: ${JSON.stringify(raw.entries?.length)}`)
        lines.push(`目标: ${JSON.stringify(raw.goals?.length)}`)
        lines.push(`里程碑: ${JSON.stringify(raw.milestones?.length)}`)
        lines.push(`syncedAt: ${raw.syncedAt}`)
        // Show first category if exists
        if (raw.categories?.length > 0) {
          lines.push(`首个分类: ${JSON.stringify(raw.categories[0])}`)
        }
        // Full raw content (truncated)
        lines.push('')
        lines.push('=== 完整 JSON (前 500 字符) ===')
        lines.push(JSON.stringify(raw, null, 2).slice(0, 500))
      } catch (e) {
        lines.push(`读取 Gist 失败: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    setDebugInfo(lines.join('\n'))
  }

  const syncing = status === 'syncing'

  return (
    <div className="space-y-4">
      <div
        className="glass-card p-5"
        style={{ border: connected ? '1px solid rgba(78, 205, 196, 0.2)' : '1px solid var(--whisper-border)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: connected ? 'var(--teal-soft)' : 'rgba(255, 255, 255, 0.05)' }}
          >
            {connected ? <Cloud size={20} style={{ color: '#4ECDC4' }} /> : <CloudOff size={20} style={{ color: 'var(--slate-ghost)' }} />}
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--bright-chalk)' }}
            >
              {connected ? `已连接 @${username}` : 'GitHub Gist 同步'}
            </h3>
            <p className="text-xs" style={{ color: 'var(--slate-ghost)' }}>
              {connected
                ? lastSync ? `上次同步: ${new Date(lastSync).toLocaleString('zh-CN')}` : '已连接，等待首次同步'
                : '通过 GitHub Gist 跨设备同步数据'}
            </p>
          </div>
        </div>

        {!connected && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--silver-mist)' }}>
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="github_pat_xxxxxxxxxxxx"
                  className="input-field pr-10"
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--slate-ghost)' }}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div
              className="text-xs p-3 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--slate-ghost)' }}
            >
              <p className="mb-1">如何获取 Token：</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>打开 GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</li>
                <li>创建新 Token，Repository access 选 <strong style={{ color: 'var(--silver-mist)' }}>No repositories</strong></li>
                <li>在 Repository permissions 找到 <strong style={{ color: 'var(--silver-mist)' }}>Gist</strong>，选 Read and write</li>
                <li>复制 Token 粘贴到上方</li>
              </ol>
              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 transition-colors duration-200"
                style={{ color: '#E8941A' }}
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
          <div className="space-y-3">
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
                style={{ color: 'var(--coral-pulse)', border: '1px solid rgba(232, 107, 107, 0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--coral-soft)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <Unlink size={14} />
              </button>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--slate-ghost)' }}>
              数据变更后会自动推送到云端（约 5 秒延迟），也可手动推送/拉取
            </p>
            <button
              onClick={async () => {
                clearMessages()
                setStatus('syncing')
                try {
                  const result = await cleanupDuplicateGists(token.trim())
                  setStoredGistId(result.kept)
                  setMessage(`已清理：保留 1 个 Gist，删除 ${result.deleted} 个重复`)
                  setStatus('success')
                } catch (err) {
                  setError(err instanceof Error ? err.message : '清理失败')
                  setStatus('error')
                }
              }}
              disabled={syncing}
              className="text-[11px] w-full py-1.5 rounded-lg transition-all duration-200"
              style={{ color: 'var(--slate-ghost)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              清理重复 Gist（合并为一个）
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{ background: 'var(--teal-soft)', color: '#4ECDC4' }}
        >
          <Check size={16} /> {message}
        </div>
      )}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm animate-fade-in"
          style={{ background: 'var(--coral-soft)', color: '#E86B6B' }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Debug Panel */}
      <div className="glass-card p-4">
        <button
          onClick={() => { setShowDebug(!showDebug); if (!showDebug) handleDebug() }}
          className="flex items-center gap-2 text-xs w-full"
          style={{ color: 'var(--slate-ghost)' }}
        >
          <Bug size={14} />
          {showDebug ? '隐藏调试信息' : '显示调试信息'}
        </button>
        {showDebug && (
          <div className="mt-3">
            <button
              onClick={handleDebug}
              className="text-xs px-3 py-1 rounded-lg mb-2"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--silver-mist)' }}
            >
              刷新调试数据
            </button>
            <pre
              className="text-[11px] p-3 rounded-xl overflow-auto max-h-64"
              style={{
                background: 'rgba(0,0,0,0.25)',
                color: '#4ECDC4',
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {debugInfo || '点击"刷新调试数据"加载'}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
