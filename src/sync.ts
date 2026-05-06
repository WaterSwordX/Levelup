import type { Category, TimeEntry, Goal, Milestone } from './types'
import { getSupabaseClient, isSupabaseConfigured } from './lib/supabase'
import type { User } from '@supabase/supabase-js'

const LAST_SYNC_KEY = 'skill-tracker-last-sync'
const SYNCED_AT_KEY = 'skill-tracker-synced-at'

export interface SyncData {
  categories: Category[]
  entries: TimeEntry[]
  goals: Goal[]
  milestones: Milestone[]
  synced_at: string
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

// ===== Auth =====

export async function signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { user: null, error: '请先配置 Supabase' }

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { user: null, error: error.message }
  return { user: data.user, error: null }
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { user: null, error: '请先配置 Supabase' }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  return { user: data.user, error: null }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return
  await supabase.auth.signOut()
  localStorage.removeItem(SYNCED_AT_KEY)
  localStorage.removeItem(LAST_SYNC_KEY)
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = getSupabaseClient()
  if (!supabase) return () => {}

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}

// ===== Data Sync =====

export async function pushToCloud(data: SyncData): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('请先配置 Supabase')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: user.id,
      categories: data.categories,
      entries: data.entries,
      goals: data.goals,
      milestones: data.milestones,
      synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw new Error(`同步失败: ${error.message}`)
  setLastSyncTime()
}

export async function pullFromCloud(): Promise<SyncData | null> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('请先配置 Supabase')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('user_data')
    .select('categories, entries, goals, milestones, synced_at')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No data found
    throw new Error(`拉取失败: ${error.message}`)
  }

  setLastSyncTime()
  return data as SyncData
}

export async function autoSync(localData: SyncData): Promise<{ action: 'pushed' | 'pulled' | 'conflict' | 'none'; cloudData?: SyncData }> {
  if (!isSupabaseConfigured()) return { action: 'none' }

  const user = await getCurrentUser()
  if (!user) return { action: 'none' }

  try {
    const cloudData = await pullFromCloud()

    if (!cloudData) {
      // No cloud data, push local
      await pushToCloud(localData)
      return { action: 'pushed' }
    }

    const localSyncedAt = localStorage.getItem(SYNCED_AT_KEY)
    const cloudTime = new Date(cloudData.synced_at).getTime()
    const localTime = localSyncedAt ? new Date(localSyncedAt).getTime() : 0

    if (localTime > cloudTime) {
      // Local has newer changes
      await pushToCloud(localData)
      return { action: 'pushed' }
    } else if (cloudTime > localTime) {
      // Cloud has newer changes
      return { action: 'conflict', cloudData }
    }

    return { action: 'none' }
  } catch {
    return { action: 'none' }
  }
}

// ===== Helpers =====

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

function setLastSyncTime() {
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
  localStorage.setItem(SYNCED_AT_KEY, new Date().toISOString())
}

export function markLocalChange() {
  // Called when local data changes, so autoSync knows to push
  localStorage.removeItem(SYNCED_AT_KEY)
}
