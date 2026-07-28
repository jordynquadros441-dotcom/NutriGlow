'use client'

import { Flame } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  streak: number
  className?: string
}

/**
 * Feature 5 — consecutive days with any logged food or water.
 * Stays visually quiet at zero so it never nags an empty account.
 */
export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const active = streak > 0

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        'transition-colors duration-200 ease-out',
        active
          ? 'border-primary/25 bg-accent text-accent-foreground'
          : 'border-border bg-muted text-muted-foreground',
        className,
      )}
      title={
        active
          ? `${streak} consecutive day${streak === 1 ? '' : 's'} with a log`
          : 'Log a food or water to start a streak'
      }
    >
      <Flame aria-hidden="true" className={cn('size-3.5', active && 'text-primary')} />
      <span className="font-mono tabular">{streak}</span>
      <span className="text-[0.7rem] tracking-wide uppercase opacity-70">
        {streak === 1 ? 'day' : 'days'}
      </span>
      <span className="sr-only">
        {active
          ? `Current streak: ${streak} consecutive days with a log.`
          : 'No active streak.'}
      </span>
    </div>
  )
}
