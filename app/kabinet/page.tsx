"use client";
import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, ChevronDown, ClipboardList, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { database } from "@/lib/portal";
import { Screen, Panel, fieldStyle } from "@/components/portal-content";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/psystat/i18n";
type Result = {
  id: string;
  title: string;
  explanation: string;
  published_at: string;
};
type Visit = {
  id: string;
  status: string;
  scheduled_at: string | null;
  requested_at: string;
};
type Cabinet = { owner: string; results: Result[]; visits: Visit[] };
export default function Account() {
  const { t, lang } = useLang();
  const [user, setUser] = useState<User | null | undefined>(),
    [record, setRecord] = useState<Cabinet | null>(null),
    [registration, setRegistration] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [reload, refresh] = useState(0);
  useEffect(() => {
    const { data } = database().auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null),
    );
    const focus = () => refresh((n) => n + 1);
    window.addEventListener("focus", focus);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("focus", focus);
    };
  }, []);
  const [recipient,setRecipient]=useState("");
  useEffect(()=>{setRegistration(new URLSearchParams(location.search).get("mode")==="register")},[]);
  const uid = user?.id;
  useEffect(() => {
    let active = true;
    if (!uid) {
      setRecord(null);
      return;
    }
    async function read(owner: string) {
      const db = database(),
        token = sessionStorage.getItem("patientInvitation");
      if (token) {
        const r = await db.rpc("portal_accept_invitation", { token });
        if (!active) return;
        if (r.error) throw r.error;
        if (r.data) sessionStorage.removeItem("patientInvitation");
      }
      const profile = await db
        .from("portal_patients")
        .select("id")
        .eq("account_id", owner)
        .maybeSingle();
      if (profile.error) throw profile.error;
      const [results, visits] = await Promise.all([
        profile.data
          ? db
              .from("portal_results")
              .select("id,title,explanation,published_at")
              .eq("patient_id", profile.data.id)
              .order("published_at", { ascending: false })
          : { data: [], error: null },
        db
          .from("portal_bookings")
          .select("id,status,requested_at,scheduled_at")
          .eq("account_id", owner)
          .order("created_at", { ascending: false }),
      ]);
      if (results.error || visits.error) throw Error();
      if (active) {
        setRecord({
          owner,
          results: results.data ?? [],
          visits: visits.data ?? [],
        });
        setMessage(token && !profile.data ? "invite" : "");
      }
    }
    read(uid).catch(() => {
      if (active) setMessage("load");
    });
    return () => {
      active = false;
    };
  }, [uid, reload]);
  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget,
      data = new FormData(form),
      email = String(data.get("email")).trim(),
      password = String(data.get("password"));
    setRecipient(email);
    setBusy(true);
    setMessage("");
    try {
      const auth = database().auth,
        r = registration
          ? await auth.signUp({
              email,
              password,
              options: {
                data: { portal: "patient" },
                emailRedirectTo: "https://chinaramammadova.com/kabinet",
              },
            })
          : await auth.signInWithPassword({ email, password });
      if(r.error){setMessage(r.error.status===429?'limit':r.error.code==='email_not_confirmed'?'confirm':r.error.code==='weak_password'?'weak':r.error.code==='invalid_credentials'?'credentials':'error');return}
      form.reset();
      if (!r.data.session) setMessage("confirm"); else if(new URLSearchParams(location.search).get("next")==="gorus")location.assign("/gorus");
    } catch {
      setMessage("error");
    } finally {
      setBusy(false);
    }
  }
  const messages: Record<string, string> = {
    credentials:t("E-poçtu və şifrəni yoxlayıb yenidən daxil olun.","Check your email and password and sign in again."),
    limit:t("E-poçt göndərmə limitinə çatılıb. Bir müddət sonra yenidən yoxlayın.","Email rate limit reached. Try again later."),
    weak:t("Daha güclü şifrə seçin.","Choose a stronger password."),
    error: t(
      "Əməliyyat alınmadı. Məlumatları yoxlayıb yenidən cəhd edin.",
      "Please check your details and try again.",
    ),
    confirm: t(
      "Təsdiq məktubunu açın, sonra hesabınıza daxil olun.",
      "Open the confirmation email and then sign in.",
    ),
    load: t(
      "Məlumat yüklənmədi. Yenilə düyməsini seçin.",
      "Unable to load data. Select Refresh to try again.",
    ),
    invite: t(
      "Dəvəti və daxil olduğunuz e-poçtu yoxlayın.",
      "Check the invitation and the email address you signed in with.",
    ),
  };
  async function resend(){
    setBusy(true);
    try{const {error}=await database().auth.resend({type:"signup",email:recipient,options:{emailRedirectTo:"https://chinaramammadova.com/kabinet"}});setMessage(error?(error.status===429?"limit":"error"):"resent")}catch{setMessage("error")}finally{setBusy(false)}
  }
  const confirmation=message==="confirm"||message==="resent";
  const notice=message&&<div role={confirmation?"status":"alert"} className={"my-2 grid gap-2 rounded-xl border p-4 text-sm "+(confirmation?"border-primary/30 bg-primary/10":"border-destructive/35 bg-destructive/10")}><strong>{confirmation?t("E-poçtunuzu təsdiqləyin","Confirm your email"):t("Diqqət","Please check")}</strong><p>{confirmation?<>{recipient} · {t("Təsdiq məktubundakı düyməni açın. Məktubu görmürsünüzsə, Spam qovluğunu yoxlayın.","Open the button in the confirmation email. Check your spam folder if it is missing.")}</>:messages[message]}</p>{confirmation&&<Button variant="outline" disabled={busy} onClick={resend}>{message==="resent"?t("Yenidən göndərildi","Sent again"):t("Məktubu yenidən göndər","Resend email")}</Button>}</div>;
  async function cancelVisit(id:string) {
    if(busy||!window.confirm(t("Bu görüş ləğv edilsin?","Cancel this appointment?")))return;
    setBusy(true);
    try {
      const {data,error}=await database().rpc("portal_cancel_booking",{booking:id});
      if(error||!data){setMessage("error");return}
      setRecord(previous=>previous&&({...previous,visits:previous.visits.map(visit=>visit.id===id?{...visit,status:"cancelled"}:visit)}));
      refresh(n=>n+1);
    } catch { setMessage("error"); } finally { setBusy(false); }
  }
  function addToCalendar(visit: Visit) {
    const stamp=(value:string)=>new Date(value).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
    const text=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//CM//Appointments//EN","BEGIN:VEVENT",
      "UID:"+visit.id+"@chinaramammadova.com","DTSTAMP:"+stamp(new Date().toISOString()),
      "DTSTART:"+stamp(visit.scheduled_at??visit.requested_at),"SUMMARY:"+t("Görüş","Appointment"),"END:VEVENT","END:VCALENDAR",""].join("\r\n");
    const url=URL.createObjectURL(new Blob([text],{type:"text/calendar;charset=utf-8"}));
    const link=document.createElement("a");
    link.href=url; link.download="gorus.ics"; link.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const states: Record<string, string> = {
    requested: t("Baxılır", "Pending"),
    confirmed: t("Təsdiqləndi", "Confirmed"),
    proposed: t("Yeni vaxt təklif edildi", "New time proposed"),
    cancelled: t("Ləğv edildi", "Cancelled"),
    declined: t("Qəbul edilmədi", "Declined"),
  };
  const date = (s: string) =>
    new Date(s).toLocaleString(lang === "az" ? "az-AZ" : "en-GB");
  const own = uid && record?.owner === uid ? record : null;
  return (
    <Screen
      title={t("Şəxsi kabinet", "My account")}
      description={
        user
          ? (user.email ?? "")
          : t(
              "Nəticələrinizi və görüş sorğularınızı izləmək üçün daxil olun.",
              "Sign in to view your results and appointment requests.",
            )
      }
    >
      {user === undefined ? (
        <p role="status">{t("Yüklənir…", "Loading…")}</p>
      ) : user ? (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm">
            <Link href="/gorus" className={buttonVariants()}>{t("Yeni görüş","New appointment")}</Link>
            <Button variant="outline" onClick={() => refresh((n) => n + 1)}>
              {t("Yenilə", "Refresh")}
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                const r = await database().auth.signOut({ scope: "local" });
                setMessage(r.error ? "error" : "");
              }}
            >
              {t("Çıxış", "Sign out")}
            </Button>
          </div>
          <div className="grid min-w-0 items-start gap-5 xl:grid-cols-2">
            <Panel title={t("Nəticələrim", "My results")}>
              {own?.results.length ? own.results.map(r => (
                <details key={r.id} className="group rounded-2xl border bg-gradient-to-br from-card to-primary/5">
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><ClipboardList size={20} aria-hidden="true"/></span>
                    <span className="grid min-w-0 flex-1 gap-1">
                      <strong className="break-words">{r.title}</strong>
                      <time dateTime={r.published_at} className="text-xs text-muted-foreground">{date(r.published_at)}</time>
                    </span>
                    <ChevronDown size={17} aria-hidden="true" className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"/>
                  </summary>
                  <div className="portal-enter mx-4 border-t py-4">
                    <p className="text-xs font-semibold text-primary">{t("Nəticə və izah","Result and explanation")}</p>
                    <p className="mt-2 whitespace-pre-wrap break-words leading-6 text-muted-foreground">{r.explanation}</p>
                  </div>
                </details>
              )) : own ? (
                <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed bg-primary/5 px-5 py-8 text-center">
                  <ClipboardList className="size-8 text-primary" aria-hidden="true"/>
                  <strong>{t("Hələ nəticə paylaşılmayıb","No results yet")}</strong>
                  <p className="text-sm text-muted-foreground">{t("Psixoloqun paylaşdığı nəticələr və izahlar burada görünəcək.","Results and explanations shared by your psychologist will appear here.")}</p>
                </div>
              ) : <p role="status" className="text-muted-foreground">{t("Yüklənir…","Loading…")}</p>}
            </Panel>
            <section id="gorusler" className="min-w-0 scroll-mt-24">
              <Panel title={t("Görüşlərim","My appointments")}>
                {own?.visits.length ? own.visits.map(v => {
                  const when = v.scheduled_at ?? v.requested_at;
                  const day = new Date(when);
                  const locale = lang === "az" ? "az-AZ" : "en-GB";
                  const tone = v.status === "confirmed" ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" : v.status === "declined" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";
                  return (
                    <article key={v.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border bg-gradient-to-br from-card to-primary/5 p-4">
                      <time dateTime={when} className="grid min-w-14 content-center justify-items-center rounded-xl bg-primary/10 px-2 py-2 text-primary">
                        <span className="text-2xl font-semibold leading-none">{day.getDate()}</span>
                        <span className="mt-1 text-xs font-medium">{day.toLocaleDateString(locale,{month:"short"})}</span>
                      </time>
                      <div className="grid min-w-0 justify-items-start gap-2">
                        <strong className={"rounded-full px-2.5 py-1 text-xs "+tone}>{states[v.status] ?? v.status}</strong>
                        <span className="flex items-start gap-2 text-sm text-muted-foreground"><Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true"/>{date(when)}</span>
                        {day.getTime()>Date.now() && ["requested","confirmed","proposed"].includes(v.status) && <div className="flex flex-wrap gap-2">
                          {v.status==="confirmed" && <Button variant="outline" size="sm" onClick={()=>addToCalendar(v)}>{t("Təqvimə əlavə et","Add to calendar")}</Button>}
                          <Button variant="ghost" size="sm" disabled={busy} onClick={()=>cancelVisit(v.id)}>{t("Ləğv et","Cancel")}</Button>
                        </div>}
                        {v.status==="proposed" && v.scheduled_at && <p className="text-xs text-muted-foreground">{t("İlk seçiminiz","Originally requested")} · {date(v.requested_at)}</p>}
                      </div>
                    </article>
                  );
                }) : own ? (
                  <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed bg-primary/5 px-5 py-8 text-center">
                    <CalendarDays className="size-8 text-primary" aria-hidden="true"/>
                    <strong>{t("Hələ görüş sorğunuz yoxdur","No appointments yet")}</strong>
                    <Link href="/gorus" className={buttonVariants({variant:"outline"})}>{t("Görüş üçün müraciət","Request an appointment")}<ArrowUpRight aria-hidden="true"/></Link>
                  </div>
                ) : <p role="status" className="text-muted-foreground">{t("Yüklənir…","Loading…")}</p>}
              </Panel>
            </section>
          </div>
        </>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <section className="order-2 grid gap-4 rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-card to-primary/10 p-6 lg:order-0 sm:p-8">
            <h2 className="text-xl font-semibold">{t("Kabinetdə nələr var?","What’s in your account?")}</h2>
            <div className="rounded-xl bg-card/70 p-4"><h3 className="font-semibold">{t("Görüşlərim","My appointments")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("Sorğunun cavabını və təklif edilən vaxtı görün.","See responses and proposed times for your requests.")}</p></div>
            <div className="rounded-xl bg-card/70 p-4"><h3 className="font-semibold">{t("Nəticələrim","My results")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("Psixoloqun sizinlə paylaşdığı nəticə və izahları oxuyun.","Read results and explanations shared with you.")}</p></div>
          </section>
          <div className="min-w-0">
          <div aria-label={t("Hesab seçimi","Account options")} className="mb-4 grid grid-cols-2 gap-2">{[false,true].map(register=><Button key={String(register)} disabled={busy} aria-pressed={register===registration} variant={register===registration?"default":"outline"} onClick={()=>{setRegistration(register);setMessage("")}}>{register?t("Qeydiyyatdan keç","Register"):t("Daxil ol","Sign in")}</Button>)}</div>
          <Panel
            title={
              registration
                ? t("Qeydiyyat", "Create account")
                : t("Hesaba giriş", "Sign in")
            }
          >
            {notice}
            <form key={String(registration)} className="grid gap-4" onSubmit={authenticate}>
              <label className={fieldStyle}>
                {t("E-poçt", "Email")}
                <Input
                  className="h-11"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label className={fieldStyle}>
                {t("Şifrə", "Password")}
                <Input
                  className="h-11"
                  name="password"
                  type="password"
                  autoComplete={
                    registration ? "new-password" : "current-password"
                  }
                  required
                />
              </label>
              <Button type="submit" disabled={busy}>
                {registration
                  ? t("Qeydiyyatdan keç", "Register")
                  : t("Daxil ol", "Sign in")}
              </Button>

            </form>
          </Panel>
          </div>
        </div>
      )}
      {user && notice}
    </Screen>
  );
}
