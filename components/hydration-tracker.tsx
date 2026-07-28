'use client'

import { Check, Droplets, Minus, RotateCcw, Settings2 } from 'lucide-react'
import { useState } from 'react'

import { EditableNumber } from '@/components/editable-number'
import { cn } from '@/lib/utils'
import type { QuickAdd } from '@/lib/nutrition'

interface HydrationTrackerProps {
  waterMl: number
  goalMl: number
  quickAdds: QuickAdd[]
  onAddWater: (ml: number) => void
  onResetWater: () => void
  onGoalChange: (ml: number) => void
  onQuickAddChange: (id: QuickAdd['id'], ml: number) => void
  readOnly: boolean
}

export function HydrationTracker({
  waterMl,
  goalMl,
  quickAdds,
  onAddWater,
  onResetWater,
  onGoalChange,
  onQuickAddChange,
  readOnly,
}: HydrationTrackerProps) {
  const [customising, setCustomising] = useState(false)
  const pct = goalMl > 0 ? Math.min((waterMl / goalMl) * 100, 100) : 0
  const met = waterMl >= goalMl && goalMl > 0
  const litres = (waterMl / 1000).toFixed(2)

  return (
    <section
      aria-labelledby="hydration-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs"
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Droplets aria-hidden="true" className="size-4 text-fats" />
          <h2 id="hydration-heading" className="text-sm font-semibold tracking-tight">
            Hydration
          </h2>
          {met ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-accent px-1.5 py-px text-[0.65rem] font-medium text-accent-foreground">
              <Check aria-hidden="true" className="size-2.5" />
              Met
            </span>
          ) : null}
        </div>
        {!readOnly ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCustomising((v) => !v)}
              aria-pressed={customising}
              aria-label="Customise quick-add sizes"
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-lg border transition-[background-color,color,transform] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none',
                customising
                  ? 'border-primary/30 bg-accent text-accent-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Settings2 aria-hidden="true" className="size-3.5" />
            </button>
            {waterMl > 0 ? (
              <button
                type="button"
                onClick={onResetWater}
                aria-label="Reset water for this day"
                className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {/* Fluid fill visual — scales to the current target */}
      <div className="flex items-center gap-4">
        <div
          className="relative h-24 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
          role="progressbar"
          aria-label="Water intake progress"
          aria-valuenow={waterMl}
          aria-valuemin={0}
          aria-valuemax={goalMl}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-fats/80 transition-[height] duration-500"
            style={{ height: `${pct}%`, transitionTimingFunction: 'var(--ease-out-strong)' }}
          />
          <div
            className="absolute inset-x-0 bg-fats transition-[bottom] duration-500"
            style={{
              bottom: `${pct}%`,
              height: pct > 0 && pct < 100 ? 2 : 0,
              transitionTimingFunction: 'var(--ease-out-strong)',
            }}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl leading-none font-semibold tabular">{litres}</span>
            <span className="text-xs text-muted-foreground">L</span>
          </div>
          <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
            <span>Target</span>
            <EditableNumber
              value={goalMl}
              onChange={(n) => onGoalChange(Math.round(n))}
              label="Daily water target in millilitres"
              suffix="ml"
              min={250}
              max={10000}
              step={50}
              disabled={readOnly}
              className="text-xs font-medium text-foreground"
              inputClassName="w-16 text-center text-xs"
            />
          </div>
          <span className="font-mono text-[0.7rem] tabular text-muted-foreground">
            {met ? 'Goal reached' : `${Math.max(goalMl - waterMl, 0)} ml to go`}
          </span>
        </div>
      </div>

      {/* Quick adds */}
      {readOnly ? (
        <p className="text-xs text-muted-foreground">
          Switch to today to log water.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {customising ? (
            <p className="text-xs text-muted-foreground">
              Set the capacity of each container.
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {quickAdds.map((q) => (
              <li key={q.id} className="flex items-center gap-2">
                {customising ? (
                  <div className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
                    <span className="text-xs font-medium">{q.label}</span>
                    <EditableNumber
                      value={q.ml}
                      onChange={(n) => onQuickAddChange(q.id, Math.round(n))}
                      label={`${q.label} capacity in millilitres`}
                      suffix="ml"
                      min={50}
                      max={3000}
                      step={50}
                      className="text-xs"
                      inputClassName="w-16 text-center text-xs"
                    />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onAddWater(q.ml)}
                      className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left transition-[background-color,transform] duration-150 ease-out hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] outline-none"
                    >
                      <span className="text-xs font-medium">{q.label}</span>
                      <span className="font-mono text-xs tabular text-muted-foreground">
                        +{q.ml} ml
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddWater(-q.ml)}
                      disabled={waterMl <= 0}
                      aria-label={`Remove ${q.ml} millilitres`}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 outline-none"
                    >
                      <Minus aria-hidden="true" className="size-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
