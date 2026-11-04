"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PiDesktopBold, PiDeviceMobileBold, PiScanBold } from "react-icons/pi";
import SinarX from "@/components/sinarx/SinarX";

// Layar proyeksi picture-in-picture. Situs yang mengizinkan farrez.vercel.app
// (`tanam: true`) tampil langsung di iframe dan bisa dipakai; selain itu
// tangkapan layar atau sampul. Sinar-x menyibak arsitektur di baliknya.
export default function Layar({ p, lensa }) {
  const t = useTranslations("panggung.layar");
  const [perangkat, setPerangkat] = useState("desktop");
  const [sinar, setSinar] = useState(!p.tautan.situs);

  const bingkai = useRef(null);
  const [kotak, setKotak] = useState(null);
  useEffect(() => {
    const el = bingkai.current;
    const induk = el?.closest(".panggung");
    if (!el || !induk) return;
    const ukur = () => {
      const a = induk.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setKotak({ W: a.width, H: a.height, x: r.left - a.left, y: r.top - a.top, h: r.height });
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(el);
    ro.observe(induk);
    return () => ro.disconnect();
  }, []);

  const langsung = p.tanam && p.tautan.situs && !sinar;
  const gambar = p.layar?.[perangkat] ?? null;

  return (
    <div className="layar" data-perangkat={perangkat}>
      {lensa && kotak && (
        <svg className="layar__sinar" aria-hidden="true" viewBox={`0 0 ${kotak.W} ${kotak.H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="sinar-gradasi" gradientUnits="userSpaceOnUse" x1={lensa.x * kotak.W} y1="0" x2={kotak.x} y2="0">
              <stop offset="0" stopColor="#fff3d9" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff3d9" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <polygon
            points={`${lensa.x * kotak.W},${lensa.y * kotak.H} ${kotak.x},${kotak.y} ${kotak.x},${kotak.y + kotak.h}`}
            fill="url(#sinar-gradasi)"
          />
        </svg>
      )}
      <div className="layar__bingkai" ref={bingkai}>
        <div className="layar__alat" role="toolbar" aria-label={t("tampilan")}>
          <button type="button" aria-pressed={perangkat === "desktop" && !sinar} onClick={() => { setPerangkat("desktop"); setSinar(false); }} disabled={!p.tautan.situs && !p.layar}>
            <PiDesktopBold aria-hidden="true" /> {t("desktop")}
          </button>
          <button type="button" aria-pressed={perangkat === "hp" && !sinar} onClick={() => { setPerangkat("hp"); setSinar(false); }} disabled={!p.tautan.situs && !p.layar}>
            <PiDeviceMobileBold aria-hidden="true" /> {t("hp")}
          </button>
          {p.arsitektur && (
            <button type="button" aria-pressed={sinar} onClick={() => setSinar(!sinar)}>
              <PiScanBold aria-hidden="true" /> {t("sinarx")}
            </button>
          )}
        </div>
        <div className="layar__isi">
          {sinar && p.arsitektur ? (
            <SinarX arsitektur={p.arsitektur} warna={p.warna} gambar={gambar} />
          ) : langsung ? (
            <iframe
              key={perangkat}
              className="layar__frame"
              src={p.tautan.situs}
              title={p.judul.en}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : gambar ? (
            <img className="layar__gambar" src={gambar} alt="" />
          ) : (
            <div className="layar__kosong" style={{ background: p.warna }}>
              <span className="mono">{p.katalog}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
