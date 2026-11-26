"use client";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { database } from "@/lib/portal";
import { Screen, Panel } from "@/components/portal-content";
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
        {articles?.length ? (
          articles.map((a) => (
            <Panel key={a.id} title={a.title}>
              <time className="text-xs text-muted-foreground">
                {new Date(a.published_at).toLocaleDateString(lang)}
              </time>
              <p className="whitespace-pre-wrap leading-7">{a.body}</p>
            </Panel>
          ))
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
