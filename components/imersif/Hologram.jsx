"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PiDesktopBold, PiDeviceMobileBold, PiArrowUpRightBold, PiArrowsOutSimpleBold, PiArrowsInSimpleBold, PiPauseFill, PiPlayFill } from "react-icons/pi";

// Layar hologram yang naik dari sumur pemutar. Play menyalakan proyeksi, Pause
// membekukannya, Keluarkan mematikannya. Layarnya melayang: sedikit miring
// mengikuti kursor dan naik turun pelan, dengan bingkai monitor sci-fi retro.
// Situs proyek tampil langsung hanya di farrez.vercel.app (app-nya hanya
// mengizinkan domain itu membingkai); di tempat lain memakai tangkapan layar.
// Derau "semut" layar tabung: satu tekstur 256 px dibuat sekali, lalu digeser
// lompat-lompat oleh CSS supaya terlihat hidup tanpa menggambar ulang tiap bingkai.
let semut = null;
function teksturSemut() {
  if (semut || typeof document === "undefined") return semut;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = (Math.random() * 256) | 0;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  semut = `url(${c.toDataURL("image/png")})`;
  return semut;
}

export default function Hologram({ p, sumur, jalan, keluar = false, onPutar, onPanel }) {
  const t = useTranslations("panggung.layar");
  const locale = useLocale();
  const [perangkat, setPerangkat] = useState("desktop");
  const [besar, setBesar] = useState(false);
  // Layar memuat ala terminal retro sampai isi (situs atau gambar) selesai dimuat.
  const [muat, setMuat] = useState(true);
  useEffect(() => setMuat(true), [perangkat, p.slug]);
  const panel = useRef(null);
  // Panel diserahkan ke adegan 3D supaya sorot proyektor berakhir tepat di tepinya.
  // Ref callback harus stabil; kalau tidak, React memanggilnya null lalu el tiap render.
  const lapor = useRef(onPanel);
  lapor.current = onPanel;
  const pasangPanel = useCallback((el) => {
    panel.current = el;
    lapor.current?.(el);
  }, []);
  // Saat Play ditekan, ikon putar berkedip sebentar di layar sebelum isinya kembali normal.
  const [kilas, setKilas] = useState(false);
  const jalanLalu = useRef(jalan);
  useEffect(() => {
    if (jalan && !jalanLalu.current) {
      setKilas(true);
      const t = setTimeout(() => setKilas(false), 700);
      jalanLalu.current = jalan;
      return () => clearTimeout(t);
    }
    jalanLalu.current = jalan;
  }, [jalan]);

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
  // Tanpa situs atau tangkapan layar, layar memutar ilustrasi orang yang memakainya.
  const gambar = p.layar?.[perangkat] ?? p.ilustrasi ?? null;
  const potongan = (p.arsitektur?.simpul ?? []).slice(0, 6);

  return (
    <div
      className={`holo ${jalan && !keluar ? "holo--nyala" : "holo--beku"} ${besar ? "holo--besar" : ""} ${keluar ? "holo--keluar" : ""}`}
      data-perangkat={perangkat}
      style={{ "--sx": `${sumur.x * 100}%`, "--sy": `${sumur.y * 100}%`, "--syf": sumur.y, "--sw": `${sumur.w * 100}%`, "--semut": teksturSemut() ?? "none" }}
    >
      <div className="holo__orbit" aria-hidden="true">
        {potongan.map((s, i) => (
          <span key={s.id} className="holo__keping mono" style={{ "--i": i, "--n": potongan.length }}>
            {s.label}
          </span>
        ))}
      </div>
      <div className="holo__panel" ref={pasangPanel}>
        <div className="holo__bingkai">
          <div className="holo__kepala mono" aria-hidden="true">
            <span>{p.katalog}</span>
            <span>{p.judul[locale].toUpperCase()}</span>
            <span className="holo__status">{jalan ? "LIVE" : "PAUSE"}</span>
          </div>
          <button
            type="button"
            className="holo__ukuran"
            onClick={() => setBesar(!besar)}
            aria-pressed={besar}
            aria-label={besar ? t("perkecil") : t("perbesar")}
            title={besar ? t("perkecil") : t("perbesar")}
          >
            {besar ? <PiArrowsInSimpleBold aria-hidden="true" /> : <PiArrowsOutSimpleBold aria-hidden="true" />}
          </button>
          <div className="holo__layar">
            {langsung ? (
              <iframe
                key={perangkat}
                src={p.tautan.situs}
                title={p.judul[locale]}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setMuat(false)}
              />
            ) : gambar ? (
              <img key={gambar} src={gambar} alt="" onLoad={() => setTimeout(() => setMuat(false), 700)} />
            ) : (
              <div className="holo__kosong" style={{ background: p.warna }} ref={(el) => el && setTimeout(() => setMuat(false), 700)}>
                <span className="mono">{p.katalog}</span>
                <span>{p.judul[locale]}</span>
              </div>
            )}
            <span className="holo__semut" aria-hidden="true" />
            {!jalan && !muat && (
              <button type="button" className="holo__jeda" onClick={onPutar} aria-label={t("lanjutkan")}>
                <PiPauseFill aria-hidden="true" />
                <span className="mono">{t("dijeda")}</span>
              </button>
            )}
            {kilas && (
              <div className="holo__kilas" aria-hidden="true">
                <PiPlayFill />
              </div>
            )}
            {muat && (
              <div className="holo__muat mono" role="status">
                <span>{p.katalog} // {t("memuat")}</span>
                <span className="holo__bilah" aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} style={{ "--i": i }} />
                  ))}
                </span>
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
