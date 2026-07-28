'use client'

import { CalendarCheck, ChevronLeft, ChevronRight, Lock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatDayDate, formatDayLabel, shiftKey } from '@/lib/nutrition'

interface DateNavigatorProps {
  activeKey: string
  todayKey: string
  onNavigate: (key: string) => void
  /** Days that already have data, used for the dot markers. */
  loggedKeys: Set<string>
}

/**
 * Feature 2 — moves between day logs. Future days beyond tomorrow are
 * reachable, but anything that is not today is rendered read-only upstream.
 */
export function DateNavigator({
  activeKey,
  todayKey,
  onNavigate,
  loggedKeys,
}: DateNavigatorProps) {
  const isToday = activeKey === todayKey
  const prevKey = shiftKey(activeKey, -1)
  const nextKey = shiftKey(activeKey, 1)

  return (
    <nav
      aria-label="Day navigation"
      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-1.5 shadow-xs"
    >
      <NavArrow
        direction="prev"
        label={`Go to ${formatDayLabel(prevKey, todayKey)}, ${formatDayDate(prevKey)}`}
        onClick={() => onNavigate(prevKey)}
        marked={loggedKeys.has(prevKey)}
      />

      <div className="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-sm font-semibold tracking-tight">
            {formatDayLabel(activeKey, todayKey)}
          </h2>
          {!isToday ? (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-1.5 py-px text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase"
              title="Past and future days are read-only"
            >
              <Lock aria-hidden="true" className="size-2.5" />
              Read-only
            </span>
          ) : null}
        </div>
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          {formatDayDate(activeKey)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {!isToday ? (
          <button
            type="button"
            onClick={() => onNavigate(todayKey)}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
          >
            <CalendarCheck aria-hidden="true" className="size-3.5" />
            Today
          </button>
        ) : null}
        <NavArrow
          direction="next"
          label={`Go to ${formatDayLabel(nextKey, todayKey)}, ${formatDayDate(nextKey)}`}
          onClick={() => onNavigate(nextKey)}
          marked={loggedKeys.has(nextKey)}
        />
      </div>
    </nav>
  )
}

function NavArrow({
  direction,
  label,
  onClick,
  marked,
}: {
  direction: 'prev' | 'next'
  label: string
  onClick: () => void
  marked: boolean
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
    >
      <Icon aria-hidden="true" className="size-4" />
      {marked ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-1 size-1 rounded-full bg-primary/60',
            direction === 'prev' ? 'left-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2',
          )}
        />
      ) : null}
    </button>
  )
}
