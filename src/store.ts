import type { Category, TimeEntry, Goal, Milestone, CategoryMilestoneConfig } from './types'
import { MILESTONE_THRESHOLDS } from './types'

const CATEGORIES_KEY = 'skill-tracker-categories'
const ENTRIES_KEY = 'skill-tracker-entries'
const GOALS_KEY = 'skill-tracker-goals'
const MILESTONES_KEY = 'skill-tracker-milestones'
const CUSTOM_MILESTONES_KEY = 'skill-tracker-custom-milestones'
const DASHBOARD_SECTIONS_KEY = 'skill-tracker-dashboard-sections'

export interface DashboardSections {
  countdowns: boolean
  insights: boolean
  milestones: boolean
  goals: boolean
  skills: boolean
  recent: boolean
}

const DEFAULT_DASHBOARD_SECTIONS: DashboardSections = {
  countdowns: true,
  insights: true,
  milestones: true,
  goals: true,
  skills: true,
  recent: true,
}

export function loadDashboardSections(): DashboardSections {
  try {
    const raw = localStorage.getItem(DASHBOARD_SECTIONS_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      return { ...DEFAULT_DASHBOARD_SECTIONS, ...saved }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_DASHBOARD_SECTIONS }
}

export function saveDashboardSections(sections: DashboardSections) {
  localStorage.setItem(DASHBOARD_SECTIONS_KEY, JSON.stringify(sections))
}

export function loadCategories(): Category[] {
  const raw = localStorage.getItem(CATEGORIES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export function loadEntries(): TimeEntry[] {
  const raw = localStorage.getItem(ENTRIES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveEntries(entries: TimeEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function loadGoals(): Goal[] {
  const raw = localStorage.getItem(GOALS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveGoals(goals: Goal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

export function getGoalForCategory(categoryId: string, goals: Goal[]): Goal | undefined {
  return goals.find(g => g.categoryId === categoryId)
}

export function loadMilestones(): Milestone[] {
  const raw = localStorage.getItem(MILESTONES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveMilestones(milestones: Milestone[]) {
  localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones))
}

export function loadCustomMilestoneConfigs(): CategoryMilestoneConfig[] {
  const raw = localStorage.getItem(CUSTOM_MILESTONES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveCustomMilestoneConfigs(configs: CategoryMilestoneConfig[]) {
  localStorage.setItem(CUSTOM_MILESTONES_KEY, JSON.stringify(configs))
}

export function getCustomMilestonesForCategory(categoryId: string, configs: CategoryMilestoneConfig[]): number[] {
  return configs.find(c => c.categoryId === categoryId)?.customThresholds ?? []
}

export function saveCustomMilestonesForCategory(categoryId: string, thresholds: number[], configs: CategoryMilestoneConfig[]): CategoryMilestoneConfig[] {
  const idx = configs.findIndex(c => c.categoryId === categoryId)
  let updated: CategoryMilestoneConfig[]
  if (idx >= 0) {
    updated = configs.map(c => c.categoryId === categoryId ? { ...c, customThresholds: thresholds } : c)
  } else {
    updated = [...configs, { categoryId, customThresholds: thresholds }]
  }
  saveCustomMilestoneConfigs(updated)
  return updated
}

export function detectNewMilestones(
  categoryId: string,
  totalMinutes: number,
  milestones: Milestone[],
  customThresholds?: number[]
): number[] {
  const totalHours = totalMinutes / 60
  const achieved = new Set(
    milestones.filter(m => m.categoryId === categoryId).map(m => m.milestoneHours)
  )
  const thresholds = customThresholds && customThresholds.length > 0
    ? [...new Set([...MILESTONE_THRESHOLDS, ...customThresholds])].sort((a, b) => a - b)
    : MILESTONE_THRESHOLDS
  return thresholds.filter(h => totalHours >= h && !achieved.has(h))
}

export function getMilestonesForCategory(categoryId: string, milestones: Milestone[]): Milestone[] {
  return milestones
    .filter(m => m.categoryId === categoryId)
    .sort((a, b) => b.milestoneHours - a.milestoneHours)
}

export function getCategoryTotalTime(categoryId: string, entries: TimeEntry[], categories: Category[]): number {
  // 包含子分类的时间
  const descendantIds = getDescendantIds(categoryId, categories)
  const allIds = [categoryId, ...descendantIds]
  return entries
    .filter(e => allIds.includes(e.categoryId))
    .reduce((sum, e) => sum + e.duration, 0)
}

export function getDescendantIds(categoryId: string, categories: Category[]): string[] {
  const children = categories.filter(c => c.parentId === categoryId)
  let ids = children.map(c => c.id)
  for (const child of children) {
    ids = [...ids, ...getDescendantIds(child.id, categories)]
  }
  return ids
}

export function getTopCategories(categories: Category[]): Category[] {
  return categories.filter(c => c.parentId === null)
}

export function getChildCategories(parentId: string | null, categories: Category[]): Category[] {
  return categories.filter(c => c.parentId === parentId)
}

export function getCategoryPath(categoryId: string, categories: Category[]): string {
  const parts: string[] = []
  let current = categories.find(c => c.id === categoryId)
  while (current) {
    parts.unshift(current.name)
    current = current.parentId ? categories.find(c => c.id === current!.parentId) : undefined
  }
  return parts.join(' / ')
}

export const PRESET_COLORS = [
  // 第一行：经典色
  '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa',
  '#ec4899', '#e11d48', '#ef4444', '#f97316',
  // 第二行：自然色
  '#f59e0b', '#eab308', '#84cc16', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#6ee7f2',
  // 第三行：柔和色
  '#fb923c', '#f472b6', '#c084fc', '#a3e635',
  '#fbbf24', '#34d399', '#38bdf8', '#e879f9',
]

// ─── 主题 ──────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light'

const THEME_KEY = 'skill-tracker-theme'

export function getTheme(): ThemeMode {
  const raw = localStorage.getItem(THEME_KEY)
  if (raw === 'light' || raw === 'dark') return raw
  return 'dark'
}

export function saveTheme(theme: ThemeMode) {
  localStorage.setItem(THEME_KEY, theme)
}

// Data export/import for sync
export function exportAllData() {
  return {
    categories: loadCategories(),
    entries: loadEntries(),
    goals: loadGoals(),
    milestones: loadMilestones(),
    customMilestoneConfigs: loadCustomMilestoneConfigs(),
  }
}

export function importAllData(data: { categories?: Category[]; entries?: TimeEntry[]; goals?: Goal[]; milestones?: Milestone[]; customMilestoneConfigs?: CategoryMilestoneConfig[] }) {
  if (data.categories) saveCategories(data.categories)
  if (data.entries) saveEntries(data.entries)
  if (data.goals) saveGoals(data.goals)
  if (data.milestones) saveMilestones(data.milestones)
  if (data.customMilestoneConfigs) saveCustomMilestoneConfigs(data.customMilestoneConfigs)
}

// Merge cloud data with local data (union by id, local wins on conflicts)
export function mergeAllData(cloud: { categories?: Category[]; entries?: TimeEntry[]; goals?: Goal[]; milestones?: Milestone[]; customMilestoneConfigs?: CategoryMilestoneConfig[] }, localOverride?: { categories?: Category[]; entries?: TimeEntry[]; goals?: Goal[]; milestones?: Milestone[]; customMilestoneConfigs?: CategoryMilestoneConfig[] }) {
  const local = localOverride ? {
    categories: localOverride.categories || [],
    entries: localOverride.entries || [],
    goals: localOverride.goals || [],
    milestones: localOverride.milestones || [],
    customMilestoneConfigs: localOverride.customMilestoneConfigs || [],
  } : exportAllData()
  console.log('[Merge] Local:', { cat: local.categories.length, entries: local.entries.length, goals: local.goals.length })
  console.log('[Merge] Cloud:', { cat: cloud.categories?.length, entries: cloud.entries?.length, goals: cloud.goals?.length })

  const mergeById = <T extends { id: string }>(localArr: T[], cloudArr: T[]): T[] => {
    const map = new Map<string, T>()
    for (const item of cloudArr) map.set(item.id, item)
    for (const item of localArr) map.set(item.id, item) // local wins on conflict
    return Array.from(map.values())
  }

  const mergeByKey = <T extends { categoryId: string }>(localArr: T[], cloudArr: T[]): T[] => {
    const map = new Map<string, T>()
    for (const item of cloudArr) map.set(item.categoryId, item)
    for (const item of localArr) map.set(item.categoryId, item) // local wins on conflict
    return Array.from(map.values())
  }

  const merged = {
    categories: mergeById(local.categories, cloud.categories || []),
    entries: mergeById(local.entries, cloud.entries || []),
    goals: mergeById(local.goals, cloud.goals || []),
    milestones: mergeById(local.milestones, cloud.milestones || []),
    customMilestoneConfigs: mergeByKey(local.customMilestoneConfigs || [], cloud.customMilestoneConfigs || []),
  }

  console.log('[Merge] Result:', { cat: merged.categories.length, entries: merged.entries.length, goals: merged.goals.length })

  saveCategories(merged.categories)
  saveEntries(merged.entries)
  saveGoals(merged.goals)
  saveMilestones(merged.milestones)
  saveCustomMilestoneConfigs(merged.customMilestoneConfigs)

  // Verify save
  const verify = exportAllData()
  console.log('[Merge] Verify after save:', { cat: verify.categories.length, entries: verify.entries.length })

  return merged
}
