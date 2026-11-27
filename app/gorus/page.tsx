"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Screen, Panel, fieldStyle } from "@/components/portal-content";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { database } from "@/lib/portal";
import { useLang } from "@/lib/psystat/i18n";

type Options = {
  state: "approval_required" | "access_pending" | "access_declined" | "phone_required" | "pending" | "ready";
  slots?: string[];
};

export default function Booking() {
  const { t, lang } = useLang();
  const [userId, setUserId] = useState<string | null | undefined>();
  const [options, setOptions] = useState<Options>();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const { data } = database().auth.onAuthStateChange((_, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void (async () => {
      const result = await database().rpc("portal_booking_options");
      if (!active) return;
      if (result.error) setError("load");
      else setOptions(result.data as Options);
    })();
    return () => { active = false; };
  }, [userId, refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !options || !userId) return;
    const data = new FormData(event.currentTarget);
    const db = database();
    setBusy(true);
    setError("");
    try {
      if (options.state === "phone_required") {
        if (!phone) {
          const number = String(data.get("phone")).trim();
          const response = await db.auth.updateUser({ phone: number });
          if (response.error) throw response.error;
          setPhone(number);
        } else {
          const response = await db.auth.verifyOtp({
            phone, token: String(data.get("code")).trim(), type: "phone_change",
          });
          if (response.error) throw response.error;
          setPhone("");
          setRefresh((value) => value + 1);
        }
      } else if (options.state === "approval_required") {
        const response = await db.rpc("portal_request_booking_access");
        if (response.error) throw response.error;
        setRefresh((value) => value + 1);
      } else if (options.state === "ready") {
        const slot = String(data.get("slot"));
        if (!options.slots?.includes(slot)) return;
        const response = await db.from("portal_bookings").insert({
          requested_at: slot,
          contact: "verified",
        });
        if (response.error) throw response.error;
        setSent(true);
        setOptions({ state: "pending" });
      }
    } catch {
      setError(options.state === "ready" ? "booking" : options.state === "approval_required" ? "access" : "phone");
      if (options.state === "ready") setRefresh((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  const formatSlot = new Intl.DateTimeFormat(lang === "az" ? "az-AZ" : "en-GB", {
    dateStyle: "full", timeStyle: "short", timeZone: "Asia/Baku",
  });

  return (
    <Screen title={t("Görüş üçün müraciət", "Request an appointment")} description={t(
      "Psixoloqun açdığı saatlardan birini seçin və cavabı kabinetinizdə izləyin.",
      "Choose a time opened by your psychologist and track the response in your account.",
    )}>
      <Panel title={t("Görüş məlumatları", "Appointment details")}>
        {userId === null && <div className="flex flex-wrap gap-3">
          <Link className={buttonVariants()} href="/kabinet?next=gorus">{t("Daxil ol", "Sign in")}</Link>
          <Link className={buttonVariants({ variant: "outline" })} href="/kabinet?mode=register&next=gorus">{t("Hesab yarat", "Create account")}</Link>
        </div>}
        {(userId === undefined || (userId && !options && !error)) && <p role="status">{t("Yüklənir…", "Loading…")}</p>}
        {userId && options?.state === "approval_required" && <form onSubmit={submit} className="grid gap-3">
          <p>{t("Açıq saatları görmək üçün əvvəlcə psixoloqdan təqvimə giriş istəyin.", "Ask your psychologist for access before you can see available times.")}</p>
          <Button disabled={busy} className="justify-self-start" type="submit">{t("Təqvimə giriş istə", "Request schedule access")}</Button>
        </form>}
        {userId && options?.state === "access_pending" && <div className="grid gap-3">
          <p role="status">{t("Təqvimə giriş üçün təsdiq gözlənilir.", "Schedule access is pending confirmation.")}</p>
          <Button variant="outline" className="justify-self-start" onClick={() => setRefresh((value) => value + 1)}>{t("Yenilə", "Refresh")}</Button>
        </div>}
        {userId && options?.state === "access_declined" && <p role="status">{t("Təqvimə giriş müraciəti qəbul edilməyib.", "Your schedule access request was declined.")}</p>}
        {userId && options?.state === "pending" && <div className="grid gap-3">
          <p role="status">{sent ? t("Sorğunuz göndərildi. Təsdiq gözlənilir.", "Request sent. Pending confirmation.") : t("Cavab gözləyən sorğunuz var.", "You have a pending request.")}</p>
          <Link className={buttonVariants({ variant: "outline", className: "justify-self-start" })} href="/kabinet#gorusler">{t("Görüşlərimə bax", "View my appointments")}</Link>
        </div>}
        {userId && options?.state === "phone_required" && (
          <form onSubmit={submit} className="grid gap-4">
            <label className={fieldStyle}>
              {phone ? t("SMS təsdiq kodu", "SMS verification code") : t("Beynəlxalq formatda telefon nömrəsi", "Phone number in international format")}
              {phone
                ? <Input key="code" required name="code" inputMode="numeric" autoComplete="one-time-code" />
                : <Input key="phone" required name="phone" type="tel" autoComplete="tel" placeholder="+994" pattern="[+][1-9][0-9]{7,14}" />}
            </label>
            <div className="flex flex-wrap gap-3">
              <Button disabled={busy} type="submit">{phone ? t("Nömrəni təsdiqlə", "Verify number") : t("SMS kodu göndər", "Send SMS code")}</Button>
              {phone && <Button disabled={busy} type="button" variant="outline" onClick={() => setPhone("")}>{t("Nömrəni dəyiş", "Change number")}</Button>}
            </div>
          </form>
        )}
        {userId && options?.state === "ready" && (options.slots?.length ? (
          <form onSubmit={submit} className="grid gap-4">
            <label className={fieldStyle}>
              {t("Açıq saatlar (Bakı vaxtı)", "Available times (Baku time)")}
              <select name="slot" required defaultValue="" className="min-h-11 rounded-md border bg-background p-2">
                <option value="" disabled>{t("Saat seçin", "Select a time")}</option>
                {options.slots.map((slot) => <option key={slot} value={slot}>{formatSlot.format(new Date(slot))}</option>)}
              </select>
            </label>
            <Button disabled={busy} type="submit" className="justify-self-start">{t("Sorğunu göndər", "Send request")}</Button>
          </form>
        ) : <p>{t("Hazırda açıq saat yoxdur.", "There are no available times right now.")}</p>)}
        {userId && error && <div className="mt-4 grid gap-2 text-destructive">
          <p role="alert">{error === "phone"
            ? t("Telefon təsdiqi alınmadı. Nömrəni və ya SMS kodunu yoxlayın.", "Phone verification failed. Check the number or SMS code.")
            : error === "booking"
              ? t("Sorğu göndərilmədi. Saat tutulmuş ola bilər. Son sorğunuzdan 15 dəqiqə keçməyibsə, sonra yenidən yoxlayın.", "Request failed. The time may be taken. If you sent a request in the past 15 minutes, try again later.")
              : error === "access" ? t("Giriş müraciəti göndərilmədi. E-poçt və telefon təsdiqini yoxlayın.", "Access request failed. Check that your email and phone are verified.")
                : t("Görüş məlumatları yüklənmədi.", "Unable to load appointment information.")}</p>
          {error === "load" && <Button variant="outline" className="justify-self-start" onClick={() => { setError(""); setRefresh((value) => value + 1); }}>{t("Yenilə", "Retry")}</Button>}
        </div>}
      </Panel>
    </Screen>
  );
}
