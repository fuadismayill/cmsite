"use client";
import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { PageHero } from "./psystat/page-hero";
import { useLang } from "@/lib/psystat/i18n";
export function Screen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="portal-enter mx-auto grid w-full max-w-6xl gap-6 sm:gap-8">
      <PageHero
        eyebrow={t(
          "Psixoloq · Çinarə Məmmədova",
          "Psychologist · Chinara Mammadova",
        )}
        className="min-h-28 rounded-[1.75rem] sm:min-h-36 sm:px-8"
        title={title}
        description={description}
      />
      {children}
    </div>
  );
}
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}
export const fieldStyle = "grid gap-2 text-sm font-medium";
