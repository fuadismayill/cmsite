import { WinterHarbor } from "@/components/psystat/newyear-decor"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function PageHero({ eyebrow, title, description, badge, actions, className }: { eyebrow: ReactNode; title: ReactNode; description?: ReactNode; badge?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("winter-banner flex min-w-0 flex-col justify-between gap-2 rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card px-4 py-3 shadow-sm ring-1 ring-primary/20 sm:flex-row sm:items-center sm:gap-4 sm:p-6", className)}>
      <WinterHarbor className="winter-banner-art" />
      <div className="relative flex min-w-0 flex-col gap-1">
        <p className="text-xs font-semibold text-primary">{eyebrow}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="min-w-0 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {description ? <p className="max-w-2xl text-sm leading-5 text-muted-foreground sm:leading-6">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </section>
  )
}
