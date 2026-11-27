"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { database } from "@/lib/portal";
import { Screen, Panel, fieldStyle } from "@/components/portal-content";
import { Button } from "@/components/ui/button";
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
  const states: Record<string, string> = {
    requested: t("Baxılır", "Pending"),
    confirmed: t("Təsdiqləndi", "Confirmed"),
    proposed: t("Yeni vaxt təklif edildi", "New time proposed"),
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
          <div className="flex gap-2">
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
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title={t("Nəticələrim", "My results")}>
              {own
                ? own.results.length
                  ? own.results.map((r) => (
                      <article className="grid gap-2 rounded-xl border bg-background/50 p-4" key={r.id}>
                        <h3 className="font-semibold">{r.title}</h3>
                        <small>{date(r.published_at)}</small>
                        <p className="whitespace-pre-wrap">{r.explanation}</p>
                      </article>
                    ))
                  : t(
                      "Hələ nəticə paylaşılmayıb.",
                      "No results have been shared yet.",
                    )
                : t("Yüklənir…", "Loading…")}
            </Panel>
            <Panel title={t("Görüşlərim", "My appointments")}>
              {own
                ? own.visits.length
                  ? own.visits.map((v) => (
                      <div className="grid gap-2 rounded-xl border bg-background/50 p-4" key={v.id}>
                        <strong className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{states[v.status]}</strong>
                        {date(v.scheduled_at ?? v.requested_at)}
                      </div>
                    ))
                  : <div className="grid gap-3 text-muted-foreground">{t("Hələ görüş sorğunuz yoxdur.", "No requests yet.")}<Link href="/gorus" className="font-medium text-primary underline">{t("Görüş üçün müraciət","Request an appointment")}</Link></div>
                : t("Yüklənir…", "Loading…")}
            </Panel>
          </div>
        </>
      ) : (
        <div className="max-w-md">
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
      )}
      {user && notice}
    </Screen>
  );
}
