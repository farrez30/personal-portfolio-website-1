"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { PiPlayFill, PiPauseFill, PiXBold, PiMusicNotesBold, PiSkipForwardFill } from "react-icons/pi";
import { useMode } from "@/components/mode/ModeProvider";
import { LAGU, albumMusik } from "@/content/musik";
import "./pemutar.css";

// Satu pemutar musik untuk kedua mode, dari rekaman berlisensi bebas di /musik (ADR 0022).
// Elemen audio baru dibuat saat pengunjung menekan putar, jadi sebelum itu tidak ada berkas
// yang diunduh. Satu lagu dimuat pada satu waktu, lalu lanjut ke lagu berikutnya.

export default function PemutarMusik() {
  const t = useTranslations("pemutar");
  const locale = useLocale();
  const pathname = usePathname();
  const { mode } = useMode();

  const [indeks, setIndeks] = useState(0);
  const [jalan, setJalan] = useState(false);
  const [tersembunyi, setTersembunyi] = useState(false);
  // Dilipat sendiri selama buklet dibaca supaya panel tidak menutupi kolom teksnya;
  // musik tetap jalan. Terpisah dari pilihan pengguna, jadi kembali sendiri saat ditutup.
  const [dilipat, setDilipat] = useState(false);
  // Selama cerita gulir di layar, dan di HP begitu hero lewat (rak, klien, kontak), panel
  // menciut ke cakram supaya tidak menutupi judul dan isi seksi (terukur di HP 390 px).
  // Membuka cakram tetap boleh, sampai pengunjung pindah zona.
  const [diCerita, setDiCerita] = useState(false);
  const [lewatHero, setLewatHero] = useState(false);
  const lipatOtomatis = diCerita || lewatHero;
  const [dibukaManual, setDibukaManual] = useState(false);
  const sembunyi = tersembunyi || dilipat || (lipatOtomatis && !dibukaManual);

  const audio = useRef(null);
  const mauPutar = useRef(false);
  const gagalBeruntun = useRef(0);
  const dariCd = useRef(false);
  const lagu = LAGU[indeks];

  const berikutnya = useCallback(() => setIndeks((i) => (i + 1) % LAGU.length), []);
  const sebelumnya = useCallback(() => setIndeks((i) => (i - 1 + LAGU.length) % LAGU.length), []);

  const elemen = useCallback(() => {
    if (audio.current) return audio.current;
    const a = new Audio();
    a.preload = "none";
    a.addEventListener("play", () => setJalan(true));
    a.addEventListener("pause", () => setJalan(false));
    a.addEventListener("playing", () => (gagalBeruntun.current = 0));
    a.addEventListener("ended", berikutnya);
    // Berkas yang gagal dimuat dilewati, tapi berhenti bila semuanya gagal (misalnya luring).
    a.addEventListener("error", () => {
      gagalBeruntun.current += 1;
      if (mauPutar.current && gagalBeruntun.current < LAGU.length) berikutnya();
      else mauPutar.current = false;
    });
    audio.current = a;
    return a;
  }, [berikutnya]);

  const putar = useCallback(() => {
    mauPutar.current = true;
    const a = elemen();
    if (!a.getAttribute("src")) a.src = LAGU[indeks].berkas;
    a.play().catch(() => {
      mauPutar.current = false;
    });
  }, [elemen, indeks]);

  const jeda = useCallback(() => {
    mauPutar.current = false;
    audio.current?.pause();
  }, []);

  // Ganti lagu: hanya bila elemen audio sudah ada; sebelum itu cukup judulnya yang berganti.
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    a.src = LAGU[indeks].berkas;
    if (mauPutar.current) a.play().catch(() => (mauPutar.current = false));
  }, [indeks]);

  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current?.removeAttribute("src");
      audio.current = null;
    },
    [],
  );

  // Kontrol di layar kunci dan notifikasi HP.
  useEffect(() => {
    if (!jalan || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({ title: lagu.judul, artist: lagu.artis, album: albumMusik.judul[locale] });
    ms.setActionHandler("play", putar);
    ms.setActionHandler("pause", jeda);
    ms.setActionHandler("nexttrack", berikutnya);
    ms.setActionHandler("previoustrack", sebelumnya);
  }, [jalan, lagu, locale, putar, jeda, berikutnya, sebelumnya]);

  // Play dan Pause di pemutar CD (mode Imersif) saat CD musik ada di dalamnya. Hanya jeda
  // bila putarnya juga datang dari CD, supaya CD proyek tidak mematikan musik latar.
  useEffect(() => {
    const dengar = (e) => {
      if (e.detail?.jalan) {
        dariCd.current = true;
        putar();
      } else if (dariCd.current) {
        dariCd.current = false;
        jeda();
      }
    };
    window.addEventListener("musik", dengar);
    return () => window.removeEventListener("musik", dengar);
  }, [putar, jeda]);

  // Explainer proyek di hologram bersuara: lagu yang sedang jalan dijeda, lalu diputar
  // lagi begitu explainer berhenti, dibisukan, atau CD-nya dikeluarkan.
  const diredam = useRef(false);
  useEffect(() => {
    const dengar = (e) => {
      if (e.detail?.redam) {
        if (!mauPutar.current) return;
        diredam.current = true;
        jeda();
      } else if (diredam.current) {
        diredam.current = false;
        putar();
      }
    };
    window.addEventListener("musik:redam", dengar);
    return () => window.removeEventListener("musik:redam", dengar);
  }, [putar, jeda]);

  useEffect(() => {
    const dengar = (e) => setDilipat(e.detail?.keadaan === "buklet");
    window.addEventListener("panggung", dengar);
    return () => window.removeEventListener("panggung", dengar);
  }, []);

  useEffect(() => {
    const dengar = (e) => setDiCerita(!!e.detail?.tampil);
    window.addEventListener("cerita", dengar);
    return () => window.removeEventListener("cerita", dengar);
  }, []);

  // Pemutar hidup di layout, jadi hero dicari ulang tiap path berganti.
  useEffect(() => {
    const hp = matchMedia("(max-width: 600px)");
    let io;
    const pasangAmatan = () => {
      io?.disconnect();
      const hero = document.querySelector(".gerbang");
      if (!hero || !hp.matches) return setLewatHero(false);
      io = new IntersectionObserver(([e]) => setLewatHero(!e.isIntersecting));
      io.observe(hero);
    };
    pasangAmatan();
    hp.addEventListener("change", pasangAmatan);
    return () => {
      io?.disconnect();
      hp.removeEventListener("change", pasangAmatan);
    };
  }, [pathname]);

  useEffect(() => setDibukaManual(false), [diCerita, lewatHero]);

  const labelPutar = jalan ? t("jeda") : t("putar");

  return (
    <>
      <section
        className={`vinyl-player ${mode === "imersif" ? "vinyl-player--imersif" : ""} ${lipatOtomatis ? "vinyl-player--lipat" : ""} ${sembunyi ? "is-hidden" : ""}`}
        aria-label={t("sedangDiputar")}
        aria-hidden={sembunyi}
        inert={sembunyi ? true : undefined}
      >
        <div className="vinyl-baris">
          <div className="vinyl-stage">
            <span className={`tonearm ${jalan ? "tonearm--on" : ""}`} aria-hidden="true" />
            <div className={`vinyl ${jalan ? "playing" : ""}`}>
              <span className="vinyl__label">
                <span className="vinyl__polos" />
                <span className="vinyl__hole" />
              </span>
            </div>
          </div>

          <div className="vinyl-meta" aria-live="polite">
            <small className="vinyl-meta__now">{jalan ? t("sedangDiputar") : t("siap")}</small>
            <strong className="vinyl-meta__title" title={lagu.judul}>{lagu.judul}</strong>
            {/* Nama pemain dan lisensinya: atribusi CC BY dan BY-SA selama lagu diputar. Lisensi
                di baris sendiri supaya tidak ikut terpotong saat nama pemainnya panjang. */}
            <span className="vinyl-meta__artist" title={lagu.artis}>{lagu.artis}</span>
            <a className="vinyl-meta__lisensi" href={lagu.urlLisensi} target="_blank" rel="noopener noreferrer">
              {lagu.lisensi === "Public domain" ? t("domainPublik") : lagu.lisensi}
            </a>
          </div>

          <div className="vinyl-controls">
            <button type="button" className="vinyl-btn" onClick={jalan ? jeda : putar} aria-label={labelPutar} title={labelPutar}>
              {jalan ? <PiPauseFill aria-hidden="true" /> : <PiPlayFill aria-hidden="true" />}
            </button>
            <button type="button" className="vinyl-btn" onClick={berikutnya} aria-label={t("berikutnya")} title={t("berikutnya")}>
              <PiSkipForwardFill aria-hidden="true" />
            </button>
            <button type="button" className="vinyl-btn" onClick={() => setTersembunyi(true)} aria-label={t("sembunyi")} title={t("sembunyi")}>
              <PiXBold aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        className={`vinyl-reopen ${mode === "imersif" ? "vinyl-reopen--imersif" : ""} ${lipatOtomatis ? "vinyl-reopen--lipat" : ""} ${sembunyi ? "is-shown" : ""}`}
        onClick={() => {
          setTersembunyi(false);
          setDilipat(false);
          if (lipatOtomatis) setDibukaManual(true);
        }}
        aria-label={t("tampil")}
        title={t("tampil")}
        aria-hidden={!sembunyi}
        tabIndex={sembunyi ? 0 : -1}
      >
        <PiMusicNotesBold aria-hidden="true" />
      </button>
    </>
  );
}
