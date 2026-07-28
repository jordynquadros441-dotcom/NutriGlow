'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * localStorage-backed state that is SSR safe.
 *
 * Renders `initial` on the server and during the first client render, then
 * swaps in the persisted value after mount. The third tuple member reports
 * whether that read has happened yet, so callers can hold back UI that would
 * otherwise flash default data.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)
  const keyRef = useRef(key)

  useEffect(() => {
    keyRef.current = key
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) setValue(JSON.parse(raw) as T)
    } catch {
      // corrupt or unavailable storage: fall back to the initial value
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value))
    } catch {
      // quota exceeded or storage disabled: keep working in memory
    }
  }, [value, hydrated])

  return [value, setValue, hydrated] as const
}
