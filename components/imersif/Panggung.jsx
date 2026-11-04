"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  PiPlayFill,
  PiPauseFill,
  PiSkipBackFill,
  PiSkipForwardFill,
  PiArrowUpRightBold,
  PiXBold,
} from "react-icons/pi";
import { proyek as daftarProyek } from "@/content/proyek";
import { albumMusik } from "@/content/musik";
import { situs } from "@/content/situs";
import Acak from "@/components/gerbang/Acak";
import Contact from "@/components/contact/Contact";
import Hologram from "./Hologram";

// Rak imersif: semua proyek, lalu satu CD musik di ujung.
const proyek = [...daftarProyek, albumMusik];
import { buatAdegan } from "./adegan";
import "./panggung.css";

// Mode Imersif: seluruh layar adalah rak CD. Semua yang bisa diklik di 3D punya
// padanan tombol HTML di sini, jadi tetap bisa dipakai lewat keyboard.
export default function Panggung() {
  const t = useTranslations("panggung");
  const tr = useTranslations("rak");
  const tg = useTranslations("gerbang");
  const locale = useLocale();
  const wadah = useRef(null);
  const adegan = useRef(null);
  const gelembung = useRef(null);
  const [siap, setSiap] = useState(false);
  const [s, setS] = useState({ fokus: 0, keadaan: "rak", aktif: null, terbalik: false, duduk: false, jalan: false });
  const [hover, setHover] = useState(null);
  const [sumur, setSumur] = useState(null);
  const [panel, setPanel] = useState(null); // "tentang" | "kontak" | null

  const p = proyek[s.fokus];

  // Halaman di belakang panggung tidak boleh tersentuh fokus.
  useEffect(() => {
    const isi = document.getElementById("isi");
    isi?.setAttribute("inert", "");
    document.documentElement.classList.add("panggung-aktif");
    return () => {
      isi?.removeAttribute("inert");
      document.documentElement.classList.remove("panggung-aktif");
    };
  }, []);

  useEffect(() => {
    let batal = false;
    let a = null;
    document.fonts.ready.then(() => {
      if (batal) return;
      a = buatAdegan(wadah.current, {
        proyek,
        locale,
        kurangiGerak: matchMedia("(prefers-reduced-motion: reduce)").matches,
        onUbah: setS,
      });
      a.on("klikKotak", (slug) => a.buka(slug));
      a.on("klikCakram", () => (a.keadaan === "putar" ? a.keluarkan() : a.dengarkan()));
      a.on("tombol", (nama) => tekanTombol.current(nama));
      a.on("hover", setHover);
      let terakhir = 0;
      a.on("sumur", (x, y, w, nyala) => {
        const now = performance.now();
        if (now - terakhir < 50) return;
        terakhir = now;
        setSumur(nyala ? { x, y, w } : null);
      });
      adegan.current = a;
      bacaHash(a);
      setSiap(true);
    });
    return () => {
      batal = true;
      a?.dispose();
      adegan.current = null;
    };
  }, [locale]);

  // Play di pemutar: CD proyek menyalakan hologram, CD musik memutar lagu.
  const cdMusik = s.aktif === albumMusik.slug;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("musik", { detail: { jalan: cdMusik && s.jalan } }));
  }, [s.jalan, cdMusik]);

  // Rute di hash: #/slug, #/slug/buka, #/slug/putar, #/slug/buklet.
  useEffect(() => {
    if (!siap) return;
    const akhir = { rak: "", buka: "/buka", putar: "/putar", buklet: "/buklet" }[s.keadaan];
    const hash = `#/${proyek[s.fokus].slug}${akhir}`;
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }, [s.fokus, s.keadaan, siap]);

  // Hash yang berubah dari luar (tombol Back, tautan) ikut diterapkan.
  useEffect(() => {
    const ubah = () => adegan.current && bacaHash(adegan.current, true);
    window.addEventListener("hashchange", ubah);
    return () => window.removeEventListener("hashchange", ubah);
  }, []);

  const tekanTombol = useRef(() => {});
  tekanTombol.current = (nama) => {
    const a = adegan.current;
    if (!a) return;
    if (nama === "play") a.setJalan(true);
    else if (nama === "pause") a.setJalan(false);
    else if (nama === "prev" || nama === "next") gantiAlbum(nama === "next" ? 1 : -1);
  };

  // Ganti album dari pemutar: keluarkan cakram, tutup, geser, buka, putar.
  const gantiAlbum = useCallback((arah) => {
    const a = adegan.current;
    const i = s.fokus + arah;
    if (!a || i < 0 || i >= proyek.length) return;
    a.keluarkan();
    setTimeout(() => {
      a.tutup();
      setTimeout(() => {
        a.buka(proyek[i].slug);
        setTimeout(() => a.dengarkan(), 900);
      }, 700);
    }, 900);
  }, [s.fokus]);

  // Keyboard ala pemutar: panah, Enter, Spasi, Escape.
  useEffect(() => {
    const tekan = (e) => {
      const a = adegan.current;
      if (!a || panel || e.target?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "Escape") {
        if (s.keadaan !== "rak") a.tutup();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const arah = e.key === "ArrowRight" ? 1 : -1;
        if (s.keadaan === "rak") a.geser(arah);
        else if (s.keadaan === "buklet") a.halaman(arah);
        else return;
        e.preventDefault();
      } else if ((e.key === "Enter" || e.key === " ") && (e.target === document.body || e.target === window)) {
        if (s.keadaan === "rak") a.buka(p.slug);
        else if (s.keadaan === "putar" && s.duduk) a.setJalan(!s.jalan);
        else return;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", tekan);
    return () => window.removeEventListener("keydown", tekan);
  }, [s, p, panel]);

  // Kursor gelembung: lingkaran 76 px yang hanya diskalakan. Titik kecil saat diam,
  // membesar di atas benda yang bisa diklik, lebih besar di atas teks (warna dibalik),
  // dan jadi cincin tipis di atas tombol kecil pemutar.
  useEffect(() => {
    const el = gelembung.current;
    if (!el) return;
    let x = -100;
    let y = -100;
    let raf = 0;
    const gambar = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = 0;
    };
    const gerak = (e) => {
      if (e.pointerType !== "mouse") {
        el.dataset.ada = "0";
        return;
      }
      el.dataset.ada = "1";
      x = e.clientX;
      y = e.clientY;
      const teks = e.target.closest?.("button, a, [data-gelembung]");
      el.dataset.teks = teks && !teks.disabled ? "1" : "0";
      if (!raf) raf = requestAnimationFrame(gambar);
    };
    window.addEventListener("pointermove", gerak);
    return () => {
      window.removeEventListener("pointermove", gerak);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    if (gelembung.current) gelembung.current.dataset.adegan = hover ?? "";
  }, [hover]);

  const a = adegan.current;
  const aktif = proyek.find((x) => x.slug === s.aktif) ?? p;
  const sudut = {
    rak: { kiri: [t("tentang"), () => setPanel("tentang")] },
    buka: { kiri: [t("tutup"), () => a?.tutup()] },
    buklet: { kiri: [t("tutup"), () => a?.tutup()] },
    putar: { kiri: [t("keluarkan"), () => a?.keluarkan()] },
  }[s.keadaan];

  return (
    <div className={`panggung panggung--${s.keadaan}`} data-siap={siap ? "1" : "0"}>
      <div ref={wadah} className="panggung__kanvas" aria-hidden="true" />

      {!siap && (
        <div className="panggung__muat" role="progressbar" aria-label={t("memuat")}>
          <span className="panggung__cincin" />
        </div>
      )}

      <header className="panggung__kepala">
        <button type="button" className="panggung__sudut" onClick={sudut.kiri[1]}>
          {sudut.kiri[0]}
        </button>
        <p className="panggung__masthead">
          {s.keadaan === "rak" && <Acak teks={tg("headline")} durasi={1800} tunda={300} />}
        </p>
        <button type="button" className="panggung__sudut" onClick={() => setPanel("kontak")}>
          {t("kontak")}
        </button>
      </header>

      <footer className="panggung__kaki">
        <div className="panggung__pasangan">
          {s.keadaan === "rak" && (
            <button type="button" className="panggung__sudut" onClick={() => a?.geser(-1)} disabled={s.fokus === 0} aria-label={tr("sebelumnya")}>
              ←
            </button>
          )}
          {s.keadaan === "buka" && (
            <button type="button" className="panggung__sudut" onClick={() => a?.bukaBuklet()}>
              {t("buklet")}
            </button>
          )}
          {s.keadaan === "buklet" && (
            <button type="button" className="panggung__sudut" onClick={() => a?.halaman(-1)} aria-label={t("halamanSebelumnya")}>
              ←
            </button>
          )}
          {s.keadaan === "putar" && aktif.tautan?.repo && (
            <a className="panggung__sudut" href={aktif.tautan.repo} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
        </div>

        <div className="panggung__keterangan">
          {s.keadaan === "putar" && s.duduk && (
            <div className="panggung__transport" role="group" aria-label={t("pemutar")}>
              <button type="button" onClick={() => gantiAlbum(-1)} aria-label={t("sebelumnya")} disabled={s.fokus === 0}>
                <PiSkipBackFill aria-hidden="true" />
              </button>
              <button type="button" onClick={() => a?.setJalan(true)} aria-label={t("putar")} aria-pressed={s.jalan}>
                <PiPlayFill aria-hidden="true" />
              </button>
              <button type="button" onClick={() => a?.setJalan(false)} aria-label={t("jeda")} aria-pressed={!s.jalan}>
                <PiPauseFill aria-hidden="true" />
              </button>
              <button type="button" onClick={() => gantiAlbum(1)} aria-label={t("berikutnya")} disabled={s.fokus === proyek.length - 1}>
                <PiSkipForwardFill aria-hidden="true" />
              </button>
            </div>
          )}
          <button
            type="button"
            className="panggung__judul"
            onClick={() => s.keadaan === "rak" && a?.buka(p.slug)}
            tabIndex={s.keadaan === "rak" ? 0 : -1}
            aria-label={s.keadaan === "rak" ? `${tr("buka")}: ${aktif.judul[locale]}` : undefined}
          >
            <span key={`i-${s.fokus}`} className="panggung__info mono panggung__pudar">
              {aktif.musik ? aktif.ringkas[locale] : `${tr(`jenis.${aktif.jenis}`)}, ${aktif.periode}, ${tr(`status.${aktif.status}`)}`}
            </span>
            <span key={`n-${s.fokus}`} className="panggung__nama panggung__pudar">{aktif.judul[locale]}</span>
          </button>
          {s.keadaan === "rak" && s.terbalik && <p className="panggung__ringkas">{aktif.ringkas[locale]}</p>}
        </div>

        <div className="panggung__pasangan panggung__pasangan--kanan">
          {s.keadaan === "rak" && (
            <button type="button" className="panggung__sudut" onClick={() => a?.geser(1)} disabled={s.fokus === proyek.length - 1} aria-label={tr("berikutnya")}>
              →
            </button>
          )}
          {s.keadaan === "buka" && (
            <button type="button" className="panggung__sudut" onClick={() => a?.dengarkan()}>
              {t("putarCakram")}
            </button>
          )}
          {s.keadaan === "buklet" && (
            <button type="button" className="panggung__sudut" onClick={() => a?.halaman(1)} aria-label={t("halamanBerikutnya")}>
              →
            </button>
          )}
          {s.keadaan === "putar" && aktif.tautan?.situs && (
            <a className="panggung__sudut" href={aktif.tautan.situs} target="_blank" rel="noopener noreferrer">
              {t("bukaTab")} <PiArrowUpRightBold aria-hidden="true" />
            </a>
          )}
        </div>
      </footer>

      {s.keadaan === "putar" && s.duduk && !cdMusik && <Hologram p={aktif} sumur={sumur} jalan={s.jalan} />}

      <p className="sr-only" aria-live="polite">
        {`${aktif.katalog} ${aktif.judul[locale]}, ${t(`keadaan.${s.keadaan}`)}`}
      </p>

      {panel && (
        <div className="panggung__panel" role="dialog" aria-modal="true" aria-label={t(panel)}>
          <button type="button" className="panggung__sudut panggung__tutup-panel" onClick={() => setPanel(null)} autoFocus>
            <PiXBold aria-hidden="true" /> {t("tutup")}
          </button>
          {panel === "tentang" ? (
            <div className="panggung__tentang">
              <p className="mono">{tg("peran")}</p>
              <h2>{tg("headline")}</h2>
              <p className="panggung__tentang-aksi">
                <a className="tombol tombol--utama" href={situs.cv} download>
                  {tg("unduhCV")}
                </a>
                <button type="button" className="tombol" onClick={() => setPanel("kontak")}>
                  {tg("hubungi")}
                </button>
              </p>
            </div>
          ) : (
            <Contact />
          )}
        </div>
      )}

      <div ref={gelembung} className="gelembung" data-ada="0" aria-hidden="true" />
    </div>
  );
}

function bacaHash(a, dariLuar = false) {
  const [, slug, aksi] = location.hash.split("/");
  const i = proyek.findIndex((p) => p.slug === slug);
  if (i < 0) return;
  if (dariLuar && a.keadaan !== "rak") a.tutup();
  if (dariLuar) a.fokus(i);
  else a.lompat(i);
  if (aksi === "buka" || aksi === "putar" || aksi === "buklet") {
    a.buka(slug);
    if (aksi === "putar") setTimeout(() => a.dengarkan(), 1200);
    if (aksi === "buklet") setTimeout(() => a.bukaBuklet(), 1200);
  }
}
