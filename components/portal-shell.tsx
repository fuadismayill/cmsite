"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  CalendarDays,
  BookOpen,
  UserRound,
  PanelLeft,
  Ellipsis,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/psystat/i18n";
import { ThemeToggle } from "./psystat/theme-toggle";
import { NewYearToggle } from "./psystat/newyear-toggle";
import { NewYearHat, NewYearTree } from "./psystat/newyear-decor";
import { LanguageToggle } from "./psystat/language-toggle";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { database } from "@/lib/portal";
export const routes = [
  { href: "/", az: "Ana səhifə", en: "Home", short: "Ana", icon: House },
  {
    href: "/gorus",
    az: "Görüş",
    en: "Appointments",
    short: "Görüş",
    icon: CalendarDays,
  },
  {
    href: "/meqaleler",
    az: "Məqalələr",
    en: "Articles",
    short: "Məqalələr",
    icon: BookOpen,
  },
  {
    href: "/kabinet",
    az: "Şəxsi kabinet",
    en: "My account",
    short: "Kabinet",
    icon: UserRound,
  },
];
function Brand() {
  return (
    <Link
      href="/"
      aria-label="Çinarə Məmmədova"
      className="relative inline-flex items-baseline whitespace-nowrap text-[22px] leading-none tracking-tight"
      style={{ fontFamily: "Montserrat Variable, sans-serif" }}
    >
      <b className="font-extrabold text-[#1f3556] dark:text-[#fbe4ea]">CM</b>
      <NewYearHat />
    </Link>
  );
}
export function PortalShell({ children }: { children: React.ReactNode }) {
  const { t } = useLang(),
    path = usePathname(),
    router = useRouter();
  const [compact, setCompact] = useState(false),
    [more, setMore] = useState(false);
  useEffect(() => {
    setCompact(localStorage.getItem("psystat:compact-sidebar") === "1");
    const hash = location.hash,
      invite = hash.match(/^#invite=([a-f0-9-]{36})$/i);
    if (invite) {
      sessionStorage.setItem("patientInvitation", invite[1]);
      router.replace("/kabinet");
    } else if (["#gorus", "#blog", "#kabinet"].includes(hash))
      router.replace(hash === "#blog" ? "/meqaleler" : "/" + hash.slice(1));
    database();
  }, [router]);
  useEffect(() => {
    setMore(false);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        document.documentElement.classList.contains("dark")
          ? "#1c161a"
          : "#fbf1f3",
      );
  }, [path]);
  const current = routes.find((r) => r.href === path) ?? routes[0];
  const settings = (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        {t("Dil", "Language")}
        <LanguageToggle />
      </div>
      <div className="flex items-center justify-between">
        {t("Görünüş", "Appearance")}
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-between">
        {t("Yeni il rejimi", "New Year mode")}
        <NewYearToggle />
      </div>
    </div>
  );
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside
        className={cn(
          "workspace-sidebar fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/70 bg-sidebar py-5 lg:flex",
          compact ? "w-[72px] px-2" : "w-[248px] px-4",
        )}
      >
        <div className="flex h-10 items-center justify-between">
          {!compact && <Brand />}
          <button
            aria-label={t("Yan menyunun ölçüsü", "Resize sidebar")}
            aria-expanded={!compact}
            onClick={() => {
              localStorage.setItem(
                "psystat:compact-sidebar",
                compact ? "0" : "1",
              );
              setCompact(!compact);
            }}
            className="mx-auto grid size-10 place-items-center rounded-xl hover:bg-accent"
          >
            <PanelLeft size={19} />
          </button>
        </div>
        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {routes.map(({ href, az, en, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={t(az, en)}
              aria-current={path === href ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
                compact && "justify-center",
                path === href
                  ? "border-l-2 border-primary bg-primary/15 text-sidebar-accent-foreground shadow-sm dark:text-primary"
                  : "text-sidebar-foreground/85 hover:translate-x-0.5 hover:bg-accent/60",
              )}
            >
              <Icon size={18} />
              {!compact && t(az, en)}
            </Link>
          ))}
        </nav>
        {!compact && <NewYearTree className="mx-auto w-full" />}
      </aside>
      <div
        className={cn(
          "flex min-h-dvh flex-col",
          compact ? "lg:pl-[72px]" : "lg:pl-[248px]",
        )}
      >
        <header className="workspace-topbar sticky z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
            <div className="lg:hidden">
              <Brand />
            </div>
            <span className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
              CM <ChevronRight size={14} />
              {t(current.az, current.en)}
            </span>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <div className="hidden sm:block">
                <NewYearToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+6rem)] sm:px-6 lg:px-8 lg:py-9">
          {children}
        </main>
      </div>
      <nav className="winter-dock workspace-mobile-nav fixed inset-x-3 z-30 mx-auto max-w-md rounded-[1.75rem] border border-border/70 bg-card/95 p-1.5 shadow-lg backdrop-blur-md lg:hidden">
        <div className="relative isolate grid grid-cols-5">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 -z-10 w-1/5 rounded-full bg-primary/15 transition-transform motion-reduce:transition-none"
            style={{
              transform:
                "translateX(" +
                100 * (more ? 4 : routes.indexOf(current)) +
                "%)",
            }}
          />
          {routes.map(({ href, short, en, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={href === path ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                path === href ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon size={20} />
              {t(short, en)}
            </Link>
          ))}
          <Dialog open={more} onOpenChange={setMore}>
            <DialogTrigger className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Ellipsis size={20} />
              {t("Daha çox", "More")}
            </DialogTrigger>
            <DialogContent className="workspace-more-sheet">
              <DialogTitle>{t("Ayarlar", "Settings")}</DialogTitle>
              {settings}
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </div>
  );
}
