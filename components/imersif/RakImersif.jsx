"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiBookOpenTextBold,
  PiDiscBold,
  PiXBold,
  PiArrowLeftBold,
} from "react-icons/pi";
import AlbumIsi from "@/components/album/AlbumIsi";
import { buatAdegan } from "./adegan";
import "./imersif.css";

// Pembungkus React untuk adegan three.js. Semua yang bisa diklik di 3D punya
// padanan tombol HTML di sini, jadi rak tetap bisa dipakai lewat keyboard.
export default function RakImersif({ proyek, locale, aktif, onBuka, onTutup }) {
  const t = useTranslations("rak");
  const ta = useTranslations("album");
  const wadah = useRef(null);
  const adegan = useRef(null);
  const [fokus, setFokus] = useState(0);
  const [buklet, setBuklet] = useState(false);
  const [putar, setPutar] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    let batal = false;
    let a = null;
    // Font perlu siap dulu karena sampul dan buklet digambar dengan font halaman.
    document.fonts.ready.then(() => {
      if (batal) return;
      a = buatAdegan(wadah.current, {
        proyek,
        locale,
        kurangiGerak: matchMedia("(prefers-reduced-motion: reduce)").matches,
        onBuka,
        onFokus: setFokus,
      });
      adegan.current = a;
      setSiap(true);
    });
    return () => {
      batal = true;
      a?.dispose();
      adegan.current = null;
      setSiap(false);
    };
  }, [proyek, locale, onBuka]);

  useEffect(() => {
    adegan.current?.aktifkan(aktif);
    setBuklet(false);
    setPutar(false);
  }, [aktif, siap]);

  const p = proyek.find((x) => x.slug === aktif) ?? null;
  const fokusP = proyek[fokus];

  const alihBuklet = () => {
    const a = adegan.current;
    if (!a) return;
    if (a.bukletTerbuka) a.tutupBuklet();
    else a.bukaBuklet();
    setBuklet(a.bukletTerbuka);
  };
  const alihPutar = () => {
    adegan.current?.putar(!putar);
    setPutar(!putar);
  };

  useEffect(() => {
    if (!aktif) return;
    const esc = (e) => {
      if (e.key !== "Escape") return;
      if (adegan.current?.bukletTerbuka) {
        adegan.current.tutupBuklet();
        setBuklet(false);
      } else onTutup();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aktif, onTutup]);

  return (
    <div className={`imersif ${aktif ? "imersif--buka" : ""} ${buklet ? "imersif--buklet" : ""}`}>
      <div ref={wadah} className="imersif__panggung" aria-hidden="true" />

      {!aktif && (
        <div className="imersif__kendali">
          <button
            type="button"
            className="tema"
            onClick={() => adegan.current?.geser(-1)}
            disabled={fokus === 0}
            aria-label={t("sebelumnya")}
          >
            <PiCaretLeftBold aria-hidden="true" />
          </button>
          <button type="button" className="tombol tombol--utama" onClick={() => onBuka(fokusP.slug)}>
            {t("buka")}: {fokusP.judul[locale]}
          </button>
          <button
            type="button"
            className="tema"
            onClick={() => adegan.current?.geser(1)}
            disabled={fokus === proyek.length - 1}
            aria-label={t("berikutnya")}
          >
            <PiCaretRightBold aria-hidden="true" />
          </button>
          <p className="sr-only" aria-live="polite">
            {fokusP.katalog} {fokusP.judul[locale]}
          </p>
        </div>
      )}

      {p && (
        <aside className="imersif__panel" aria-labelledby="imersif-judul">
          <div className="imersif__aksi">
            <button type="button" className="tombol" onClick={onTutup}>
              <PiArrowLeftBold aria-hidden="true" /> {ta("kembali")}
            </button>
            <button type="button" className="tombol" onClick={alihBuklet} aria-pressed={buklet}>
              {buklet ? <PiXBold aria-hidden="true" /> : <PiBookOpenTextBold aria-hidden="true" />}{" "}
              {buklet ? ta("tutupBuklet") : ta("buklet")}
            </button>
            {!buklet && (
              <button type="button" className="tombol" onClick={alihPutar} aria-pressed={putar}>
                <PiDiscBold aria-hidden="true" /> {ta("putar")}
              </button>
            )}
          </div>
          {!buklet && (
            <div className="imersif__isi">
              <AlbumIsi p={p} judulSebagai="h3" idJudul="imersif-judul" />
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
