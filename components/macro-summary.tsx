'use client'

import { RotateCcw } from 'lucide-react'

import { EditableNumber } from '@/components/editable-number'
import { MacroRatioBar } from '@/components/macro-ratio-bar'
import { cn } from '@/lib/utils'
import { DEFAULT_GOALS, type Goals, type Totals } from '@/lib/nutrition'

interface MacroSummaryProps {
  totals: Totals
  goals: Goals
  onGoalChange: (patch: Partial<Goals>) => void
  onResetGoals: () => void
  /** Past/future days are read-only, so targets can't be edited there. */
  readOnly: boolean
}

const MACROS = [
  { key: 'protein', label: 'Protein', unit: 'g', bar: 'bg-protein' },
  { key: 'carbs', label: 'Carbs', unit: 'g', bar: 'bg-carbs' },
  { key: 'fats', label: 'Fats', unit: 'g', bar: 'bg-fats' },
] as const

const RING_SIZE = 168
const RING_STROKE = 10
const RADIUS = (RING_SIZE - RING_STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function MacroSummary({
  totals,
  goals,
  onGoalChange,
  onResetGoals,
  readOnly,
}: MacroSummaryProps) {
  const caloriePct = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0
  const remaining = goals.calories - totals.calories
  const over = remaining < 0
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(caloriePct, 100) / 100)

  const goalsCustomised =
    goals.calories !== DEFAULT_GOALS.calories ||
    goals.protein !== DEFAULT_GOALS.protein ||
    goals.carbs !== DEFAULT_GOALS.carbs ||
    goals.fats !== DEFAULT_GOALS.fats

  return (
    <section
      aria-labelledby="summary-heading"
      className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id="summary-heading" className="text-sm font-semibold tracking-tight">
            Daily summary
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {readOnly ? 'Viewing a past day' : 'Tap any target to adjust it'}
          </p>
        </div>
        {goalsCustomised && !readOnly ? (
          <button
            type="button"
            onClick={onResetGoals}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
          >
            <RotateCcw aria-hidden="true" className="size-3" />
            Reset targets
          </button>
        ) : null}
      </header>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Calorie ring */}
        <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              className="stroke-muted"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className={cn(
                'transition-[stroke-dashoffset] duration-500',
                over ? 'stroke-destructive' : 'stroke-primary',
              )}
              style={{ transitionTimingFunction: 'var(--ease-out-strong)' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="font-mono text-3xl leading-none font-semibold tabular">
              {Math.round(totals.calories)}
            </span>
            <div className="flex items-baseline gap-1 text-xs text-muted-foreground">
              <span>of</span>
              <EditableNumber
                value={goals.calories}
                onChange={(n) => onGoalChange({ calories: Math.round(n) })}
                label="Calorie target"
                min={500}
                max={20000}
                step={50}
                disabled={readOnly}
                showAffordance={false}
                className="text-xs font-medium text-foreground"
                inputClassName="w-16 text-center text-xs"
              />
            </div>
            <span
              className={cn(
                'mt-1 font-mono text-[0.7rem] tabular',
                over ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {over ? `${Math.abs(Math.round(remaining))} over` : `${Math.round(remaining)} left`}
            </span>
          </div>
        </div>

        {/* Macro targets */}
        <ul className="flex w-full min-w-0 flex-col gap-4">
          {MACROS.map((m) => {
            const current = totals[m.key]
            const target = goals[m.key]
            const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
            const isOver = current > target
            return (
              <li key={m.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium">{m.label}</span>
                  <div className="flex items-baseline gap-1 font-mono text-xs">
                    <span className={cn('tabular', isOver && 'text-destructive')}>
                      {Math.round(current * 10) / 10}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <EditableNumber
                      value={target}
                      onChange={(n) => onGoalChange({ [m.key]: Math.round(n) } as Partial<Goals>)}
                      label={`${m.label} target`}
                      suffix={m.unit}
                      min={1}
                      max={2000}
                      disabled={readOnly}
                      className="text-xs"
                      inputClassName="w-14 text-center text-xs"
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
                      isOver ? 'bg-destructive' : m.bar,
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
      </div>

      <div className="border-t border-border pt-5">
        <MacroRatioBar totals={totals} />
      </div>
    </section>
  )
}
