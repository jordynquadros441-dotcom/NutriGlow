'use client'

import { Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface EditableNumberProps {
  value: number
  onChange: (next: number) => void
  /** Accessible description, e.g. "Protein target". */
  label: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  inputClassName?: string
  /** Show a small pencil affordance on hover. */
  showAffordance?: boolean
}

/**
 * A number that turns into an input when clicked.
 *
 * Commits on Enter or blur, reverts on Escape. Used for every editable
 * nutrition target and for the hydration quick-add capacities.
 */
export function EditableNumber({
  value,
  onChange,
  label,
  suffix,
  min = 0,
  max = 100000,
  step = 1,
  disabled = false,
  className,
  inputClassName,
  showAffordance = true,
}: EditableNumberProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(String(value))
  }, [value, editing])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function commit() {
    const parsed = Number.parseFloat(draft)
    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)))
    }
    setEditing(false)
  }

  function cancel() {
    setDraft(String(value))
    setEditing(false)
  }

  if (editing) {
    return (
      <span className={cn('inline-flex items-baseline gap-1', className)}>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          aria-label={label}
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            // Don't submit while a CJK IME is still composing.
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              cancel()
            }
          }}
          className={cn(
            'no-spinner w-full min-w-0 rounded-md border border-ring bg-background px-1.5 py-0.5 font-mono text-inherit leading-none',
            'ring-3 ring-ring/25 outline-none',
            inputClassName,
          )}
        />
        {suffix ? <span className="text-muted-foreground text-xs">{suffix}</span> : null}
      </span>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setEditing(true)}
      aria-label={`${label}: ${value}${suffix ? ` ${suffix}` : ''}. Click to edit.`}
      className={cn(
        'group/edit inline-flex items-baseline gap-1 rounded-md px-1 py-0.5 -mx-1 font-mono leading-none',
        'transition-colors duration-150 ease-out',
        'focus-visible:ring-3 focus-visible:ring-ring/40 outline-none',
        disabled
          ? 'cursor-default'
          : 'cursor-text hover:bg-muted active:bg-muted decoration-border underline decoration-dashed decoration-1 underline-offset-4 hover:decoration-muted-foreground',
        className,
      )}
    >
      <span className="tabular">{value}</span>
      {suffix ? <span className="text-muted-foreground text-xs">{suffix}</span> : null}
      {!disabled && showAffordance ? (
        <Pencil
          aria-hidden="true"
          className="size-3 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity duration-150 ease-out group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100"
        />
      ) : null}
    </button>
  )
}
