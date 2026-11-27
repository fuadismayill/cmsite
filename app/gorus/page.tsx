"use client";
import { useEffect, useState, type FormEvent } from "react";
import { database } from "@/lib/portal";
import { Screen, Panel, fieldStyle } from "@/components/portal-content";
import Link from "next/link";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/psystat/i18n";
export default function Booking() {
  const { t } = useLang(),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [sent, setSent] = useState(false);
  const [review, setReview] = useState<{contact:string; time:Date}|null>(null);
  const [signedIn,setSignedIn]=useState<string|null>(null);
  useEffect(()=>{const {data}=database().auth.onAuthStateChange((_,session)=>setSignedIn(session?.user.email??""));return ()=>data.subscription.unsubscribe()},[]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setSent(false);
    const form = e.currentTarget,
      data = new FormData(form),
      time = new Date(String(data.get("time")));
    if (!(time.getTime() > Date.now())) {
      setStatus(
        t("Gələcək tarix və saat seçin.", "Choose a future date and time."),
      );
      return;
    }
    if (!review || review.contact !== String(data.get("contact")).trim() || review.time.getTime() !== time.getTime()) {
      setReview({contact:String(data.get("contact")).trim(),time});
      setStatus("");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const { error } = await database()
        .from("portal_bookings")
        .insert({
          contact: String(data.get("contact")).trim(),
          requested_at: time.toISOString(),
        });
      if (error) throw error;
      form.reset();
      setReview(null);
      setSent(true);
      setStatus(
        t(
          "Sorğunuz göndərildi. Cavab üçün qeyd etdiyiniz əlaqə vasitəsindən istifadə ediləcək.",
          "Request sent. You will be contacted using the details you provided.",
        ),
      );
    } catch {
      setStatus(
        t(
          "Sorğu göndərilmədi. Yenidən yoxlayın.",
          "Unable to send your request. Please try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen
      title={t("Görüş üçün müraciət", "Request an appointment")}
      description={t(
        "İstədiyiniz vaxtı bildirin. Sorğunuza baxıldıqdan sonra sizinlə əlaqə saxlanılacaq.",
        "Choose a preferred time. You will be contacted after your request is reviewed.",
      )}
    >
      <div className="max-w-2xl">
        <Panel title={t("Görüş məlumatları", "Appointment details")}>
          {signedIn===null?<p>…</p>:!signedIn?<div className="grid gap-4"><p className="text-sm text-muted-foreground">{t("Görüş vaxtını seçmək və cavabı izləmək üçün hesabınıza daxil olun.","Sign in to choose a time and track your request.")}</p><div className="flex flex-wrap gap-2"><Link className={buttonVariants()} href="/kabinet?next=gorus">{t("Daxil ol","Sign in")}</Link><Link className={buttonVariants({variant:"outline"})} href="/kabinet?mode=register&next=gorus">{t("Qeydiyyatdan keç","Register")}</Link></div></div>:<form onSubmit={submit} onChange={()=>setReview(null)} className="grid gap-5">
            <label className={fieldStyle}>
              {t("Telefon və ya e-poçt", "Phone or email")}
              <Input
                className="h-11"
                key={signedIn}
                defaultValue={signedIn}
                name="contact"
                required
                minLength={3}
                maxLength={200}
              />
            </label>
            <label className={fieldStyle}>
              {t("Tarix və saat (yerli vaxt)", "Date and time (local time)")}
              <Input
                className="h-11"
                name="time"
                required
                type="datetime-local"
              />
            </label>
            {review && <div role="status" className="portal-enter grid gap-1 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm"><strong>{t("Göndərməzdən əvvəl yoxlayın","Review before sending")}</strong><span>{review.time.toLocaleString()}</span><span className="break-all">{review.contact}</span></div>}
            <Button
              type="submit"
              className="justify-self-start"
              disabled={busy}
            >
              {busy
                ? t("Göndərilir…", "Sending…")
                : review ? t("Sorğunu göndər", "Send request") : t("Davam et", "Continue")}
            </Button>
            {status && <div role={sent ? "status" : "alert"} className={sent ? "rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm" : "rounded-xl border border-destructive/35 bg-destructive/10 p-4 text-sm"}><p>{status}</p>{sent && <Link href="/kabinet" className="mt-2 inline-block font-medium text-primary underline">{t("Görüşlərimə bax","View my appointments")}</Link>}</div>}
          </form>}
        </Panel>
      </div>
    </Screen>
  );
}
