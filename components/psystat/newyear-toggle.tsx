"use client"

import { useLang } from "@/lib/psystat/i18n"

import { Snowflake } from "lucide-react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { HeaderIconButton } from "@/components/psystat/header-icon-button"

const STORAGE_KEY = "psystat-newyear"
// Set to true to show the New Year theme to everyone until they switch it off.
const DEFAULT_ON = false

function applyTheme(on: boolean) {
  const root = document.documentElement
  if (on) root.setAttribute("data-theme", "newyear")
  else root.removeAttribute("data-theme")
}

function readPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? DEFAULT_ON : stored === "1"
  } catch {
    return DEFAULT_ON
  }
}

function useNewYear() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const preference = readPreference()
    setOn(preference)
    applyTheme(preference)
  }, [])

  function toggle() {
    const next = !on
    setOn(next)
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
    } catch {
      // Private mode: the theme still switches, it just is not remembered.
    }
  }

  return { on, toggle }
}

export function NewYearToggle({ className = "" }: { className?: string }) {
  const { t } = useLang()
  const { on, toggle } = useNewYear()
  const label = on ? t("Yeni il temasını söndür", "Turn off the New Year theme") : t("Yeni il temasını aç", "Turn on the New Year theme")
  return (
    <HeaderIconButton onClick={toggle} aria-pressed={on} aria-label={label} title={label} data-ny-on={on} className={`ny-toggle no-print text-lg ${className}`}>
      <Snowflake aria-hidden="true" className="size-5" />
    </HeaderIconButton>
  )
}

/** Login and password pages have no top bar, so the switch floats in the corner there. */
export function NewYearAuthToggle() {
  const pathname = usePathname()
  useEffect(() => { applyTheme(readPreference()) }, [])
  if (!pathname.startsWith("/auth")) return null
  return <NewYearToggle className="ny-toggle-floating" />
}
