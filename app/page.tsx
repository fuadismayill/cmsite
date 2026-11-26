"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { routes } from "@/components/portal-shell";
import { Screen } from "@/components/portal-content";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/lib/psystat/i18n";
export default function Home() {
  const { t } = useLang();
  const detail = [
    t(
      "Görüş üçün sizə uyğun tarixi və saatı seçin.",
      "Choose a preferred date and time.",
    ),
    t(
      "Psixologiya haqqında yazıları oxuyun.",
      "Read articles about psychology.",
    ),
    t(
      "Nəticələrinizə və görüş sorğularınıza baxın.",
      "View your results and appointment requests.",
    ),
  ];
  return (
    <Screen
      title={t("Çinarə Məmmədova", "Chinara Mammadova")}
      description={t(
        "Görüş üçün müraciət edin, psixologiya haqqında oxuyun və sizinlə paylaşılan nəticələrə baxın.",
        "Request an appointment, explore articles on psychology and view results shared with you.",
      )}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {routes.slice(1).map(({ href, az, en, icon: Icon }, i) => (
          <Link
            href={href}
            key={href}
            className="group rounded-2xl focus-visible:outline-primary"
          >
            <Card className="h-full transition-transform group-hover:-translate-y-0.5">
              <CardContent>
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </span>
                  <ArrowUpRight size={17} className="text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">{t(az, en)}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {detail[i]}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
