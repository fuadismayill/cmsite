"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
type Language = "az" | "en";
const Context = createContext({
  lang: "az" as Language,
  setLang: (_value: Language) => {},
  t: (az: string, _en: string) => az,
});
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, update] = useState<Language>("az");
  useEffect(() => {
    if (localStorage.getItem("psystat_lang") === "en") update("en");
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  function setLang(value: Language) {
    localStorage.setItem("psystat_lang", value);
    update(value);
  }
  return (
    <Context.Provider
      value={{ lang, setLang, t: (az, en) => (lang === "az" ? az : en) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLang = () => useContext(Context);
