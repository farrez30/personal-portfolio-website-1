"use client";
import React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { TbWorld } from "react-icons/tb";
import "./languageSwitcher.css";

const LOCALE_NAMES = {
  en: "English",
  id: "Indonesia",
  nl: "Nederlands",
  ja: "日本語",
  de: "Deutsch",
};

const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event) => {
    const nextLocale = event.target.value;
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div className="lang-switcher">
      <TbWorld className="lang-switcher__icon" aria-hidden="true" />
      <select
        className="lang-switcher__select"
        value={locale}
        onChange={handleChange}
        aria-label="Select language"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l] ?? l.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
