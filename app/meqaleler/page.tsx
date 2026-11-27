"use client";
import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { database } from "@/lib/portal";
import { Screen } from "@/components/portal-content";
import { useLang } from "@/lib/psystat/i18n";
type Article = {
  id: string;
  title: string;
  body: string;
  published_at: string;
};
export default function Articles() {
  const { t, lang } = useLang(),
    [articles, setArticles] = useState<Article[] | null>(null),
    [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const matches = articles?.filter(a => (a.title + " " + a.body).toLocaleLowerCase(lang).includes(query.trim().toLocaleLowerCase(lang)));
  useEffect(() => {
    let active = true;
    database()
      .from("portal_articles")
      .select("id,title,body,published_at")
      .order("published_at", { ascending: false })
      .then((r) => {
        if (active) {
          setError(!!r.error);
          setArticles(r.data ?? []);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <Screen
      title={t("Məqalələr", "Articles")}
      description={t("Psixologiya haqqında yazılar.", "Writing on psychology.")}
    >
      <div className="grid max-w-4xl gap-4">
        {!!articles?.length && <label className="flex items-center gap-3 rounded-2xl border bg-card p-3"><Search size={19} aria-hidden="true"/><span className="sr-only">{t("Məqalə axtar","Search articles")}</span><input type="search" className="min-w-0 flex-1 bg-transparent p-1 outline-primary" placeholder={t("Məqalə axtar","Search articles")} value={query} onChange={e=>setQuery(e.target.value)}/></label>}
        {articles?.length ? (
          matches?.length ? matches.map((a) => (
            <details key={a.id} className="rounded-2xl border bg-card p-5"><summary className="cursor-pointer rounded-md font-semibold focus-visible:outline-primary">{a.title}</summary><div className="portal-enter mt-4 grid gap-3 border-t pt-4">
              <time className="text-xs text-muted-foreground">
                {new Date(a.published_at).toLocaleDateString(lang)}
              </time>
              <p className="whitespace-pre-wrap leading-7">{a.body}</p>
            </div></details>
          )) : <p role="status">{t("Axtarışa uyğun məqalə yoxdur.","No articles match your search.")}</p>
        ) : (
          <div
            role="status"
            className="grid justify-items-center gap-3 rounded-2xl border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground"
          >
            <BookOpen className="text-primary" />
            {error
              ? t("Yükləmək alınmadı.", "Unable to load articles.")
              : articles
                ? t(
                    "İlk məqalə burada yayımlanacaq.",
                    "The first article will appear here.",
                  )
                : t("Yüklənir…", "Loading…")}
          </div>
        )}
      </div>
    </Screen>
  );
}
