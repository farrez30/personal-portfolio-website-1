"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PiXBold } from "react-icons/pi";
import { proyek } from "@/content/proyek";
import AlbumIsi from "@/components/album/AlbumIsi";
import Sampul from "./Sampul";
import "./rak.css";

export default function Rak() {
  const t = useTranslations("rak");
  const ta = useTranslations("album");
  const locale = useLocale();
  const [aktif, setAktif] = useState(null);
  const dialog = useRef(null);
  const p = proyek.find((x) => x.slug === aktif) ?? null;

  const tutup = useCallback(() => setAktif(null), []);

  // Mode Ringan: album dibuka sebagai <dialog> bawaan (fokus terkunci, Esc menutup).
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (p && !d.open) d.showModal();
    if (!p && d.open) d.close();
  }, [p]);

  return (
    <section id="rak" className="rak" aria-labelledby="rak-judul">
      <div className="wadah">
        <h2 id="rak-judul" className="rak__judul">
          {t("judul")}
        </h2>
      </div>

      <ul className="wadah rak__kisi">
        {proyek.map((x) => (
          <li key={x.slug}>
            <button type="button" className="rak__album" onClick={() => setAktif(x.slug)}>
              <Sampul p={x} locale={locale} />
              <span className="rak__keterangan">
                <span className="rak__nama">{x.judul[locale]}</span>
                <span className="mono rak__info">
                  {t(`jenis.${x.jenis}`)}, {t(`status.${x.status}`)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {(
        <dialog
          ref={dialog}
          className="rak__dialog"
          aria-labelledby="album-judul"
          onClose={tutup}
          onClick={(e) => e.target === dialog.current && tutup()}
        >
          {p && (
            <div className="rak__dialog-isi">
              <button type="button" className="tema rak__tutup" onClick={tutup} aria-label={ta("tutup")}>
                <PiXBold aria-hidden="true" />
              </button>
              <AlbumIsi p={p} idJudul="album-judul" />
            </div>
          )}
        </dialog>
      )}
    </section>
  );
}
