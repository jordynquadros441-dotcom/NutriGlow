'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { CustomFoodModal } from '@/components/custom-food-modal'
import { DateNavigator } from '@/components/date-navigator'
import { FoodLogger } from '@/components/food-logger'
import { HydrationTracker } from '@/components/hydration-tracker'
import { MacroSummary } from '@/components/macro-summary'
import { MealTimeline } from '@/components/meal-timeline'
import { MicronutrientPanel } from '@/components/micronutrient-panel'
import { StreakBadge } from '@/components/streak-badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useLocalStorage } from '@/hooks/use-local-storage'
import {
  DEFAULT_GOALS,
  DEFAULT_QUICK_ADDS,
  EMPTY_DAY,
  EMPTY_TOTALS,
  FOOD_DATABASE,
  computeStreak,
  dateKey,
  makeId,
  scaleFood,
  sumEntries,
  toGrams,
  type DayStore,
  type Food,
  type Goals,
  type LogEntry,
  type MealCategory,
  type QuickAdd,
  type Unit,
} from '@/lib/nutrition'

const KEYS = {
  days: 'nutriglow:days',
  goals: 'nutriglow:goals',
  foods: 'nutriglow:custom-foods',
  quickAdds: 'nutriglow:quick-adds',
}

export function NutritionDashboard() {
  const [store, setStore, storeReady] = useLocalStorage<DayStore>(KEYS.days, {})
  const [goals, setGoals, goalsReady] = useLocalStorage<Goals>(KEYS.goals, DEFAULT_GOALS)
  const [customFoods, setCustomFoods] = useLocalStorage<Food[]>(KEYS.foods, [])
  const [quickAdds, setQuickAdds] = useLocalStorage<QuickAdd[]>(
    KEYS.quickAdds,
    DEFAULT_QUICK_ADDS,
  )

  // Resolved after mount so server and client markup agree.
  const [todayKey, setTodayKey] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const k = dateKey(new Date())
    setTodayKey(k)
    setActiveKey(k)
  }, [])

  // Clear the transient "copied" notice.
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 3000)
    return () => window.clearTimeout(t)
  }, [notice])

  const ready = storeReady && goalsReady && todayKey !== null && activeKey !== null
  const readOnly = activeKey !== todayKey
  const day = (activeKey ? store[activeKey] : undefined) ?? EMPTY_DAY

  const totals = useMemo(
    () => (day.entries.length ? sumEntries(day.entries) : { ...EMPTY_TOTALS }),
    [day.entries],
  )

  const allFoods = useMemo(
    () => [...customFoods, ...FOOD_DATABASE],
    [customFoods],
  )

  const streak = useMemo(
    () => (todayKey ? computeStreak(store, todayKey) : 0),
    [store, todayKey],
  )

  const loggedKeys = useMemo(() => {
    const s = new Set<string>()
    for (const [k, v] of Object.entries(store)) {
      if (v && (v.entries.length > 0 || v.waterMl > 0)) s.add(k)
    }
    return s
  }, [store])

  /** Mutate a single day in the date-indexed store. */
  const patchDay = useCallback(
    (key: string, fn: (d: typeof EMPTY_DAY) => typeof EMPTY_DAY) => {
      setStore((prev) => ({ ...prev, [key]: fn(prev[key] ?? EMPTY_DAY) }))
    },
    [setStore],
  )

  const logFood = useCallback(
    (food: Food, quantity: number, unit: Unit, meal: MealCategory) => {
      if (!todayKey) return
      const grams = toGrams(quantity, unit, food)
      const scaled = scaleFood(food, grams)
      const entry: LogEntry = {
        id: makeId(),
        foodId: food.id,
        foodName: food.name,
        meal,
        quantity,
        unit,
        grams,
        loggedAt: Date.now(),
        ...scaled,
      }
      patchDay(todayKey, (d) => ({ ...d, entries: [...d.entries, entry] }))
    },
    [patchDay, todayKey],
  )

  const removeEntry = useCallback(
    (id: string) => {
      if (!activeKey) return
      patchDay(activeKey, (d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }))
    },
    [patchDay, activeKey],
  )

  const copyToToday = useCallback(() => {
    if (!todayKey || !activeKey) return
    const source = store[activeKey]
    if (!source || source.entries.length === 0) return
    const now = Date.now()
    const copies: LogEntry[] = source.entries.map((e) => ({
      ...e,
      id: makeId(),
      loggedAt: now,
    }))
    patchDay(todayKey, (d) => ({ ...d, entries: [...d.entries, ...copies] }))
    setNotice(`Copied ${copies.length} item${copies.length === 1 ? '' : 's'} to today`)
    setActiveKey(todayKey)
  }, [store, activeKey, todayKey, patchDay])

  const addWater = useCallback(
    (ml: number) => {
      if (!todayKey) return
      patchDay(todayKey, (d) => ({ ...d, waterMl: Math.max(0, d.waterMl + ml) }))
    },
    [patchDay, todayKey],
  )

  const resetWater = useCallback(() => {
    if (!todayKey) return
    patchDay(todayKey, (d) => ({ ...d, waterMl: 0 }))
  }, [patchDay, todayKey])

  const changeGoals = useCallback(
    (patch: Partial<Goals>) => setGoals((g) => ({ ...g, ...patch })),
    [setGoals],
  )

  const changeQuickAdd = useCallback(
    (id: QuickAdd['id'], ml: number) =>
      setQuickAdds((prev) => prev.map((q) => (q.id === id ? { ...q, ml } : q))),
    [setQuickAdds],
  )

  const saveCustomFood = useCallback(
    (food: Food) => setCustomFoods((prev) => [food, ...prev]),
    [setCustomFoods],
  )

  if (!ready) return <DashboardSkeleton />

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-lg font-semibold tracking-tight">NutriGlow</h1>
          <StreakBadge streak={streak} />
        </div>
        <ThemeToggle />
      </header>

      <DateNavigator
        activeKey={activeKey}
        todayKey={todayKey}
        onNavigate={setActiveKey}
        loggedKeys={loggedKeys}
      />

      <div aria-live="polite" className="sr-only">
        {notice}
      </div>
      {notice ? (
        <p className="rounded-lg border border-primary/25 bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
          {notice}
        </p>
      ) : null}

      {/* Asymmetric split: analysis on the left, input rail on the right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          <MacroSummary
            totals={totals}
            goals={goals}
            onGoalChange={changeGoals}
            onResetGoals={() => setGoals({ ...DEFAULT_GOALS })}
            readOnly={readOnly}
          />
          <MealTimeline
            entries={day.entries}
            onRemove={removeEntry}
            onCopyToToday={copyToToday}
            readOnly={readOnly}
          />
        </div>

        <div className="flex flex-col gap-5">
          {readOnly ? (
            <section className="rounded-xl border border-dashed border-border bg-card p-5">
              <h2 className="text-sm font-semibold tracking-tight">Read-only day</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                You can only log new food on today. Use{' '}
                <span className="font-medium text-foreground">Copy to today</span> to reuse
                these meals.
              </p>
            </section>
          ) : (
            <FoodLogger
              foods={allFoods}
              onLog={logFood}
              onCreateCustom={() => setModalOpen(true)}
            />
          )}

          <HydrationTracker
            waterMl={day.waterMl}
            goalMl={goals.waterMl}
            quickAdds={quickAdds}
            onAddWater={addWater}
            onResetWater={resetWater}
            onGoalChange={(ml) => changeGoals({ waterMl: ml })}
            onQuickAddChange={changeQuickAdd}
            readOnly={readOnly}
          />

          <MicronutrientPanel
            totals={totals}
            goals={goals}
            onGoalChange={changeGoals}
            readOnly={readOnly}
          />
        </div>
      </div>

      <CustomFoodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveCustomFood}
      />
    </div>
  )
}

/** Matches the real layout so there is no jump when data arrives. */
function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
      <span className="sr-only">Loading your nutrition data</span>
      <div className="flex items-center justify-between gap-3">
        <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
        <div className="size-8 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-14 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
          <div className="h-56 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
