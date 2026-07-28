'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { makeId, type Food } from '@/lib/nutrition'

interface CustomFoodModalProps {
  open: boolean
  onClose: () => void
  onSave: (food: Food) => void
}

const FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fats', label: 'Fats', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

const EMPTY_FORM: Record<FieldKey, string> = {
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  sugar: '',
  fiber: '',
  sodium: '',
  potassium: '',
}

export function CustomFoodModal({ open, onClose, onSave }: CustomFoodModalProps) {
  const [name, setName] = useState('')
  const [servingSize, setServingSize] = useState('100')
  const [form, setForm] = useState<Record<FieldKey, string>>({ ...EMPTY_FORM })
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // Reset and focus whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    setName('')
    setServingSize('100')
    setForm({ ...EMPTY_FORM })
    setError(null)
    const t = window.setTimeout(() => nameRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  // Close on Escape and lock background scroll.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  function submit() {
    if (!name.trim()) {
      setError('Give the food a name.')
      return
    }
    const serving = Number.parseFloat(servingSize)
    if (!Number.isFinite(serving) || serving <= 0) {
      setError('Serving size must be greater than zero.')
      return
    }
    const num = (k: FieldKey) => {
      const v = Number.parseFloat(form[k])
      return Number.isFinite(v) && v >= 0 ? v : 0
    }
    onSave({
      id: makeId(),
      name: name.trim(),
      servingSizeG: serving,
      calories: num('calories'),
      protein: num('protein'),
      carbs: num('carbs'),
      fats: num('fats'),
      sugar: num('sugar'),
      fiber: num('fiber'),
      sodium: num('sodium'),
      potassium: num('potassium'),
      custom: true,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px] outline-none"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-food-title"
        className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-lg sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 id="custom-food-title" className="text-sm font-semibold tracking-tight">
              New custom food
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enter nutrition values per 100 g.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cf-name" className="text-xs font-medium">
              Name
            </label>
            <input
              ref={nameRef}
              id="cf-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="e.g. Sourdough toast"
              className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cf-serving" className="text-xs font-medium">
              Serving size
              <span className="ml-1 font-normal text-muted-foreground">(grams)</span>
            </label>
            <input
              id="cf-serving"
              type="number"
              min="1"
              inputMode="decimal"
              value={servingSize}
              onChange={(e) => {
                setServingSize(e.target.value)
                setError(null)
              }}
              className="no-spinner h-9 rounded-lg border border-input bg-background px-2.5 font-mono text-sm tabular focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label htmlFor={`cf-${f.key}`} className="text-xs font-medium">
                  {f.label}
                  <span className="ml-1 font-normal text-muted-foreground">{f.unit}</span>
                </label>
                <input
                  id={`cf-${f.key}`}
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="0"
                  value={form[f.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="no-spinner h-9 rounded-lg border border-input bg-background px-2.5 font-mono text-sm tabular placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 outline-none"
                />
              </div>
            ))}
          </div>

          {error ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] outline-none"
          >
            Save food
          </button>
        </footer>
      </div>
    </div>
  )
}
