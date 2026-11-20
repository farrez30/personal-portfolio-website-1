"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { useMode } from "@/components/mode/ModeProvider";
import { anchorAktif } from "@/components/dunia/naskah";
import { ANCHOR_V5, pemicuAnchorV5 } from "./naskah";
import "./stasiun.css";

// Dunia 3D cerita v5 di belakang seksi /v5 (ADR 0026), hanya di mode Imersif; mode Ringan tetap
// HTML biasa. Polanya sama dengan components/dunia/Dunia.jsx: teks babak tetap HTML hasil server,
// kanvas aria-hidden di belakangnya, gulir memilih anchor dan kamera berpindah dalam waktu.
// Sekali dibuat, dunia tetap di memori saat pindah ke Ringan: hanya disembunyikan.
export default function DuniaV5() {
  const { mode } = useMode();
  const [pernah, setPernah] = useState(false);
  useEffect(() => {
    if (mode === "imersif") setPernah(true);
  }, [mode]);
  // Tata letak babak bergulir (teks menempel di kiri atau di bawah) hanya saat dunianya tampil.
  useEffect(() => {
    document.getElementById("cerita")?.classList.toggle("cerita-kerja--dunia", mode === "imersif");
  }, [mode]);
  if (!pernah) return null;
  return <DuniaImersif aktif={mode === "imersif"} />;
}

function DuniaImersif({ aktif }) {
  const bahasa = useLocale();
  const wadah = useRef(null);
  const kontrol = useRef(null);
  useEffect(() => kontrol.current?.(aktif), [aktif]);

  useEffect(() => {
    const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const uji = location.search.includes("uji-stasiun");
    let batal = false;
    let d = null;
    let aktifMode = true;
    let titik = [];
    let anchorKini = -1;

    const ukurSeksi = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { atas: r.top + scrollY, tinggi: r.height };
    };
    const hitungTitik = () => {
      titik = pemicuAnchorV5(ukurSeksi);
      wadah.current.dataset.titik = titik.map((x) => `${x.id}:${Math.round(x.y)}`).join(" ");
    };
    const saatGulir = () => {
      if (!d || !titik.length || !aktifMode) return;
      const y = scrollY;
      const i = anchorAktif(y, innerHeight, titik);
      if (i !== anchorKini) {
        anchorKini = i;
        d.keAnchor(i);
        wadah.current.dataset.anchor = titik[i].id;
        // Babak yang dunianya belum dibangun (kota, peta, globe, modul lab): kanvas memudar.
        wadah.current.toggleAttribute("data-kosong", !ANCHOR_V5[i].pose);
      }
      const awal = titik[i].y;
      const akhir = titik[i + 1]?.y ?? document.documentElement.scrollHeight;
      d.setGeser((y + innerHeight / 2 - awal) / Math.max(1, akhir - awal));
    };

    kontrol.current = (v) => {
      aktifMode = v;
      wadah.current?.toggleAttribute("hidden", !v);
      d?.setTerlihat(v);
      if (v && d) {
        hitungTitik();
        anchorKini = -1;
        saatGulir();
      }
    };

    const ro = new ResizeObserver(() => {
      hitungTitik();
      saatGulir();
    });

    (async () => {
      try {
        const { buatDuniaV5 } = await import("./adegan");
        if (batal) return;
        performance.mark("stasiun:modul");
        d = buatDuniaV5(wadah.current, { kurangiGerak, bahasa, uji });
        hitungTitik();
        anchorKini = anchorAktif(scrollY, innerHeight, titik);
        d.keAnchor(anchorKini);
        wadah.current.dataset.anchor = titik[anchorKini].id;
        wadah.current.toggleAttribute("data-kosong", !ANCHOR_V5[anchorKini].pose);
        await d.siapkan();
        if (batal) return;
        performance.mark("stasiun:siap");
        wadah.current.setAttribute("data-siap", "");
        ro.observe(document.body);
        addEventListener("scroll", saatGulir, { passive: true });
        saatGulir();
      } catch (e) {
        // WebGL gagal: halaman tetap utuh sebagai HTML biasa.
        console.error(e);
        document.getElementById("cerita")?.classList.remove("cerita-kerja--dunia");
      }
    })();

    return () => {
      batal = true;
      removeEventListener("scroll", saatGulir);
      ro.disconnect();
      d?.dispose();
    };
  }, [bahasa]);

  return createPortal(<div ref={wadah} className="stasiun" aria-hidden="true" />, document.body);
}
