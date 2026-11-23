"use client";
import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { PiPauseBold, PiPlayBold } from "react-icons/pi";
import { useMode } from "@/components/mode/ModeProvider";
import { kendaliLab, AWAL } from "@/components/stasiun/kendaliLab";

// Jeda semua gerak yang berjalan sendiri di dunia cerita v5: lalu lintas kota, satelit, robot dan
// astronot di modul lab (WCAG 2.2.2). Hanya tampil di mode Imersif selama dunianya terpasang.
// Label tetap, keadaannya lewat aria-pressed.
const LABEL = { id: "Jeda gerak", en: "Pause motion" };

export default function TombolJeda() {
  const { mode } = useMode();
  const locale = useLocale();
  const s = useSyncExternalStore(kendaliLab.dengar, kendaliLab.get, () => AWAL);
  if (mode !== "imersif" || !s.dunia) return null;
  const label = LABEL[locale] ?? LABEL.en;
  return (
    <button type="button" className="tema" data-jeda aria-label={label} title={label} aria-pressed={s.jeda} onClick={() => kendaliLab.set({ jeda: !s.jeda })}>
      {s.jeda ? <PiPlayBold aria-hidden="true" /> : <PiPauseBold aria-hidden="true" />}
    </button>
  );
}
