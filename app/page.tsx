"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { routes } from "@/components/portal-shell";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="mx-auto grid max-w-6xl gap-12 pb-6 sm:gap-16">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-card to-primary/18 px-6 py-10 sm:px-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 -z-10 aspect-square w-[35rem] -translate-y-1/2 rounded-full border border-primary/15 bg-primary/5 ring-[45px] ring-primary/5 after:absolute after:inset-20 after:rounded-full after:border after:border-primary/20 lg:right-[-10rem]" />
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-semibold text-primary">{t("Psixoloq · Çinarə Məmmədova","Psychologist · Chinara Mammadova")}</p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">{t("Özünüzə vaxt ayırın","Make time for yourself")}</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">{t("Psixoloqla görüş üçün sizə uyğun vaxtı seçin və sorğunuzun vəziyyətini şəxsi kabinetdən izləyin.","Choose a time that works for you and track your appointment request in your account.")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gorus" className={buttonVariants({size:"lg",className:"min-h-12"})}><CalendarDays />{t("Görüş üçün müraciət","Request an appointment")}<ArrowRight /></Link>
            <Link href="/kabinet" className={buttonVariants({variant:"outline",size:"lg",className:"min-h-12"})}>{t("Şəxsi kabinet","My account")}</Link>
          </div>
        </div>
      </section>
      <section className="grid gap-5" aria-labelledby="portal-links">
        <h2 id="portal-links" className="text-2xl font-semibold tracking-tight">{t("Sizə necə kömək edə bilərik?","How can we help?")}</h2>
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
      </section>
      <section className="rounded-3xl border bg-card p-6 sm:p-8" aria-labelledby="first-visit">
        <h2 id="first-visit" className="text-2xl font-semibold tracking-tight">{t("Görüş necə ayarlanır?","How do appointments work?")}</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {Icon:Mail,title:t("Hesabınıza daxil olun","Sign in"),body:t("Yeni hesab yaradırsınızsa, e-poçtunuzu təsdiqləyin.","If you create an account, confirm your email.")},
            {Icon:CalendarDays,title:t("Vaxt təklif edin","Choose a time"),body:t("Sizə uyğun tarix və saatı seçib sorğunu göndərin.","Select a preferred date and time and send your request.")},
            {Icon:CheckCircle2,title:t("Cavabı izləyin","Track the response"),body:t("Təsdiqi və ya yeni vaxt təklifini kabinetdə görün.","Check your account for confirmation or an alternative time.")},
          ].map(({Icon,title,body})=><li key={title}><Icon aria-hidden="true" className="mb-3 text-primary" size={22}/><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></li>)}
        </ol>
      </section>
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck aria-hidden="true" size={18}/>{t("Paylaşılan nəticələr şəxsi kabinetdə görünür.","Shared results are available in your private account.")}</p>
    </div>
  );
}
