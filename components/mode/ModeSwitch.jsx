"use client";
import { useTranslations } from "next-intl";
import { useMode } from "./ModeProvider";
import "./mode.css";

export default function ModeSwitch() {
  const t = useTranslations("mode");
  const { mode, setMode } = useMode();

  return (
    <fieldset className="saklar" aria-busy={mode == null}>
      <legend className="sr-only">{t("label")}</legend>
      {["imersif", "ringan"].map((m) => (
        <label key={m} className="saklar__opsi" title={t(`${m}Info`)}>
          <input
            type="radio"
            name="mode"
            value={m}
            checked={mode === m}
            onChange={() => setMode(m)}
          />
          <span>{t(m)}</span>
        </label>
      ))}
    </fieldset>
  );
}
