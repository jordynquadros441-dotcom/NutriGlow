'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Read the class the pre-paint script already applied.
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      window.localStorage.setItem('nutriglow:theme', next ? 'dark' : 'light')
    } catch {
      // storage disabled: theme simply won't persist
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={mounted ? dark : undefined}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-[transform,background-color,color] duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.97] outline-none"
    >
      {/* Render both and cross-fade so the button never pops in after hydration */}
      <Sun
        aria-hidden="true"
        className="size-4 transition-opacity duration-150 ease-out data-[hidden=true]:opacity-0"
        data-hidden={mounted && dark}
        style={{ display: mounted && dark ? 'none' : undefined }}
      />
      <Moon
        aria-hidden="true"
        className="size-4"
        style={{ display: mounted && dark ? undefined : 'none' }}
      />
    </button>
  )
}
