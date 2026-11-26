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
    [status, setStatus] = useState("");
  const [signedIn,setSignedIn]=useState<string|null>(null);
  useEffect(()=>{const {data}=database().auth.onAuthStateChange((_,session)=>setSignedIn(session?.user.email??""));return ()=>data.subscription.unsubscribe()},[]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget,
      data = new FormData(form),
      time = new Date(String(data.get("time")));
    if (!(time.getTime() > Date.now())) {
      setStatus(
        t("Gələcək tarix və saat seçin.", "Choose a future date and time."),
      );
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
          {signedIn===null?<p>…</p>:!signedIn?<div className="grid gap-4"><p className="text-sm text-muted-foreground">{t("Görüş vaxtını seçmək və cavabı izləmək üçün hesabınıza daxil olun.","Sign in to choose a time and track your request.")}</p><div className="flex flex-wrap gap-2"><Link className={buttonVariants()} href="/kabinet?next=gorus">{t("Daxil ol","Sign in")}</Link><Link className={buttonVariants({variant:"outline"})} href="/kabinet?mode=register&next=gorus">{t("Qeydiyyatdan keç","Register")}</Link></div></div>:<form onSubmit={submit} className="grid gap-5">
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
            <Button
              type="submit"
              className="justify-self-start"
              disabled={busy}
            >
              {busy
                ? t("Göndərilir…", "Sending…")
                : t("Sorğunu göndər", "Send request")}
            </Button>
            <output>{status}</output>
          </form>}
        </Panel>
      </div>
    </Screen>
  );
}
