import type { Category, TimeEntry, Goal, Milestone } from './types'
import { MILESTONE_THRESHOLDS } from './types'

const CATEGORIES_KEY = 'skill-tracker-categories'
const ENTRIES_KEY = 'skill-tracker-entries'
const GOALS_KEY = 'skill-tracker-goals'
const MILESTONES_KEY = 'skill-tracker-milestones'

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

export function detectNewMilestones(
  categoryId: string,
  totalMinutes: number,
  milestones: Milestone[]
): number[] {
  const totalHours = totalMinutes / 60
  const achieved = new Set(
    milestones.filter(m => m.categoryId === categoryId).map(m => m.milestoneHours)
  )
  return MILESTONE_THRESHOLDS.filter(h => totalHours >= h && !achieved.has(h))
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

export type ThemeMode = 'dark' | 'light' | 'warm'

const THEME_KEY = 'skill-tracker-theme'

export function getTheme(): ThemeMode {
  const raw = localStorage.getItem(THEME_KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'warm') return raw
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
  }
}

export function importAllData(data: { categories?: Category[]; entries?: TimeEntry[]; goals?: Goal[]; milestones?: Milestone[] }) {
  if (data.categories) saveCategories(data.categories)
  if (data.entries) saveEntries(data.entries)
  if (data.goals) saveGoals(data.goals)
  if (data.milestones) saveMilestones(data.milestones)
}

// Merge cloud data with local data (union by id, local wins on conflicts)
export function mergeAllData(cloud: { categories?: Category[]; entries?: TimeEntry[]; goals?: Goal[]; milestones?: Milestone[] }, localOverride?: { categories?: Category[]; entries?: TimeEntry[]; goals?: Goal[]; milestones?: Milestone[] }) {
  const local = localOverride ? {
    categories: localOverride.categories || [],
    entries: localOverride.entries || [],
    goals: localOverride.goals || [],
    milestones: localOverride.milestones || [],
  } : exportAllData()
  console.log('[Merge] Local:', { cat: local.categories.length, entries: local.entries.length, goals: local.goals.length })
  console.log('[Merge] Cloud:', { cat: cloud.categories?.length, entries: cloud.entries?.length, goals: cloud.goals?.length })

  const mergeById = <T extends { id: string }>(localArr: T[], cloudArr: T[]): T[] => {
    const map = new Map<string, T>()
    for (const item of cloudArr) map.set(item.id, item)
    for (const item of localArr) map.set(item.id, item) // local wins on conflict
    return Array.from(map.values())
  }

  const merged = {
    categories: mergeById(local.categories, cloud.categories || []),
    entries: mergeById(local.entries, cloud.entries || []),
    goals: mergeById(local.goals, cloud.goals || []),
    milestones: mergeById(local.milestones, cloud.milestones || []),
  }

  console.log('[Merge] Result:', { cat: merged.categories.length, entries: merged.entries.length, goals: merged.goals.length })

  saveCategories(merged.categories)
  saveEntries(merged.entries)
  saveGoals(merged.goals)
  saveMilestones(merged.milestones)

  // Verify save
  const verify = exportAllData()
  console.log('[Merge] Verify after save:', { cat: verify.categories.length, entries: verify.entries.length })

  return merged
}
