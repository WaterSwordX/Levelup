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
  return localStorage.getItem(GIST_ID_KEY)
}

export function setStoredGistId(id: string | null) {
  if (id) {
    localStorage.setItem(GIST_ID_KEY, id)
  } else {
    localStorage.removeItem(GIST_ID_KEY)
  }
}

// Last sync time
export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

function setLastSyncTime() {
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
}

// Check if sync is configured
export function isSyncConfigured(): boolean {
  return !!getStoredToken() && !!getStoredGistId()
}

// GitHub Gist API
const GIST_API = 'https://api.github.com/gists'

function gistHeaders(token: string): HeadersInit {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

export async function createGist(token: string, data: SyncData): Promise<string> {
  const resp = await fetch(GIST_API, {
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

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`创建 Gist 失败: ${resp.status} ${err.message || ''}`)
  }

  const result = await resp.json()
  return result.id
}

export async function updateGist(token: string, gistId: string, data: SyncData): Promise<void> {
  const resp = await fetch(`${GIST_API}/${gistId}`, {
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

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`更新 Gist 失败: ${resp.status} ${err.message || ''}`)
  }
}

export async function readGist(token: string, gistId: string): Promise<SyncData> {
  const resp = await fetch(`${GIST_API}/${gistId}`, {
    headers: gistHeaders(token),
  })

  if (!resp.ok) {
    if (resp.status === 404) throw new Error('Gist 不存在，请检查 Gist ID')
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
    const resp = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
    })
    if (!resp.ok) return { valid: false }
    const user = await resp.json()
    return { valid: true, username: user.login }
  } catch {
    return { valid: false }
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
