"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { teknologiDari } from "./teknologi";
import "./arsitektur.css";

// Diagram alur yang hidup: langkah-langkah satu permintaan sebagai simpul, paket cahaya
// yang mengalir di sepanjang garis, dan langkah yang sedang dibaca menyala. Menggulir
// teks di sebelahnya memajukan langkah; mengklik simpul membawa teks ke langkahnya.
// Dengan reduced-motion paket dan garis berjalan dimatikan, sorotan tetap berpindah.
export default function JelajahArsitektur({ p }) {
  const t = useTranslations("arsitektur");
  const locale = useLocale();
  const alur = p.arsitektur.alur;
  const [aktif, setAktif] = useState(0);
  const [ukuran, setUkuran] = useState({ w: 0, h: 0 });
  const [diam, setDiam] = useState(false);
  const wadah = useRef(null);
  const simpul = useRef([]);
  const langkah = useRef([]);
  const [titik, setTitik] = useState([]);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const atur = () => setDiam(mq.matches);
    atur();
    mq.addEventListener("change", atur);
    return () => mq.removeEventListener("change", atur);
  }, []);

  // Posisi simpul diukur dari HTML-nya, jadi garis selalu menempel walau tata letak berubah.
  useLayoutEffect(() => {
    const el = wadah.current;
    if (!el) return;
    const ukur = () => {
      const r = el.getBoundingClientRect();
      setUkuran({ w: r.width, h: r.height });
      setTitik(
        simpul.current.map((n) => {
          const b = n?.querySelector(".diagram__bulat")?.getBoundingClientRect();
          return b ? { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2, r: b.width / 2 } : null;
        }),
      );
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(el);
    return () => ro.disconnect();
  }, [alur.length]);

  // Langkah yang paling dekat ke tengah layar menjadi langkah aktif.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setAktif(Number(e.target.dataset.i));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    langkah.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [alur.length]);

  const keLangkah = (i) => {
    setAktif(i);
    langkah.current[i]?.scrollIntoView({ behavior: diam ? "auto" : "smooth", block: "center" });
  };

  const jalur = titik.slice(1).map((b, i) => {
    const a = titik[i];
    if (!a || !b) return null;
    const x1 = a.x + a.r + 4;
    const x2 = b.x - b.r - 4;
    const tengah = (x1 + x2) / 2;
    return `M ${x1} ${a.y} C ${tengah} ${a.y}, ${tengah} ${b.y}, ${x2} ${b.y}`;
  });

  return (
    <div className="jelajah">
      <div className="jelajah__panggung">
        <figure className={`diagram ${diam ? "diagram--diam" : ""}`} ref={wadah} aria-label={t("diagram")}>
          <svg className="diagram__garis" width={ukuran.w} height={ukuran.h} aria-hidden="true">
            {jalur.map((d, i) =>
              d ? (
                <g key={i} className={`diagram__ruas ${i < aktif ? "diagram__ruas--lewat" : ""}`}>
                  <path id={`ruas-${p.slug}-${i}`} d={d} className="diagram__jejak" />
                  <path d={d} className="diagram__arus" />
                  {!diam && (
                    <circle r={i === aktif - 1 ? 4.5 : 3} className={`diagram__paket ${i === aktif - 1 ? "diagram__paket--aktif" : ""}`}>
                      <animateMotion dur={i === aktif - 1 ? "1.1s" : "2.6s"} begin={`${i * 0.35}s`} repeatCount="indefinite">
                        <mpath href={`#ruas-${p.slug}-${i}`} />
                      </animateMotion>
                    </circle>
                  )}
                </g>
              ) : null,
            )}
          </svg>
          <ol className="diagram__simpul">
            {alur.map((l, i) => {
              const tek = teknologiDari(l.teknologi);
              const Utama = tek[0]?.Ikon;
              return (
                <li key={i} ref={(el) => (simpul.current[i] = el)} className={i === aktif ? "aktif" : i < aktif ? "lewat" : ""}>
                  <button type="button" onClick={() => keLangkah(i)} aria-current={i === aktif ? "step" : undefined}>
                    <span className="diagram__bulat">{Utama && <Utama aria-hidden="true" />}</span>
                    <span className="diagram__nomor mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="diagram__label">{l.judul[locale]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </figure>
      </div>

      <ol className="jelajah__langkah">
        {alur.map((l, i) => (
          <li key={i} ref={(el) => (langkah.current[i] = el)} data-i={i} className={i === aktif ? "aktif" : ""}>
            <span className="cerita__nomor mono" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="jelajah__judul">{l.judul[locale]}</h2>
            <p className="cerita__rincian">{l.rincian[locale]}</p>
            <ul className="cerita__tek" aria-label={t("dipakai")}>
              {teknologiDari(l.teknologi).map(({ kunci, nama, Ikon }) => (
                <li key={kunci}>
                  <Ikon aria-hidden="true" /> {nama[locale]}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
