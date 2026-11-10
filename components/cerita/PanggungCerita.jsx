"use client";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PiLockSimpleBold, PiWifiSlashBold } from "react-icons/pi";
import { cariProyek } from "@/content/proyek";
import { buatDunia } from "./dunia";
import { keadaanPada, progresDari } from "./naskah";
import { CATATAN } from "./Benda";

// Panggung menempel di belakang bab (mode Imersif): kanvas dunia 3D plus lapisan DOM kecil
// (tirai portal, butir sinyal hilang, label lapisan, liner notes). Progres dibaca dari blok
// babak `[data-babak]`, dihaluskan sedikit, lalu dunia digambar hanya saat ada yang berubah.
const LAPISAN = ["tutup", "buklet", "cakram", "nampan"];

export default function PanggungCerita({ akar }) {
  const t = useTranslations("cerita");
  const locale = useLocale();
  const panggung = useRef(null);
  const wadah = useRef(null);
  const label = useRef({});

  useEffect(() => {
    const seksi = akar.current;
    const el = panggung.current;
    if (!seksi || !el) return;
    gsap.registerPlugin(ScrollTrigger);
    const dunia = buatDunia(wadah.current, { proyek: cariProyek("coderoach-os"), locale });

    let blok = [];
    const ukurBlok = () => {
      blok = [...seksi.querySelectorAll("[data-babak]")].map((b) => {
        const r = b.getBoundingClientRect();
        return { atas: r.top + window.scrollY, tinggi: r.height };
      });
    };
    ukurBlok();
    let tujuan = progresDari(window.scrollY + innerHeight / 2, blok);
    let p = tujuan;
    let terlihat = false;
    let kotor = true;
    let penunjuk = null;

    const pemicu = ScrollTrigger.create({
      trigger: seksi,
      start: "top bottom",
      end: "bottom top",
      onToggle: (st) => {
        terlihat = st.isActive;
        kotor = true;
      },
      onUpdate: () => {
        tujuan = progresDari(window.scrollY + innerHeight / 2, blok);
      },
      onRefresh: () => {
        ukurBlok();
        tujuan = progresDari(window.scrollY + innerHeight / 2, blok);
        kotor = true;
      },
    });
    terlihat = pemicu.isActive;

    const gerakPenunjuk = (e) => {
      penunjuk = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 };
      kotor = true;
    };
    window.addEventListener("pointermove", gerakPenunjuk, { passive: true });

    let waktuLalu = performance.now();
    const detak = () => {
      const kini = performance.now();
      const dt = Math.min(0.05, (kini - waktuLalu) / 1000);
      waktuLalu = kini;
      if (!terlihat) return;
      const beda = tujuan - p;
      p = Math.abs(beda) < 1e-4 ? tujuan : p + beda * (1 - Math.exp(-7 * dt));
      const s = keadaanPada(p);
      const hidup = s.putaran > 0.01 || s.perangkat > 0.3 || s.uv > 0.01 || s.tumpuk > 0.01 || s.sinyal > 0.01;
      if (!kotor && Math.abs(beda) < 1e-4 && !hidup) return;
      kotor = false;
      const titik = dunia.gambar(s, kini, s.uv > 0.01 ? penunjuk : null);
      el.style.setProperty("--iris", s.iris.toFixed(3));
      el.style.setProperty("--sisi", s.sisi.toFixed(3));
      el.style.setProperty("--sinyal", s.sinyal.toFixed(3));
      el.style.setProperty("--ruang", s.ruang.toFixed(3));
      el.style.setProperty("--uv", s.uv.toFixed(3));
      el.style.setProperty("--buklet", s.buklet.toFixed(3));
      el.style.setProperty("--urai", s.urai.toFixed(3));
      for (const nama of LAPISAN) {
        const node = label.current[nama];
        const q = titik[nama];
        if (!node) continue;
        if (q) node.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
      }
    };
    gsap.ticker.add(detak);

    // Gambar dan font yang dimuat belakangan menggeser tinggi blok.
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(seksi);

    return () => {
      gsap.ticker.remove(detak);
      window.removeEventListener("pointermove", gerakPenunjuk);
      pemicu.kill();
      ro.disconnect();
      dunia.hapus();
    };
  }, [akar, locale]);

  return (
    <div ref={panggung} className="panggung-cerita" aria-hidden="true">
      <div ref={wadah} className="panggung-cerita__kanvas" />
      <div className="panggung-cerita__iris" />
      <div className="panggung-cerita__butir" />
      <div className="panggung-cerita__sinyal">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
        <PiWifiSlashBold />
      </div>
      <div className="panggung-cerita__gembok">
        <PiLockSimpleBold />
      </div>
      <div className="panggung-cerita__catatan mono">
        <span className="panggung-cerita__catatan-kepala">Liner notes</span>
        {CATATAN.map(([a, b], i) => (
          <span key={a} className="panggung-cerita__baris" style={{ "--i": i }}>
            <span>{a}</span>
            <span>{b}</span>
          </span>
        ))}
      </div>
      {LAPISAN.map((nama) => (
        <span key={nama} ref={(n) => (label.current[nama] = n)} className="panggung-cerita__label mono">
          {t(`lapisan.${nama}`)}
        </span>
      ))}
    </div>
  );
}
