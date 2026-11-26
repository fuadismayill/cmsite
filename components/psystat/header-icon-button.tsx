import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/** Yuxarı paneldəki bütün ikon düymələri (axtarış, mövzu, menyu, çıxış) üçün vahid görünüş. */
export const HeaderIconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function HeaderIconButton({ className, type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      data-fill-target=""
      className={cn(
        "inline-grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px]",
        className,
      )}
      {...props}
    />
  )
})
