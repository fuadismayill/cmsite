"use client"

import { useRouter } from "next/navigation"
import { useLang } from "@/lib/psystat/i18n"

const languages = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
] as const

export function LanguageToggle() {
  const { lang, setLang, t } = useLang()
  const router = useRouter()

  function selectLanguage(code: typeof languages[number]["code"]) {
    if (code === lang) return
    setLang(code)
    setTimeout(() => router.refresh(), 0)
  }

  return (
    <div role="group" aria-label={t("Dil seçimi", "Language selection")}
      className="inline-flex shrink-0 rounded-full bg-muted p-1 ring-1 ring-inset ring-border">
      <div className="relative isolate grid grid-cols-2">
        <span aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 rounded-full bg-card shadow-sm ring-1 ring-inset ring-primary/25 transition-transform duration-200 ease-out motion-reduce:transition-none ${lang === "en" ? "translate-x-full" : "translate-x-0"}`} />
        {languages.map(({ code, label }) => (
          <button key={code} type="button" lang={code} aria-label={label} title={label}
            aria-pressed={lang === code} onClick={() => selectLanguage(code)}
            className="min-h-9 min-w-11 rounded-full px-3 text-xs font-semibold tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary aria-pressed:text-primary pointer-coarse:min-h-11 motion-reduce:transition-none">
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
