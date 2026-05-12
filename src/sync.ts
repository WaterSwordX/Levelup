import type { Category, TimeEntry, Goal, Milestone } from './types'

const GIST_ID_KEY = 'skill-tracker-gist-id'
const GITHUB_TOKEN_KEY = 'skill-tracker-github-token'
const LAST_SYNC_KEY = 'skill-tracker-last-sync'
const GIST_FILENAME = 'levelup-data.json'

export interface SyncData {
  categories: Category[]
  entries: TimeEntry[]
  goals: Goal[]
  milestones: Milestone[]
  syncedAt: string
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

// Token management
export function getStoredToken(): string | null {
  return localStorage.getItem(GITHUB_TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(GITHUB_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(GITHUB_TOKEN_KEY)
  }
}

// Gist ID management
export function getStoredGistId(): string | null {
  const raw = localStorage.getItem(GIST_ID_KEY)
  if (!raw) return null
  // Sanitize: Gist IDs are hex-only (0-9, a-f). Fix common confusable chars.
  const sanitized = raw.replace(/[lLiIoO]/g, c => {
    if (c === 'l' || c === 'L' || c === 'i' || c === 'I') return '1'
    if (c === 'o' || c === 'O') return '0'
    return c
  })
  if (sanitized !== raw) {
    console.warn('[Sync] Gist ID contained non-hex chars, auto-corrected:', raw, '->', sanitized)
    localStorage.setItem(GIST_ID_KEY, sanitized)
  }
  return sanitized
}

export function setStoredGistId(id: string | null) {
  if (id) {
    // Ensure only valid hex characters
    const clean = id.replace(/[^0-9a-f]/g, '')
    localStorage.setItem(GIST_ID_KEY, clean)
  } else {
    localStorage.removeItem(GIST_ID_KEY)
  }
}

// Last sync time
export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

export function setLastSyncTime() {
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
}

// Check if sync is configured
export function isSyncConfigured(): boolean {
  return !!getStoredToken() && !!getStoredGistId()
}

// GitHub Gist API
const GIST_API = 'https://api.github.com/gists'

// Bypass Service Worker cache by appending a timestamp to URLs
function bustCache(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}_t=${Date.now()}`
}

function gistHeaders(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

export async function createGist(token: string, data: SyncData): Promise<string> {
  let resp: Response
  try {
    resp = await fetch(bustCache(GIST_API), {
      method: 'POST',
      headers: gistHeaders(token),
      body: JSON.stringify({
        description: 'Levelup — skill tracker data (auto-sync)',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw new Error(`请求失败: ${msg}`)
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`创建 Gist 失败: ${resp.status} ${err.message || ''}`)
  }

  const result = await resp.json()
  return result.id
}

export async function updateGist(token: string, gistId: string, data: SyncData): Promise<void> {
  let resp: Response
  try {
    resp = await fetch(bustCache(`${GIST_API}/${gistId}`), {
      method: 'PATCH',
      headers: gistHeaders(token),
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw new Error(`请求失败: ${msg}`)
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`更新 Gist 失败: ${resp.status} ${err.message || ''}`)
  }
}

export async function readGist(token: string, gistId: string): Promise<SyncData> {
  let resp: Response
  try {
    resp = await fetch(bustCache(`${GIST_API}/${gistId}`), {
      headers: gistHeaders(token),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw new Error(`请求失败: ${msg}`)
  }

  if (!resp.ok) {
    if (resp.status === 404) throw new Error('Gist 不存在，请检查 Gist ID 或重新连接')
    if (resp.status === 401 || resp.status === 403) throw new Error('Token 无效或已过期，请重新连接')
    throw new Error(`读取 Gist 失败: ${resp.status}`)
  }

  const result = await resp.json()
  const file = result.files?.[GIST_FILENAME]
  if (!file) throw new Error('Gist 中未找到 Levelup 数据文件')

  return JSON.parse(file.content)
}

// Verify token is valid
export async function verifyToken(token: string): Promise<{ valid: boolean; username?: string }> {
  try {
    const resp = await fetch(bustCache('https://api.github.com/user'), {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
    })
    if (!resp.ok) return { valid: false }
    const user = await resp.json()
    return { valid: true, username: user.login }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    return { valid: false }
  }
}

// Search for existing Levelup Gist in user's Gists
export async function findExistingGist(token: string): Promise<string | null> {
  try {
    console.log('[Sync] Searching for existing Gist...')
    const resp = await fetch(bustCache(`${GIST_API}?per_page=100`), {
      headers: gistHeaders(token),
    })
    console.log('[Sync] Gist list response:', resp.status)
    if (!resp.ok) {
      console.log('[Sync] Failed to list Gists:', resp.status)
      return null
    }

    const gists = await resp.json()
    console.log('[Sync] Found', gists.length, 'Gists total')
    for (const g of gists) {
      console.log('[Sync] Gist:', g.id, '| desc:', g.description, '| files:', Object.keys(g.files || {}))
    }

    const match = gists.find((g: { description: string; files: Record<string, unknown> }) =>
      g.description?.includes('Levelup') && g.files?.[GIST_FILENAME]
    )
    console.log('[Sync] Match found:', match ? match.id : 'none')
    return match ? match.id : null
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    console.log('[Sync] findExistingGist error:', e)
    return null
  }
}

// Find the best existing Gist with actual data (most entries)
export async function findBestExistingGist(token: string): Promise<string | null> {
  try {
    console.log('[Sync] Searching for best existing Gist...')
    const resp = await fetch(bustCache(`${GIST_API}?per_page=100`), {
      headers: gistHeaders(token),
    })
    if (!resp.ok) return null

    const gists = await resp.json()
    const candidates = gists.filter((g: { description: string; files: Record<string, unknown> }) =>
      g.description?.includes('Levelup') && g.files?.[GIST_FILENAME]
    )

    if (candidates.length === 0) return null
    if (candidates.length === 1) return candidates[0].id

    // Multiple matches: read each and pick the one with the most data
    console.log('[Sync] Found', candidates.length, 'matching Gists, comparing data...')
    let bestId = candidates[0].id
    let bestScore = -1

    for (const g of candidates) {
      try {
        const data = await readGist(token, g.id)
        const score = (data.categories?.length || 0) + (data.entries?.length || 0) + (data.goals?.length || 0)
        console.log('[Sync] Gist', g.id, 'score:', score, '(categories:', data.categories?.length, 'entries:', data.entries?.length, ')')
        if (score > bestScore) {
          bestScore = score
          bestId = g.id
        }
      } catch {
        console.log('[Sync] Failed to read Gist', g.id, ', skipping')
      }
    }

    console.log('[Sync] Best Gist:', bestId, 'with score:', bestScore)
    return bestId
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    console.log('[Sync] findBestExistingGist error:', e)
    return null
  }
}

// Push local data to cloud
export async function syncToCloud(data: SyncData): Promise<void> {
  const token = getStoredToken()
  if (!token) throw new Error('未配置 GitHub Token')

  const gistId = getStoredGistId()
  if (gistId) {
    await updateGist(token, gistId, data)
  } else {
    const newId = await createGist(token, data)
    setStoredGistId(newId)
  }
  setLastSyncTime()
}

// Pull data from cloud
export async function syncFromCloud(): Promise<SyncData> {
  const token = getStoredToken()
  const gistId = getStoredGistId()
  if (!token || !gistId) throw new Error('未配置同步')

  const data = await readGist(token, gistId)

  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new Error('云端数据格式无效')
  }

  // Ensure arrays exist (normalize missing fields to empty arrays)
  data.categories = Array.isArray(data.categories) ? data.categories : []
  data.entries = Array.isArray(data.entries) ? data.entries : []
  data.goals = Array.isArray(data.goals) ? data.goals : []
  data.milestones = Array.isArray(data.milestones) ? data.milestones : []

  setLastSyncTime()
  return data
}

// Auto sync: compare timestamps and decide push/pull
export async function autoSync(localData: SyncData): Promise<{ action: 'pushed' | 'pulled' | 'none'; data?: SyncData }> {
  if (!isSyncConfigured()) return { action: 'none' }

  try {
    const cloudData = await syncFromCloud()
    const localTime = new Date(localData.syncedAt).getTime()
    const cloudTime = new Date(cloudData.syncedAt).getTime()

    if (localTime > cloudTime) {
      await syncToCloud(localData)
      return { action: 'pushed' }
    } else if (cloudTime > localTime) {
      return { action: 'pulled', data: cloudData }
    }
    return { action: 'none' }
  } catch {
    await syncToCloud(localData)
    return { action: 'pushed' }
  }
}

// Disconnect sync
export function disconnectSync() {
  setStoredToken(null)
  setStoredGistId(null)
  localStorage.removeItem(LAST_SYNC_KEY)
}

// Clean up duplicate Gists: keep the best one, delete the rest
export async function cleanupDuplicateGists(token: string): Promise<{ kept: string; deleted: number }> {
  let resp: Response
  try {
    resp = await fetch(bustCache(`${GIST_API}?per_page=100`), {
      headers: gistHeaders(token),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::')) {
      throw new Error('网络连接失败，请检查网络后重试')
    }
    throw new Error(`请求失败: ${msg}`)
  }
  if (!resp.ok) throw new Error(`无法列出 Gists: ${resp.status}`)

  const gists = await resp.json()
  const candidates = gists.filter((g: { description: string; files: Record<string, unknown> }) =>
    g.description?.includes('Levelup') && g.files?.[GIST_FILENAME]
  )

  if (candidates.length <= 1) {
    return { kept: candidates[0]?.id || '', deleted: 0 }
  }

  // Read all candidates and pick the best one
  let bestId = candidates[0].id
  let bestScore = -1
  const scores = new Map<string, number>()

  for (const g of candidates) {
    try {
      const data = await readGist(token, g.id)
      const score = (data.categories?.length || 0) + (data.entries?.length || 0) + (data.goals?.length || 0)
      scores.set(g.id, score)
      if (score > bestScore) {
        bestScore = score
        bestId = g.id
      }
    } catch {
      scores.set(g.id, -1)
    }
  }

  console.log('[Sync] Cleanup: keeping Gist', bestId, 'with score', bestScore)

  // Delete all except the best one
  let deleted = 0
  for (const g of candidates) {
    if (g.id === bestId) continue
    try {
      const delResp = await fetch(bustCache(`${GIST_API}/${g.id}`), {
        method: 'DELETE',
        headers: gistHeaders(token),
      })
      if (delResp.ok) {
        deleted++
        console.log('[Sync] Deleted duplicate Gist:', g.id)
      }
    } catch {
      console.log('[Sync] Failed to delete Gist:', g.id)
    }
  }

  return { kept: bestId, deleted }
}
