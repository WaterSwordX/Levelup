import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL_KEY = 'skill-tracker-supabase-url'
const SUPABASE_KEY_KEY = 'skill-tracker-supabase-key'

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || ''
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export function getSupabaseUrl(): string {
  return localStorage.getItem(SUPABASE_URL_KEY) || DEFAULT_URL
}

export function getSupabaseKey(): string {
  return localStorage.getItem(SUPABASE_KEY_KEY) || DEFAULT_KEY
}

export function setSupabaseConfig(url: string, key: string) {
  // Normalize URL: remove trailing slash
  const cleanUrl = url.trim().replace(/\/+$/, '')
  localStorage.setItem(SUPABASE_URL_KEY, cleanUrl)
  localStorage.setItem(SUPABASE_KEY_KEY, key.trim())
}

export function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_URL_KEY)
  localStorage.removeItem(SUPABASE_KEY_KEY)
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  // Basic validation: URL should look like https://xxx.supabase.co
  return !!url && !!key && url.startsWith('https://') && url.includes('.supabase.co')
}

export function getSupabaseClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  if (!url || !key) return null
  return createClient(url, key)
}
