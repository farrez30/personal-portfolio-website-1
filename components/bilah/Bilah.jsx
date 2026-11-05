"use client";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import ModeSwitch from "@/components/mode/ModeSwitch";
import ThemeToggle from "@/components/theme/ThemeToggle";
import TombolSuara from "./TombolSuara";
import "./bilah.css";

export default function Bilah() {
  const t = useTranslations("umum");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <header className="bilah">
      <div className="wadah bilah__isi">
        <Link href="/" className="bilah__nama mono" aria-label="Farrez Al Hakim">
          FARREZ<span className="bilah__nama-ekor"> AL HAKIM</span>
        </Link>
        <div className="bilah__alat">
          <ModeSwitch />
          <nav aria-label={t("bahasa")} className="bilah__bahasa mono">
            {routing.locales.map((l) => (
              <Link
                key={l}
                href={pathname}
                locale={l}
                aria-current={l === locale ? "true" : undefined}
                hrefLang={l}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>
          <TombolSuara />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
