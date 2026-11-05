"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PiSpeakerHighBold, PiSpeakerSlashBold } from "react-icons/pi";
import { useMode } from "@/components/mode/ModeProvider";
import { suara } from "@/components/imersif/suara";

// Saklar suara efek rak. Hanya tampil di mode Imersif, karena hanya di sana ada bunyinya.
export default function TombolSuara() {
  const t = useTranslations("umum");
  const { mode } = useMode();
  const [bisu, setBisu] = useState(null);

  useEffect(() => {
    const s = suara();
    if (!s) return;
    setBisu(s.bisu);
    return s.langgan(setBisu);
  }, []);

  if (mode !== "imersif" || bisu === null) return null;
  return (
    <button
      type="button"
      className="tema"
      aria-label={t("suara")}
      title={t("suara")}
      aria-pressed={!bisu}
      onClick={() => {
        const s = suara();
        s.buka();
        s.setBisu(!bisu);
      }}
    >
      {bisu ? <PiSpeakerSlashBold aria-hidden="true" /> : <PiSpeakerHighBold aria-hidden="true" />}
    </button>
  );
}
