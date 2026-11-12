"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useMode } from "@/components/mode/ModeProvider";
import { anchorAktif, pemicuAnchor } from "./naskah";
import { gabungProgres, kejar, faseLoader, gambarUlar, PUDAR } from "./ular";
import "./dunia.css";

const akar = () => document.documentElement;
const temaSitus = () => (akar().dataset.theme === "light" ? "terang" : "gelap");
// Bila dunia belum siap setelah sekian detik, loader minggir dan halaman tetap bisa dibaca.
const BATAS_MUAT = 20000;

// Dunia toko kaset di belakang beranda (ADR 0014), hanya di mode Imersif. Teks seksi tetap HTML
// hasil server di atas kanvas; komponen ini hanya menambah kanvas, loader ular, dan kamera.
export default function Dunia() {
  const { mode } = useMode();
  if (mode !== "imersif") return <LepasTirai mode={mode} />;
  return <DuniaImersif />;
}

// Mode Ringan (atau tanpa WebGL2): tirai pra-gambar dilepas, halaman tampil biasa.
function LepasTirai({ mode }) {
  useEffect(() => {
    if (mode) akar().removeAttribute("data-dunia");
  }, [mode]);
  return null;
}

function DuniaImersif() {
  const t = useTranslations("dunia");
  const wadah = useRef(null);
  const loader = useRef(null);
  const kanvasUlar = useRef(null);
  const persen = useRef(null);

  useEffect(() => {
    const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let batal = false;
    let d = null;
    const keadaan = { modul: false, aset: [], hangat: 0, gagal: false, siap: false };
    if (!akar().dataset.dunia) akar().setAttribute("data-dunia", "muat");

    // ---- Loader ular --------------------------------------------------------------------
    const kv = kanvasUlar.current;
    const g = kv.getContext("2d");
    let tampil = 0;
    let tSiap = null;
    let raf = 0;
    let mulai = performance.now();
    let lalu = mulai;
    let gambarPertama = true;
    const ukurUlar = () => {
      const r = Math.min(devicePixelRatio || 1, 2);
      kv.width = Math.round(innerWidth * r);
      kv.height = Math.round(innerHeight * r);
      g.setTransform(r, 0, 0, r, 0, 0);
    };
    ukurUlar();
    addEventListener("resize", ukurUlar);
    const habisWaktu = setTimeout(() => (keadaan.gagal = true), BATAS_MUAT);

    const selesai = () => {
      cancelAnimationFrame(raf);
      loader.current?.setAttribute("hidden", "");
      akar().setAttribute("data-dunia", keadaan.gagal && !keadaan.siap ? "gagal" : "siap");
    };

    const putar = (now) => {
      const dt = (now - lalu) / 1000;
      lalu = now;
      const waktu = (now - mulai) / 1000;
      const nyata = gabungProgres(keadaan);
      tampil = kejar(tampil, nyata, dt);
      if (persen.current) {
        const n = Math.floor(tampil * 100);
        persen.current.textContent = `${n}%`;
        persen.current.setAttribute("aria-valuenow", String(n));
      }
      if (tSiap == null && ((tampil >= 1 && keadaan.siap) || keadaan.gagal)) tSiap = waktu;
      // Dunia gagal atau terlalu lama: loader memudar tanpa terkam.
      const fase = faseLoader(tSiap == null ? null : waktu - tSiap, kurangiGerak || keadaan.gagal);
      if (fase.nama === "selesai") return selesai();
      if (fase.nama === "pudar") loader.current.style.opacity = String(1 - fase.u);
      else gambarUlar(g, innerWidth, innerHeight, waktu, { tSiap, progres: tampil, diam: kurangiGerak });
      if (fase.nama !== "muat") akar().setAttribute("data-dunia", "portal");
      if (gambarPertama) {
        gambarPertama = false;
        // Kanvas loader sudah menggambar layarnya sendiri: tirai CSS pra-gambar dilepas.
        if (akar().dataset.dunia === "muat") akar().setAttribute("data-dunia", "ular");
      }
      raf = requestAnimationFrame(putar);
    };
    raf = requestAnimationFrame(putar);

    // ---- Dunia --------------------------------------------------------------------------
    const ukurSeksi = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { atas: r.top + scrollY, tinggi: r.height };
    };
    let titik = [];
    const hitungTitik = () => {
      titik = pemicuAnchor(ukurSeksi);
      // Dicatat di elemen supaya bisa diperiksa dari luar (skrip ukur, devtools).
      wadah.current.dataset.titik = titik.map((x) => `${x.id}:${Math.round(x.y)}`).join(" ");
    };

    let anchorKini = -1;
    let pindah = 0;
    const saatGulir = () => {
      if (!d || !titik.length) return;
      const y = scrollY;
      const i = anchorAktif(y, innerHeight, titik);
      if (i !== anchorKini) {
        anchorKini = i;
        wadah.current.dataset.anchor = titik[i].id;
        if (kurangiGerak) {
          // Gerak dikurangi: potong langsung di balik crossfade singkat, tanpa terbang.
          wadah.current.style.opacity = "0";
          clearTimeout(pindah);
          pindah = setTimeout(() => {
            d?.keAnchor(i);
            if (wadah.current) wadah.current.style.opacity = "1";
          }, 160);
        } else d.keAnchor(i);
      }
      const awal = titik[i].y;
      const akhir = titik[i + 1]?.y ?? document.documentElement.scrollHeight;
      d.setGeser((y + innerHeight / 2 - awal) / Math.max(1, akhir - awal) - 0.5);
      // Panggung cerita yang menutupi layar penuh: dunia tidak perlu digambar di belakangnya.
      const pc = document.querySelector(".panggung-cerita");
      const r = pc?.getBoundingClientRect();
      d.setTerlihat(!(r && r.top <= 64 && r.bottom >= innerHeight - 1 && getComputedStyle(pc).opacity === "1"));
    };

    const ro = new ResizeObserver(() => {
      hitungTitik();
      saatGulir();
    });
    const tema = new MutationObserver(() => d?.setTema(temaSitus()));

    (async () => {
      try {
        const { buatDunia } = await import("./dunia");
        if (batal) return;
        keadaan.modul = true;
        // Tanda waktu tiap tahap, dibaca skrip ukur (scripts/ukur-dunia.mjs).
        performance.mark("dunia:modul");
        d = buatDunia(wadah.current, {
          kurangiGerak,
          tema: temaSitus(),
          onProgres: ({ aset }) => (keadaan.aset = aset),
        });
        performance.mark("dunia:dibuat");
        await d.muat();
        performance.mark("dunia:termuat");
        if (batal) return;
        hitungTitik();
        anchorKini = anchorAktif(scrollY, innerHeight, titik);
        d.keAnchor(anchorKini);
        await d.siapkan((h) => (keadaan.hangat = h));
        if (batal) return;
        performance.mark("dunia:hangat");
        keadaan.siap = true;
        ro.observe(document.body);
        tema.observe(akar(), { attributes: true, attributeFilter: ["data-theme"] });
        addEventListener("scroll", saatGulir, { passive: true });
        saatGulir();
      } catch (e) {
        // WebGL gagal dibuat atau aset tidak termuat: halaman tetap utuh tanpa dunia.
        console.error(e);
        keadaan.gagal = true;
      }
    })();

    return () => {
      batal = true;
      cancelAnimationFrame(raf);
      clearTimeout(habisWaktu);
      clearTimeout(pindah);
      removeEventListener("resize", ukurUlar);
      removeEventListener("scroll", saatGulir);
      ro.disconnect();
      tema.disconnect();
      d?.dispose();
      akar().removeAttribute("data-dunia");
    };
  }, []);

  // Dipasang langsung di <body>, di luar <main>, supaya loader berada di atas bilah dan pemutar
  // musik, dan kanvas berada di belakang seluruh isi halaman.
  return createPortal(
    <>
      <div ref={wadah} className="dunia" aria-hidden="true" />
      <div ref={loader} className="dunia-ular" style={{ "--pudar": `${PUDAR}s` }}>
        <canvas ref={kanvasUlar} className="dunia-ular__kanvas" aria-hidden="true" />
        <p ref={persen} className="dunia-ular__persen mono" role="progressbar" aria-label={t("memuat")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
          0%
        </p>
      </div>
    </>,
    document.body,
  );
}
