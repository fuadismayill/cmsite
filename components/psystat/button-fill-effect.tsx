"use client"

import { useEffect } from "react"

/** Düyməyə toxunanda/basanda toxunuş nöqtəsindən rəng dolması effekti (bütün düymələr və düymə kimi linklər). */
export function ButtonFillEffect() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-slot="button"], .group\\/button, [data-fill-target]')
      if (!target || target.matches(":disabled") || target.getAttribute("aria-disabled") === "true") return
      const rect = target.getBoundingClientRect()
      target.style.setProperty("--fx", `${event.clientX - rect.left}px`)
      target.style.setProperty("--fy", `${event.clientY - rect.top}px`)
      target.removeAttribute("data-fill")
      void target.offsetWidth // animasiyanı yenidən başlat
      target.setAttribute("data-fill", "")
      window.setTimeout(() => target.removeAttribute("data-fill"), 700)
    }
    document.addEventListener("pointerdown", onPointerDown, { passive: true })
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])
  return null
}
