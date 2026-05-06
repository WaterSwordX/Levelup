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
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
  '#e11d48', '#84cc16',
]

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
