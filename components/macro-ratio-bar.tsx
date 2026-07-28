'use client'

import { macroRatio, type Totals } from '@/lib/nutrition'

const SEGMENTS = [
  { key: 'protein', label: 'Protein', bar: 'bg-protein', dot: 'bg-protein' },
  { key: 'carbs', label: 'Carbs', bar: 'bg-carbs', dot: 'bg-carbs' },
  { key: 'fats', label: 'Fats', bar: 'bg-fats', dot: 'bg-fats' },
] as const

/**
 * Feature 4 — share of total calories contributed by each macro.
 * Note this is a ratio of consumed calories, independent of the goals.
 */
export function MacroRatioBar({ totals }: { totals: Totals }) {
  const ratio = macroRatio(totals)

  return (
    <section aria-labelledby="ratio-heading" className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h3
          id="ratio-heading"
          className="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase"
        >
          Calorie split
        </h3>
        {!ratio.hasData ? (
          <span className="text-xs text-muted-foreground">No data yet</span>
        ) : null}
      </div>

      <div
        className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={
          ratio.hasData
            ? `Calories from protein ${ratio.protein} percent, carbohydrates ${ratio.carbs} percent, fats ${ratio.fats} percent.`
            : 'No macro data logged yet.'
        }
      >
        {ratio.hasData
          ? SEGMENTS.map((s) => (
              <div
                key={s.key}
                className={`${s.bar} h-full transition-[width] duration-300 ease-out`}
                style={{ width: `${ratio[s.key]}%` }}
              />
            ))
          : null}
      </div>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-xs">
            <span aria-hidden="true" className={`size-1.5 rounded-full ${s.dot}`} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-mono tabular font-medium">
              {ratio.hasData ? `${ratio[s.key]}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
