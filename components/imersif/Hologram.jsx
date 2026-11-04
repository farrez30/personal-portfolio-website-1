"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PiDesktopBold, PiDeviceMobileBold, PiArrowUpRightBold } from "react-icons/pi";

// Layar hologram yang naik dari sumur pemutar. Play menyalakan proyeksi, Pause
// membekukannya, Keluarkan mematikannya. Layarnya melayang: sedikit miring
// mengikuti kursor dan naik turun pelan, dengan bingkai monitor sci-fi retro.
// Situs proyek tampil langsung hanya di farrez.vercel.app (app-nya hanya
// mengizinkan domain itu membingkai); di tempat lain memakai tangkapan layar.
export default function Hologram({ p, sumur, jalan }) {
  const t = useTranslations("panggung.layar");
  const locale = useLocale();
  const [perangkat, setPerangkat] = useState("desktop");
  const panel = useRef(null);

  useEffect(() => {
    const el = panel.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let ty = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    const gerak = (e) => {
      tx = (e.clientY / innerHeight - 0.5) * -8;
      ty = (e.clientX / innerWidth - 0.5) * 10;
    };
    const langkah = (now) => {
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      const bob = Math.sin(now / 900) * 6;
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--bob", `${bob.toFixed(2)}px`);
      raf = requestAnimationFrame(langkah);
    };
    addEventListener("pointermove", gerak);
    raf = requestAnimationFrame(langkah);
    return () => {
      removeEventListener("pointermove", gerak);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!sumur) return null;
  const bolehTanam = typeof window !== "undefined" && window.location.hostname === "farrez.vercel.app";
  const langsung = bolehTanam && p.tanam && p.tautan.situs;
  const gambar = p.layar?.[perangkat] ?? null;
  const potongan = (p.arsitektur?.simpul ?? []).slice(0, 6);

  return (
    <div
      className={`holo ${jalan ? "holo--nyala" : "holo--beku"}`}
      data-perangkat={perangkat}
      style={{ "--sx": `${sumur.x * 100}%`, "--sy": `${sumur.y * 100}%`, "--sw": `${sumur.w * 100}%` }}
    >
      <div className="holo__sinar" aria-hidden="true" />
      <div className="holo__orbit" aria-hidden="true">
        {potongan.map((s, i) => (
          <span key={s.id} className="holo__keping mono" style={{ "--i": i, "--n": potongan.length }}>
            {s.label}
          </span>
        ))}
      </div>
      <div className="holo__panel" ref={panel}>
        <div className="holo__bingkai">
          <div className="holo__kepala mono" aria-hidden="true">
            <span>{p.katalog}</span>
            <span>{p.judul[locale].toUpperCase()}</span>
            <span className="holo__status">{jalan ? "LIVE" : "PAUSE"}</span>
          </div>
          <div className="holo__layar">
            {langsung ? (
              <iframe
                key={perangkat}
                src={p.tautan.situs}
                title={p.judul[locale]}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : gambar ? (
              <img src={gambar} alt="" />
            ) : (
              <div className="holo__kosong" style={{ background: p.warna }}>
                <span className="mono">{p.katalog}</span>
                <span>{p.judul[locale]}</span>
              </div>
            )}
          </div>
          <div className="holo__alat" role="toolbar" aria-label={t("tampilan")}>
            <button type="button" aria-pressed={perangkat === "desktop"} onClick={() => setPerangkat("desktop")}>
              <PiDesktopBold aria-hidden="true" /> {t("desktop")}
            </button>
            <button type="button" aria-pressed={perangkat === "hp"} onClick={() => setPerangkat("hp")}>
              <PiDeviceMobileBold aria-hidden="true" /> {t("hp")}
            </button>
            {p.tautan.situs && (
              <a href={p.tautan.situs} target="_blank" rel="noopener noreferrer">
                {t("bukaTab")} <PiArrowUpRightBold aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
