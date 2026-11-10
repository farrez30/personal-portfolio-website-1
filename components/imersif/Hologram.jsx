"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { teknologiDari } from "@/components/arsitektur/teknologi";
import { demoUntuk, explainerUntuk } from "@/content/demo";
import { useLocale, useTranslations } from "next-intl";
import { PiDesktopBold, PiDeviceMobileBold, PiArrowUpRightBold, PiArrowsOutSimpleBold, PiArrowsInSimpleBold, PiPauseFill, PiPlayFill, PiSpeakerHighBold, PiSpeakerSlashBold, PiGlobeBold } from "react-icons/pi";

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
  const bolehTanam = typeof window !== "undefined" && window.location.hostname === "farrez.vercel.app";
  // Explainer bernarasi sesuai bahasa situs tampil lebih dulu; proyek yang situsnya bisa
  // dibingkai punya tombol untuk pindah ke situs langsung.
  const explainer = explainerUntuk(p.slug, locale);
  const bisaLangsung = bolehTanam && p.tanam && p.tautan.situs;
  const [pakaiSitus, setPakaiSitus] = useState(false);
  const langsung = bisaLangsung && (!explainer || pakaiSitus);
  // Tanpa situs atau tangkapan layar, layar memutar ilustrasi orang yang memakainya.
  const gambar = p.layar?.[perangkat] ?? p.ilustrasi ?? null;
  // Klip demo dipakai bila situsnya tidak bisa dibingkai di sini; gambar jadi posternya.
  const demo = langsung ? null : (explainer ?? demoUntuk(p.slug)?.[perangkat] ?? null);
  const narasi = !langsung && !!explainer;
  const video = useRef(null);
  const [bisu, setBisu] = useState(false);
  // Klip ikut Play dan Pause pemutar. Klip demo bisu dan tidak diputar sendiri bila gerak
  // dikurangi; explainer bersuara diputar karena pengunjung sendiri yang menekan Play.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = !narasi || bisu;
    if (jalan && !keluar && (narasi || !matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      // Peramban menolak suara tanpa gestur: putar bisu dan biarkan pengunjung menyalakannya.
      v.play().catch(() => {
        if (!narasi || v.muted) return;
        v.muted = true;
        setBisu(true);
        v.play().catch(() => {});
      });
    } else v.pause();
  }, [jalan, keluar, demo, narasi, bisu]);
  // Selama explainer bersuara, lagu Spotify dijeda dan lanjut lagi sesudahnya.
  const [main, setMain] = useState(false);
  const bersuara = narasi && main && !bisu;
  useEffect(() => {
    if (!bersuara) return;
    window.dispatchEvent(new CustomEvent("musik:redam", { detail: { redam: true } }));
    return () => window.dispatchEvent(new CustomEvent("musik:redam", { detail: { redam: false } }));
  }, [bersuara]);
  // Layar memuat ala terminal retro sampai isi yang sedang tampil selesai dimuat.
  // Yang dicatat adalah isi mana yang sudah siap, bukan saklar ya/tidak: kalau HP dan
  // Desktop memakai gambar yang sama, elemennya tidak dimuat ulang dan layar tetap siap.
  const isi = langsung ? `situs:${perangkat}:${p.tautan.situs}` : demo ? `demo:${demo}` : gambar ? `gambar:${gambar}` : `kosong:${p.slug}`;
  const [siapIsi, setSiapIsi] = useState(null);
  const muat = siapIsi !== isi;
  const selesai = useCallback((kunci, jeda = 700) => setTimeout(() => setSiapIsi(kunci), jeda), []);
  // Jaring pengaman: gambar gagal, situs menolak dibingkai tanpa memicu load, atau
  // event load yang terlewat tidak boleh membuat layar memuat selamanya.
  useEffect(() => {
    const t = selesai(isi, isi.startsWith("kosong:") ? 700 : 8000);
    return () => clearTimeout(t);
  }, [isi, selesai]);
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
  // Situs sendiri lebih dulu; tanpa itu, halaman case study-nya di coderoach.id.
  const tautanKeluar = p.tautan.situs ?? p.tautan.kasus;
  // Keping yang mengorbit: teknologi proyeknya, ikon dan nama.
  const potongan = p.arsitektur ? teknologiDari([...p.arsitektur.teknologi.stack, ...p.arsitektur.teknologi.infrastruktur]).slice(0, 6) : [];

  return (
    <div
      className={`holo ${jalan && !keluar ? "holo--nyala" : "holo--beku"} ${besar ? "holo--besar" : ""} ${keluar ? "holo--keluar" : ""}`}
      data-perangkat={perangkat}
      style={{ "--sx": `${sumur.x * 100}%`, "--sy": `${sumur.y * 100}%`, "--syf": sumur.y, "--sw": `${sumur.w * 100}%`, "--semut": teksturSemut() ?? "none" }}
    >
      <div className="holo__orbit" aria-hidden="true">
        {potongan.map(({ kunci, nama, Ikon }, i) => (
          <span key={kunci} className="holo__keping mono" style={{ "--i": i, "--n": potongan.length }}>
            <Ikon aria-hidden="true" /> {nama[locale]}
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
                onLoad={() => selesai(isi, 0)}
              />
            ) : demo ? (
              <video
                key={demo}
                ref={video}
                src={demo}
                poster={gambar ?? undefined}
                className={narasi ? "holo__explainer" : undefined}
                muted
                loop={!narasi}
                playsInline
                preload="metadata"
                aria-label={p.judul[locale]}
                onPlay={() => setMain(true)}
                onPause={() => setMain(false)}
                onEnded={() => setMain(false)}
                onLoadedData={() => selesai(isi)}
                onError={() => selesai(isi, 0)}
              />
            ) : gambar ? (
              <img
                key={gambar}
                src={gambar}
                alt=""
                onLoad={() => selesai(isi)}
                onError={() => selesai(isi, 0)}
              />
            ) : (
              <div className="holo__kosong" style={{ background: p.warna }}>
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
            {narasi && (
              <button type="button" aria-pressed={bisu} onClick={() => setBisu(!bisu)}>
                {bisu ? <PiSpeakerSlashBold aria-hidden="true" /> : <PiSpeakerHighBold aria-hidden="true" />} {t(bisu ? "bunyikan" : "bisukan")}
              </button>
            )}
            {bisaLangsung && explainer && (
              <button type="button" aria-pressed={pakaiSitus} onClick={() => setPakaiSitus(!pakaiSitus)}>
                <PiGlobeBold aria-hidden="true" /> {t("situsLangsung")}
              </button>
            )}
            {tautanKeluar && (
              <a href={tautanKeluar} target="_blank" rel="noopener noreferrer">
                {t(p.tautan.situs ? "bukaTab" : "caseStudy")} <PiArrowUpRightBold aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
