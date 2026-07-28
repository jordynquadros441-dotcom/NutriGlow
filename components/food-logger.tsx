'use client'

import { Plus, Search, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import {
  MEAL_CATEGORIES,
  UNITS,
  scaleFood,
  toGrams,
  type Food,
  type MealCategory,
  type Unit,
} from '@/lib/nutrition'

interface FoodLoggerProps {
  foods: Food[]
  onLog: (food: Food, quantity: number, unit: Unit, meal: MealCategory) => void
  onCreateCustom: () => void
}

export function FoodLogger({ foods, onLog, onCreateCustom }: FoodLoggerProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState<Unit>('servings')
  const [meal, setMeal] = useState<MealCategory>(() => defaultMeal())

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods.slice(0, 6)
    return foods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
  }, [foods, query])

  const qty = Number.parseFloat(quantity)
  const validQty = Number.isFinite(qty) && qty > 0
  const preview =
    selected && validQty ? scaleFood(selected, toGrams(qty, unit, selected)) : null

  function submit() {
    if (!selected || !validQty) return
    onLog(selected, qty, unit, meal)
    setSelected(null)
    setQuery('')
    setQuantity('1')
    setUnit('servings')
  }

  return (
    <section
      aria-labelledby="logger-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs"
    >
      <header className="flex items-center justify-between gap-2">
        <h2 id="logger-heading" className="text-sm font-semibold tracking-tight">
          Log food
        </h2>
        <button
          type="button"
          onClick={onCreateCustom}
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
        >
          <Sparkles aria-hidden="true" className="size-3" />
          Custom
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods"
          aria-label="Search foods"
          className="h-9 w-full rounded-lg border border-input bg-background pr-8 pl-8 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground outline-none"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            {`No matches for "${query}".`}
          </p>
          <button
            type="button"
            onClick={onCreateCustom}
            className="mt-2 text-xs font-medium text-primary underline-offset-4 hover:underline outline-none"
          >
            Create it as a custom food
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {results.map((f) => {
            const active = selected?.id === f.id
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelected(active ? null : f)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.99] outline-none',
                    active
                      ? 'border-primary/40 bg-accent'
                      : 'border-transparent hover:border-border hover:bg-muted',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {f.name}
                    {f.custom ? (
                      <span className="ml-1.5 text-[0.65rem] font-normal text-muted-foreground">
                        custom
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-mono text-[0.7rem] tabular text-muted-foreground">
                    {f.calories} kcal/100g
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Quantity + meal */}
      {selected ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-end gap-2">
            <div className="flex w-20 shrink-0 flex-col gap-1.5">
              <label
                htmlFor="qty"
                className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase"
              >
                Qty
              </label>
              <input
                id="qty"
                type="number"
                min="0"
                step="0.25"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  if (e.key === 'Enter') submit()
                }}
                className="no-spinner h-9 w-full rounded-lg border border-input bg-background px-2.5 font-mono text-sm tabular focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 outline-none"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label
                htmlFor="unit"
                className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase"
              >
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
              Meal
            </span>
            <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
              {MEAL_CATEGORIES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMeal(m)}
                  aria-pressed={meal === m}
                  className={cn(
                    'flex-1 rounded-md px-1 py-1 text-[0.7rem] font-medium transition-[background-color,color] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/40 outline-none',
                    meal === m
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {preview ? (
            <dl className="grid grid-cols-4 gap-2 rounded-lg border border-border bg-background px-3 py-2">
              {[
                { label: 'kcal', value: preview.calories },
                { label: 'P', value: preview.protein },
                { label: 'C', value: preview.carbs },
                { label: 'F', value: preview.fats },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-[0.65rem] text-muted-foreground">{s.label}</dt>
                  <dd className="font-mono text-xs tabular font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={!validQty}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 outline-none"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add to {meal}
          </button>
        </div>
      ) : null}
    </section>
  )
}

/** Pick a sensible default meal based on the time of day. */
function defaultMeal(): MealCategory {
  const h = new Date().getHours()
  if (h < 11) return 'Breakfast'
  if (h < 16) return 'Lunch'
  if (h < 21) return 'Dinner'
  return 'Snacks'
}
