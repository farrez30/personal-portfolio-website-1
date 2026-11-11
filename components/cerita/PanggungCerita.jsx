"use client";
import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cariProyek } from "@/content/proyek";
import { buatDunia } from "./dunia";
import { keadaanPada, progresDari, bunyiAntara, bukit, BABAK } from "./naskah";
import { suara } from "@/components/imersif/suara";

// Kotak CD yang masuk rak di ujung cerita: proyek sungguhan dari rak.
const KOTAK = ["coderoach-os", "jeda", "akarkita"];
const iAndal = BABAK.findIndex((b) => b.id === "andal");

// Panggung menempel di belakang bab (mode Imersif): kanvas soundstage plus butir film,
// vignette, dan selubung beige yang menyerahkan layar ke seksi rak. Progres dibaca dari blok
// babak `[data-babak]`, dihaluskan sedikit, lalu dunia digambar hanya saat ada yang berubah.
export default function PanggungCerita({ akar, onGagal }) {
  const locale = useLocale();
  const panggung = useRef(null);
  const wadah = useRef(null);

  useEffect(() => {
    const seksi = akar.current;
    const el = panggung.current;
    if (!seksi || !el) return;
    // Dunia (dan 23 teksturnya) baru dibuat saat seksi tinggal satu layar lagi.
    let bongkar = null;
    const dekat = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || bongkar) return;
        dekat.disconnect();
        bongkar = mulai(seksi, el) ?? (() => {});
      },
      { rootMargin: "100% 0px" },
    );
    dekat.observe(seksi);
    return () => {
      dekat.disconnect();
      bongkar?.();
    };
  }, [akar, locale, onGagal]);

  function mulai(seksi, el) {
    gsap.registerPlugin(ScrollTrigger);
    const hp = matchMedia("(max-width: 47.99rem)").matches;
    let kotor = true;
    let dunia;
    try {
      dunia = buatDunia(wadah.current, {
        locale,
        hp,
        kotak: KOTAK.map(cariProyek).filter(Boolean),
        ubah: () => (kotor = true),
      });
    } catch {
      // WebGL tidak tersedia (driver, mode hemat daya, peramban lama): cerita pindah ke mode Ringan.
      onGagal?.();
      return;
    }

    let blok = [];
    const ukurBlok = () => {
      blok = [...seksi.querySelectorAll(".cerita-pembuka[data-babak], .bab[data-babak]")].map((b) => {
        const r = b.getBoundingClientRect();
        return { atas: r.top + window.scrollY, tinggi: r.height };
      });
      // Babak terakhir selesai saat ujung seksi menyentuh bawah layar (bukan tengahnya), jadi
      // layar sudah beige penuh sebelum panggung tergulir pergi dan rak muncul di bawahnya.
      const akhir = blok.at(-1);
      if (akhir) akhir.tinggi = Math.max(1, akhir.tinggi - innerHeight / 2);
    };
    ukurBlok();
    const tengah = () => window.scrollY + innerHeight / 2;
    let tujuan = progresDari(tengah(), blok);
    let p = tujuan;
    let terlihat = false;

    const pemicu = ScrollTrigger.create({
      trigger: seksi,
      start: "top bottom",
      end: "bottom top",
      onToggle: (st) => {
        terlihat = st.isActive;
        el.toggleAttribute("data-tampak", terlihat);
        kotor = true;
      },
      onUpdate: () => {
        tujuan = progresDari(tengah(), blok);
      },
      onRefresh: () => {
        ukurBlok();
        dunia.ukur();
        tujuan = progresDari(tengah(), blok);
        kotor = true;
      },
    });
    terlihat = pemicu.isActive;
    el.toggleAttribute("data-tampak", terlihat);

    // Suara ruangan: room tone selama cerita terlihat, dengung proyektor di bab andal, dan bunyi
    // sesaat per bab (naskah.js bunyiAntara). Mesin suaranya sama dengan rak, ikut tombol bisu.
    const s0 = suara();
    let keadaanLalu = keadaanPada(p, { hp });
    let proyektorKita = false;
    let ruangNyala = false;

    let waktuLalu = performance.now();
    const detak = () => {
      const kini = performance.now();
      const dt = Math.min(0.05, (kini - waktuLalu) / 1000);
      waktuLalu = kini;
      if (!terlihat) {
        if (ruangNyala) s0?.ruang(0);
        ruangNyala = false;
        return;
      }
      const beda = tujuan - p;
      p = Math.abs(beda) < 1e-4 ? tujuan : p + beda * (1 - Math.exp(-6 * dt));
      const s = keadaanPada(p, { hp });
      // Kamera tangan dan kotak yang sedang meluncur tetap bergerak walau gulir berhenti.
      const hidup = s.getar > 0.01 || s.kotak.some((k) => k > 0 && k < 1);
      if (!kotor && Math.abs(beda) < 1e-4 && !hidup) return;
      kotor = false;
      dunia.gambar(s, kini);
      if (s0) {
        // Dipanggil di tiap gambar: sebelum gestur pertama belum ada AudioContext, jadi lup room
        // tone baru tercipta pada gambar pertama sesudahnya.
        s0.ruang(1);
        ruangNyala = true;
        for (const nama of bunyiAntara(keadaanLalu, s)) s0.mainkan(nama);
        const dengung = s.babak === iAndal ? bukit(s.u, 0.2, 0.2) * 0.7 : 0;
        if (dengung > 0 || proyektorKita) s0.proyektor(dengung, s.sendat ? 0.2 : 1);
        proyektorKita = dengung > 0;
      }
      keadaanLalu = s;
      // Di seksi, bukan hanya panggung: teks bab ikut berganti warna saat layar memutih.
      seksi.style.setProperty("--putih", s.putih.toFixed(3));
      // Untuk QA (scripts/kontak-cerita.mjs). Bukan data-babak: selektor blok di atas akan ikut
      // menghitung panggung sebagai babak, dan kamera jadi satu bab di depan teksnya.
      el.dataset.adegan = s.babak;
      el.dataset.p = p.toFixed(3);
    };
    gsap.ticker.add(detak);

    // Gambar dan font yang dimuat belakangan menggeser tinggi blok.
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(seksi);

    return () => {
      gsap.ticker.remove(detak);
      s0?.ruang(0);
      if (proyektorKita) s0?.proyektor(0);
      pemicu.kill();
      ro.disconnect();
      dunia.hapus();
    };
  }

  return (
    <div ref={panggung} className="panggung-cerita" aria-hidden="true">
      <div ref={wadah} className="panggung-cerita__kanvas" />
      <div className="panggung-cerita__vignette" />
      <div className="panggung-cerita__butir" />
      <div className="panggung-cerita__putih" />
    </div>
  );
}
