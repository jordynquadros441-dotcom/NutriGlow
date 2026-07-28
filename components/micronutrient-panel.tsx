'use client'

import { EditableNumber } from '@/components/editable-number'
import { cn } from '@/lib/utils'
import type { Goals, Totals } from '@/lib/nutrition'

interface MicronutrientPanelProps {
  totals: Totals
  goals: Goals
  onGoalChange: (patch: Partial<Goals>) => void
  readOnly: boolean
}

const MICROS = [
  { key: 'fiber', label: 'Fiber', unit: 'g', max: 200, kind: 'target' },
  { key: 'sugar', label: 'Sugar', unit: 'g', max: 500, kind: 'limit' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', max: 10000, kind: 'limit' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', max: 20000, kind: 'target' },
] as const

/**
 * Micronutrient targets. `limit` rows turn red when exceeded, `target` rows
 * are simply capped at 100%.
 */
export function MicronutrientPanel({
  totals,
  goals,
  onGoalChange,
  readOnly,
}: MicronutrientPanelProps) {
  return (
    <section
      aria-labelledby="micro-heading"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs"
    >
      <header>
        <h2 id="micro-heading" className="text-sm font-semibold tracking-tight">
          Micronutrients
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {readOnly ? 'Viewing a past day' : 'Targets are editable'}
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {MICROS.map((m) => {
          const current = totals[m.key]
          const target = goals[m.key]
          const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
          const exceeded = m.kind === 'limit' && current > target
          return (
            <li key={m.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium">
                  {m.label}
                  {m.kind === 'limit' ? (
                    <span className="ml-1.5 text-[0.65rem] font-normal text-muted-foreground">
                      limit
                    </span>
                  ) : null}
                </span>
                <div className="flex items-baseline gap-1 font-mono text-xs">
                  <span className={cn('tabular', exceeded && 'text-destructive')}>
                    {Math.round(current * 10) / 10}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <EditableNumber
                    value={target}
                    onChange={(n) =>
                      onGoalChange({ [m.key]: Math.round(n) } as Partial<Goals>)
                    }
                    label={`${m.label} target`}
                    suffix={m.unit}
                    min={1}
                    max={m.max}
                    disabled={readOnly}
                    className="text-xs"
                    inputClassName="w-16 text-center text-xs"
                  />
                </div>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={`${m.label} progress`}
                aria-valuenow={Math.round(current)}
                aria-valuemin={0}
                aria-valuemax={target}
              >
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-300',
                    exceeded ? 'bg-destructive' : 'bg-primary/70',
                  )}
                  style={{
                    width: `${pct}%`,
                    transitionTimingFunction: 'var(--ease-out-strong)',
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
