export interface Category {
  id: string
  name: string
  parentId: string | null
  color: string
  createdAt: string
  startDate?: string // YYYY-MM-DD 正数日：从此日期开始计数
  targetDate?: string // YYYY-MM-DD 倒数日：目标日期
  showCountdown?: boolean // 是否显示计时日
  countdownMode?: 'countup' | 'countdown' // 正数 or 倒数
  pinned?: boolean // 置顶
  note?: string // 备注
  standalone?: boolean // 计时日独立条目，不显示在分类列表
}

export interface TimeEntry {
  id: string
  categoryId: string
  description: string
  duration: number // 分钟
  date: string // YYYY-MM-DD
  createdAt: string
  startTime?: string // HH:MM 可选的开始时间
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

export interface CategoryMilestoneConfig {
  categoryId: string
  customThresholds: number[]
}

export interface MilestoneTier {
  label: string
  minHours: number
  maxHours: number
  color: string
}

export const MILESTONE_TIERS: MilestoneTier[] = [
  { label: '100h 级', minHours: 100, maxHours: 499, color: '#4ECDC4' },
  { label: '500h 级', minHours: 500, maxHours: 999, color: '#A78BFA' },
  { label: '1000h 级', minHours: 1000, maxHours: 4999, color: '#E8941A' },
  { label: '5000h 级', minHours: 5000, maxHours: Infinity, color: '#E86B6B' },
]
