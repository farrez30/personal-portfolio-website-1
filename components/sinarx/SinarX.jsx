"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useMode } from "@/components/mode/ModeProvider";
import { tataLetak } from "./tataLetak";
import "./sinarx.css";

const W = 640;
const KOTAK_W = 150;
const KOTAK_H = 46;
const JARAK_Y = 80;

// Lapisan bawah: diagram arsitektur (SVG, selalu ada dan terbaca).
// Lapisan atas, hanya di mode Imersif: kanvas sampul yang tersibak di bawah
// kursor lalu pelan-pelan menutup lagi, seperti cairan.
export default function SinarX({ arsitektur, warna }) {
  const t = useTranslations("album");
  const { mode } = useMode();
  const kanvas = useRef(null);
  const { simpul, garis } = arsitektur;
  const { posisi, perKolom, jumlahKolom, barisTerbanyak } = tataLetak(simpul, garis);
  const jarakX = jumlahKolom > 1 ? (W - KOTAK_W - 40) / (jumlahKolom - 1) : 0;
  const H = Math.max(200, barisTerbanyak * JARAK_Y + 60);
  const titik = (id) => {
    const p = posisi[id];
    const n = perKolom.get(p.kolom);
    const awalY = (H - n * JARAK_Y) / 2 + JARAK_Y / 2;
    const x = jumlahKolom > 1 ? 20 + KOTAK_W / 2 + p.kolom * jarakX : W / 2;
    return { x, y: awalY + p.baris * JARAK_Y };
  };
  const label = (id) => simpul.find((s) => s.id === id)?.label ?? id;
  const tutupi = mode === "imersif";

  useEffect(() => {
    if (!tutupi) return;
    const c = kanvas.current;
    if (!c) return;
    const g = c.getContext("2d");
    const kurangi = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lebar = 0;
    let tinggi = 0;

    const isi = (alpha) => {
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = alpha;
      g.fillStyle = warna;
      g.fillRect(0, 0, lebar, tinggi);
      g.globalAlpha = alpha * 0.16;
      g.strokeStyle = "#ffffff";
      g.beginPath();
      for (let y = 6; y < tinggi; y += 6) {
        g.moveTo(0, y);
        g.lineTo(lebar, y);
      }
      g.stroke();
      g.globalAlpha = 1;
    };
    const ukur = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      lebar = r.width;
      tinggi = r.height;
      c.width = lebar * dpr;
      c.height = tinggi * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      isi(1);
    };

    let terakhir = null;
    const lubang = (x, y) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, 70);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, 70, 0, Math.PI * 2);
      g.fill();
    };
    const sibak = (e) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      g.globalCompositeOperation = "destination-out";
      if (terakhir) {
        for (let i = 1; i <= 6; i++) {
          lubang(terakhir.x + ((x - terakhir.x) * i) / 6, terakhir.y + ((y - terakhir.y) * i) / 6);
        }
      } else {
        lubang(x, y);
      }
      terakhir = { x, y };
    };
    const lepas = () => {
      terakhir = null;
    };

    let raf = 0;
    const pulih = () => {
      if (!document.hidden) isi(0.03);
      raf = requestAnimationFrame(pulih);
    };

    ukur();
    if (!kurangi) raf = requestAnimationFrame(pulih);
    c.addEventListener("pointermove", sibak);
    c.addEventListener("pointerleave", lepas);
    window.addEventListener("resize", ukur);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointermove", sibak);
      c.removeEventListener("pointerleave", lepas);
      window.removeEventListener("resize", ukur);
    };
  }, [tutupi, warna]);

  return (
    <figure className="sinarx">
      <div className="sinarx__panggung">
        <svg viewBox={`0 0 ${W} ${H}`} className="sinarx__diagram" aria-hidden="true">
          {garis.map(([a, b]) => {
            const p = titik(a);
            const q = titik(b);
            return (
              <g key={`${a}-${b}`}>
                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="sinarx__garis" />
                <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="sinarx__paket" />
              </g>
            );
          })}
          {simpul.map((s) => {
            const p = titik(s.id);
            return (
              <g key={s.id} transform={`translate(${p.x - KOTAK_W / 2} ${p.y - KOTAK_H / 2})`}>
                <rect width={KOTAK_W} height={KOTAK_H} rx="6" className="sinarx__kotak" />
                <text
                  x={KOTAK_W / 2}
                  y={KOTAK_H / 2 + 4}
                  textAnchor="middle"
                  className="sinarx__teks"
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
        {tutupi && <canvas ref={kanvas} className="sinarx__sampul" aria-hidden="true" />}
      </div>
      <figcaption>
        {tutupi && <span aria-hidden="true">{t("sinarx")}</span>}
        <span className="sr-only">{t("sinarxDaftar")}</span>
        <ul className="sr-only">
          {garis.map(([a, b]) => (
            <li key={`${a}-${b}`}>
              {label(a)} {t("ke")} {label(b)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
