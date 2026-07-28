'use client'

import { CopyPlus, Trash2, UtensilsCrossed } from 'lucide-react'

import { MEAL_CATEGORIES, sumEntries, type LogEntry, type MealCategory } from '@/lib/nutrition'

interface MealTimelineProps {
  entries: LogEntry[]
  onRemove: (id: string) => void
  /** Feature 2 — bring a historical day's meals into today. */
  onCopyToToday?: () => void
  readOnly: boolean
}

export function MealTimeline({
  entries,
  onRemove,
  onCopyToToday,
  readOnly,
}: MealTimelineProps) {
  const byMeal = MEAL_CATEGORIES.map((meal) => ({
    meal,
    items: entries.filter((e) => e.meal === meal),
  }))
  const hasAny = entries.length > 0

  return (
    <section
      aria-labelledby="timeline-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 id="timeline-heading" className="text-sm font-semibold tracking-tight">
            Meals
          </h2>
          <span className="font-mono text-xs tabular text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        {readOnly && hasAny && onCopyToToday ? (
          <button
            type="button"
            onClick={onCopyToToday}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-primary/30 bg-accent px-2 text-xs font-medium text-accent-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent/70 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
          >
            <CopyPlus aria-hidden="true" className="size-3.5" />
            Copy to today
          </button>
        ) : null}
      </header>

      {!hasAny ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <UtensilsCrossed aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">Nothing logged</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {readOnly
              ? 'This day has no entries.'
              : 'Search the food database to add your first item.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {byMeal
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <li key={group.meal} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <MealHeader meal={group.meal} items={group.items} />
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((e) => (
                    <li
                      key={e.id}
                      className="group/row flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-150 ease-out hover:bg-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{e.foodName}</p>
                        <p className="font-mono text-[0.7rem] tabular text-muted-foreground">
                          {Math.round(e.grams)} g · P {e.protein} · C {e.carbs} · F {e.fats}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular font-medium">
                        {e.calories}
                      </span>
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => onRemove(e.id)}
                          aria-label={`Remove ${e.foodName}`}
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[opacity,background-color,color,transform] duration-150 ease-out group-hover/row:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.95] outline-none"
                        >
                          <Trash2 aria-hidden="true" className="size-3.5" />
                        </button>
                      ) : (
                        <span aria-hidden="true" className="size-6 shrink-0" />
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}

function MealHeader({ meal, items }: { meal: MealCategory; items: LogEntry[] }) {
  const totals = sumEntries(items)
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h3 className="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
        {meal}
      </h3>
      <span className="font-mono text-[0.7rem] tabular text-muted-foreground">
        {Math.round(totals.calories)} kcal
      </span>
    </div>
  )
}
