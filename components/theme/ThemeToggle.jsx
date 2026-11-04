"use client";
import { useTranslations } from "next-intl";
import { PiSunBold, PiMoonBold } from "react-icons/pi";
import { useTheme } from "@/components/providers/ThemeProvider";
import "./themeToggle.css";

export default function ThemeToggle() {
  const t = useTranslations("umum");
  const { theme, toggle } = useTheme();
  const terang = theme === "light";
  const label = terang ? t("temaGelap") : t("temaTerang");

  return (
    <button type="button" className="tema" onClick={toggle} aria-label={label} title={label}>
      {terang ? <PiMoonBold aria-hidden="true" /> : <PiSunBold aria-hidden="true" />}
    </button>
  );
}
