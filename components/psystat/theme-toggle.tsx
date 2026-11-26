"use client"

import { useLang } from "@/lib/psystat/i18n"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { HeaderIconButton } from "@/components/psystat/header-icon-button"

export function ThemeToggle() {
  const { t } = useLang()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const storedTheme = localStorage.getItem("psystat_theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    // Əgər istifadəçi əvvəlcə seçibsə onu götür, yoxdursa sistemə uyğunlaş
    const initialDark = storedTheme === "dark" || (!storedTheme && prefersDark)
    setIsDark(initialDark)

    if (initialDark) {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }
  }, [])

  function toggleTheme() {
    const root = document.documentElement
    // Keçid anında bütün CSS animasiyalarını söndür: yüzlərlə element eyni anda rəngini animasiya etdikdə səhifə "donur"
    root.classList.add("theme-switching")
    window.setTimeout(() => root.classList.remove("theme-switching"), 80)
    if (isDark) {
      root.classList.remove("dark")
      root.classList.add("light")
      localStorage.setItem("psystat_theme", "light")
      setIsDark(false)
    } else {
      root.classList.remove("light")
      root.classList.add("dark")
      localStorage.setItem("psystat_theme", "dark")
      setIsDark(true)
    }
  }

  return (
    <HeaderIconButton onClick={toggleTheme} aria-label={isDark ? t("Gündüz rejiminə keç", "Switch to light mode") : t("Gecə rejiminə keç", "Switch to dark mode")} title={isDark ? t("Gündüz rejimi", "Light mode") : t("Gecə rejimi", "Dark mode")}>
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </HeaderIconButton>
  )
}
