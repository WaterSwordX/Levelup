import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Record from './pages/Record'
import Focus from './pages/Focus'
import Stats from './pages/Stats'
import Guide from './pages/Guide'
import Settings from './pages/Settings'
import Days from './pages/Days'
import type { Category, TimeEntry, Goal, Milestone } from './types'
import { loadCategories, loadEntries, loadGoals, loadMilestones, saveMilestones, detectNewMilestones, getCategoryTotalTime } from './store'
import { isSyncConfigured, syncToCloud } from './sync'

export default function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    setCategories(loadCategories())
    setEntries(loadEntries())
    setGoals(loadGoals())
    setMilestones(loadMilestones())
    // 延迟标记初始加载完成，避免首次加载触发自动同步
    setTimeout(() => { initialLoadDone.current = true }, 1000)
  }, [])

  // 检测新里程碑
  const checkMilestones = useCallback((updatedEntries: TimeEntry[]) => {
    const allCategories = loadCategories()
    const currentMilestones = loadMilestones()
    const newMilestones: Milestone[] = []

    for (const cat of allCategories) {
      const total = getCategoryTotalTime(cat.id, updatedEntries, allCategories)
      const newThresholds = detectNewMilestones(cat.id, total, currentMilestones)
      for (const hours of newThresholds) {
        newMilestones.push({
          id: crypto.randomUUID(),
          categoryId: cat.id,
          milestoneHours: hours,
          achievedAt: new Date().toISOString(),
        })
      }
    }

    if (newMilestones.length > 0) {
      const updated = [...currentMilestones, ...newMilestones]
      setMilestones(updated)
      saveMilestones(updated)
    }
  }, [])

  const handleSetEntries = useCallback((newEntries: TimeEntry[]) => {
    setEntries(newEntries)
    checkMilestones(newEntries)
  }, [checkMilestones])

  // 自动推送到云端（debounce 5 秒）
  useEffect(() => {
    if (!initialLoadDone.current) return
    if (!isSyncConfigured()) return

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      const data = { categories, entries, goals, milestones, syncedAt: new Date().toISOString() }
      syncToCloud(data).catch(err => {
        console.warn('[AutoSync] 推送失败:', err.message)
      })
    }, 5000)

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [categories, entries, goals, milestones])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard categories={categories} entries={entries} goals={goals} milestones={milestones} />} />
          <Route path="/categories" element={<Categories categories={categories} entries={entries} setCategories={setCategories} goals={goals} setGoals={setGoals} />} />
          <Route path="/record" element={<Record categories={categories} entries={entries} setEntries={handleSetEntries} />} />
          <Route path="/focus" element={<Focus categories={categories} entries={entries} setEntries={handleSetEntries} />} />
          <Route path="/stats" element={<Stats categories={categories} entries={entries} />} />
          <Route path="/days" element={<Days categories={categories} entries={entries} setCategories={setCategories} />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings currentData={{ categories, entries, goals, milestones }} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
