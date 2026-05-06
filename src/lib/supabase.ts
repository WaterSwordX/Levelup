import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL_KEY = 'skill-tracker-supabase-url'
const SUPABASE_KEY_KEY = 'skill-tracker-supabase-key'

// Default project — user can override in settings
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || ''
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export function getSupabaseUrl(): string {
  return localStorage.getItem(SUPABASE_URL_KEY) || DEFAULT_URL
}

export function getSupabaseKey(): string {
  return localStorage.getItem(SUPABASE_KEY_KEY) || DEFAULT_KEY
}

export function setSupabaseConfig(url: string, key: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url)
  localStorage.setItem(SUPABASE_KEY_KEY, key)
}

export function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_URL_KEY)
  localStorage.removeItem(SUPABASE_KEY_KEY)
}

export function isSupabaseConfigured(): boolean {
  return !!getSupabaseUrl() && !!getSupabaseKey()
}

export function getSupabaseClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  if (!url || !key) return null
  return createClient(url, key)
}
