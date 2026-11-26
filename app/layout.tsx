import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/montserrat";
import "./globals.css";
import "./newyear.css";
import { LangProvider } from "@/lib/psystat/i18n";
import { PortalShell } from "@/components/portal-shell";
import { ButtonFillEffect } from "@/components/psystat/button-fill-effect";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Çinarə Məmmədova · Psixoloq",
  description:
    "Görüş üçün müraciət edin, məqalələri oxuyun və şəxsi nəticələrinizə baxın.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#fbf1f3",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const r=document.documentElement,t=localStorage.getItem('psystat_theme');r.classList.add((t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))?'dark':'light');if(localStorage.getItem('psystat-newyear')==='1')r.dataset.theme='newyear'}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased">
        <LangProvider>
          <PortalShell>{children}</PortalShell>
        </LangProvider>
        <ButtonFillEffect />
        <Analytics />
      </body>
    </html>
  );
}
