import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import type { Category, TimeEntry, Goal, Milestone, CategoryMilestoneConfig } from './types'
import { loadCategories, loadEntries, loadGoals, loadMilestones, saveMilestones, detectNewMilestones, getCategoryTotalTime, getTheme, loadCustomMilestoneConfigs, getCustomMilestonesForCategory } from './store'
import { isSyncConfigured, syncToCloud } from './sync'

const Record = lazy(() => import('./pages/Record'))
const Focus = lazy(() => import('./pages/Focus'))
const Stats = lazy(() => import('./pages/Stats'))
const Guide = lazy(() => import('./pages/Guide'))
const Settings = lazy(() => import('./pages/Settings'))
const Days = lazy(() => import('./pages/Days'))
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[var(--ghost-border)] border-t-[var(--ember-glow)] rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [customConfigs, setCustomConfigs] = useState<CategoryMilestoneConfig[]>([])
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialLoadDone = useRef(false)
  // 用 ref 跟踪最新值，避免 checkMilestones 的闭包过期
  const catsRef = useRef<Category[]>([])
  const milsRef = useRef<Milestone[]>([])
  const cfgsRef = useRef<CategoryMilestoneConfig[]>([])

  useEffect(() => {
    const c = loadCategories()
    const e = loadEntries()
    const g = loadGoals()
    const m = loadMilestones()
    const cfgs = loadCustomMilestoneConfigs()
    setCategories(c)
    setEntries(e)
    setGoals(g)
    setMilestones(m)
    setCustomConfigs(cfgs)
    catsRef.current = c
    milsRef.current = m
    cfgsRef.current = cfgs
    document.documentElement.dataset.theme = getTheme()
    setTimeout(() => { initialLoadDone.current = true }, 1000)
  }, [])

  useEffect(() => { catsRef.current = categories }, [categories])
  useEffect(() => { milsRef.current = milestones }, [milestones])
  useEffect(() => { cfgsRef.current = customConfigs }, [customConfigs])

  const checkMilestones = useCallback((updatedEntries: TimeEntry[], currentCats: Category[], currentMils: Milestone[], currentCfgs: CategoryMilestoneConfig[]) => {
    const newMilestones: Milestone[] = []
    for (const cat of currentCats) {
      const total = getCategoryTotalTime(cat.id, updatedEntries, currentCats)
      const customThresholds = getCustomMilestonesForCategory(cat.id, currentCfgs)
      const newThresholds = detectNewMilestones(cat.id, total, currentMils, customThresholds)
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
      const updated = [...currentMils, ...newMilestones]
      setMilestones(updated)
      saveMilestones(updated)
    }
  }, [])

  const handleSetEntries = useCallback((newEntries: TimeEntry[]) => {
    setEntries(newEntries)
    checkMilestones(newEntries, catsRef.current, milsRef.current, cfgsRef.current)
  }, [checkMilestones])

  // 自动推送到云端（debounce 5 秒）
  useEffect(() => {
    if (!initialLoadDone.current) return
    if (!isSyncConfigured()) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      const data = { categories, entries, goals, milestones, customMilestoneConfigs: customConfigs, syncedAt: new Date().toISOString() }
      syncToCloud(data).catch(err => {
        console.warn('[AutoSync] 推送失败:', err.message)
      })
    }, 5000)
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [categories, entries, goals, milestones, customConfigs])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/category/:id" element={<CategoryDetail categories={categories} entries={entries} goals={goals} milestones={milestones} customConfigs={customConfigs} setCustomConfigs={setCustomConfigs} setMilestones={setMilestones} setCategories={setCategories} />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
