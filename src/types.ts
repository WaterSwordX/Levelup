export interface Category {
  id: string
  name: string
  parentId: string | null
  color: string
  createdAt: string
}

export interface TimeEntry {
  id: string
  categoryId: string
  description: string
  duration: number // 分钟
  date: string // YYYY-MM-DD
  createdAt: string
}

export interface Goal {
  id: string
  categoryId: string
  targetMinutes: number
  createdAt: string
}

export interface Milestone {
  id: string
  categoryId: string
  milestoneHours: number
  achievedAt: string
}

export const MILESTONE_THRESHOLDS = [1, 10, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
