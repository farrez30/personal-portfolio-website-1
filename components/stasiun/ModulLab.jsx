"use client";
// Seksi proyek /v5 (F6, ADR 0024). Mode Imersif: daftar proyek HTML yang menempel di depan modul
// lab 3D dan menjadi pengendalinya. Hover atau fokus menyalakan loker padanannya, fokus keyboard
// menggulir kamera ke raknya, klik atau Enter membuka panel proyek sebagai dialog (Escape, Tutup,
// atau Back browser menutup, fokus kembali ke item daftar). Mode Ringan: kisi album biasa (Rak).
// State dibagi dengan dunia 3D lewat kendaliLab (DuniaV5 meneruskannya ke adegan.js).
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { PiXBold } from "react-icons/pi";
import { Link } from "@/i18n/navigation";
import { useIsi } from "@/components/isi/IsiProvider";
import { useMode } from "@/components/mode/ModeProvider";
import Rak from "@/components/rak/Rak";
import { kendaliLab, AWAL } from "./kendaliLab";
import { susunLab, buatRel, titikLoker, gulirDariK, alamatPanel, panelDariAlamat, BUKA } from "./lab";
import { TEKS_LAB } from "./teksLab";
import "./lab.css";

const kode = (i) => `L-${String(i + 1).padStart(2, "0")}`;

export default function ModulLab({ locale }) {
  const { mode } = useMode();
  if (mode !== "imersif") {
    return (
      <section id="modul-lab" aria-label={TEKS_LAB.judul[locale]}>
        <Rak />
      </section>
    );
  }
  return <Lorong locale={locale} />;
}

function Lorong({ locale }) {
  const t = useTranslations("rak");
  const ta = useTranslations("album");
  const { proyek } = useIsi();
  const T = (k) => TEKS_LAB[k][locale];
  const state = useSyncExternalStore(kendaliLab.dengar, kendaliLab.get, () => AWAL);
  const nyala = kendaliLab.nyala();
  const seksi = useRef(null);
  const daftar = useRef(null);
  const tombol = useRef([]);
  const dialog = useRef(null);
  const kartu = useRef(null);
  const [umum, setUmum] = useState("");
  const susunan = useMemo(() => susunLab(proyek), [proyek]);
  const n = susunan.loker.length;
  const p = state.buka >= 0 ? proyek[state.buka] : null;

  const kurangiGerak = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tegak = () => innerWidth / innerHeight < 0.8;

  // Gulir halaman sampai kamera di rak loker ke-i (dipakai saat fokus keyboard).
  const keLoker = useCallback(
    (i) => {
      const el = seksi.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const k = titikLoker(buatRel(susunan.rak.length, tegak()), n)[i];
      const y = gulirDariK(k, innerHeight, r.top + scrollY, r.height);
      if (Math.abs(y - scrollY) > 4) scrollTo({ top: y, behavior: kurangiGerak() ? "auto" : "smooth" });
    },
    [susunan, n],
  );

  // Loker yang belum terlihat: kamera langsung ke raknya dulu (gulir seketika), baru mendekat.
  const gulirKeLoker = useCallback(
    (i) => {
      const el = seksi.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const k = titikLoker(buatRel(susunan.rak.length, tegak()), n)[i];
      const y = gulirDariK(k, innerHeight, r.top + scrollY, r.height);
      if (Math.abs(y - scrollY) > innerHeight * 0.35) scrollTo({ top: y, behavior: "auto" });
    },
    [susunan, n],
  );
  const umumkan = (i) => setUmum(`${kode(i)} ${T("dibuka")}: ${proyek[i].judul[locale]}`);
  // Panel punya alamat sendiri (?proyek=<slug>). Membuka dari daftar menambah satu entri riwayat;
  // Berikutnya menggantinya, jadi Back tetap langsung menutup panel.
  const bukaPanel = (i, ganti = false) => {
    if (!ganti) gulirKeLoker(i);
    kendaliLab.set({ buka: i });
    const st = { ...history.state, panelLab: proyek[i].slug };
    if (ganti) history.replaceState(st, "", alamatPanel(location.href, proyek[i].slug));
    else history.pushState(st, "", alamatPanel(location.href, proyek[i].slug));
    umumkan(i);
  };
  const tutupPanel = useCallback(() => {
    if (kendaliLab.get().buka < 0) return;
    if (history.state?.panelLab) history.back();
    else {
      // dibuka dari tautan langsung: tidak ada entri riwayat milik panel untuk dimundurkan
      history.replaceState({ ...history.state, panelLab: undefined }, "", alamatPanel(location.href, null));
      kendaliLab.set({ buka: -1 });
    }
  }, []);

  // Back dan Forward browser mengikuti alamat: panel ditutup atau dibuka lagi.
  useEffect(() => {
    const saatPop = () => {
      const i = panelDariAlamat(location.href, proyek);
      if (i !== kendaliLab.get().buka) kendaliLab.set({ buka: i });
      if (i >= 0) umumkan(i);
    };
    addEventListener("popstate", saatPop);
    // dibuka lewat tautan ?proyek=<slug>
    const i = panelDariAlamat(location.href, proyek);
    if (i >= 0) {
      gulirKeLoker(i);
      kendaliLab.set({ buka: i });
      umumkan(i);
    }
    return () => removeEventListener("popstate", saatPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyek]);

  // Dialog bawaan: fokus masuk dan terkunci, Escape lewat onCancel. Saat ditutup fokus kembali ke
  // item daftar yang membukanya.
  const terakhir = useRef(-1);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (p && !d.open) {
      terakhir.current = state.buka;
      d.showModal();
    }
    if (!p && d.open) {
      d.close();
      tombol.current[terakhir.current]?.focus({ preventScroll: true });
      setUmum("");
    }
  }, [p, state.buka]);

  // Kartu tumbuh dari posisi loker yang meluncur (layar dari adegan.js), sesudah kamera mendekat.
  useLayoutEffect(() => {
    const k = kartu.current;
    if (!p || !k) return;
    const asal = kendaliLab.layarLoker?.(state.buka);
    const r = k.getBoundingClientRect();
    const dx = asal ? asal.x - (r.left + r.width / 2) : 0;
    const dy = asal ? asal.y - (r.top + r.height / 2) : 0;
    k.style.setProperty("--dx", `${dx}px`);
    k.style.setProperty("--dy", `${dy}px`);
    // pada dialog, supaya ::backdrop ikut menunggu
    dialog.current?.style.setProperty("--tunda", asal && !kurangiGerak() ? `${BUKA.kartu}s` : "0s");
  }, [p, state.buka]);

  // Di HP daftar menggulir sendiri: item yang menyala karena gulir tetap terlihat di dalamnya.
  useEffect(() => {
    const ol = daftar.current;
    const li = ol?.children[nyala];
    if (!li || state.fokus >= 0 || state.hover >= 0) return;
    if (li.offsetTop < ol.scrollTop || li.offsetTop + li.offsetHeight > ol.scrollTop + ol.clientHeight) ol.scrollTo({ top: li.offsetTop - ol.clientHeight / 2 + li.offsetHeight / 2 });
  }, [nyala, state.fokus, state.hover]);

  // Keluar dari seksi: hover dan fokus dilepas supaya loker kembali mengikuti gulir.
  useEffect(() => () => kendaliLab.set({ ...AWAL, jeda: kendaliLab.get().jeda, dunia: kendaliLab.get().dunia }), []);

  const saatFokus = (e, i) => {
    kendaliLab.set({ fokus: i });
    if (e.target.matches(":focus-visible")) keLoker(i);
  };
  const ikat = (i) => ({
    onFocus: (e) => saatFokus(e, i),
    onBlur: () => kendaliLab.set({ fokus: -1 }),
    onPointerEnter: () => kendaliLab.set({ hover: i }),
    onPointerLeave: () => kendaliLab.set({ hover: -1 }),
  });

  return (
    <section ref={seksi} id="modul-lab" className="modul-lab" aria-labelledby="modul-lab-judul" style={{ "--bobot": 1 + 0.4 * susunan.rak.length }}>
      <div className="modul-lab__kendali">
        <h2 id="modul-lab-judul" className="modul-lab__judul">
          {T("judul")}
        </h2>
        <ol ref={daftar} className="modul-lab__daftar">
          {proyek.map((x, i) => (
            <li key={x.slug} data-nyala={nyala === i ? "" : undefined}>
              <button ref={(el) => (tombol.current[i] = el)} type="button" className="modul-lab__item" aria-haspopup="dialog" onClick={() => bukaPanel(i)} {...ikat(i)}>
                <span className="mono modul-lab__kode">{kode(i)}</span>
                <span className="modul-lab__nama">{x.judul[locale]}</span>
              </button>
            </li>
          ))}
          <li data-nyala={nyala === n - 1 ? "" : undefined}>
            <a href="#kontak" className="modul-lab__item modul-lab__item--kontak" {...ikat(n - 1)}>
              <span className="mono modul-lab__kode">{kode(n - 1)}</span>
              <span className="modul-lab__nama">{T("kontak")}</span>
            </a>
          </li>
        </ol>
      </div>

      <dialog
        ref={dialog}
        className="modul-lab__panel"
        aria-labelledby="modul-lab-panel-judul"
        onCancel={(e) => {
          e.preventDefault();
          tutupPanel();
        }}
        onClick={(e) => e.target === dialog.current && tutupPanel()}
      >
        {p && (
          <div ref={kartu} className="modul-lab__kartu">
            <button type="button" className="tema modul-lab__tutup" onClick={tutupPanel} aria-label={ta("tutup")}>
              <PiXBold aria-hidden="true" />
            </button>
            <p className="mono modul-lab__kode">{kode(state.buka)}</p>
            <h3 id="modul-lab-panel-judul" className="modul-lab__panel-judul">
              {p.judul[locale]}
            </h3>
            <p className="mono modul-lab__meta">
              {t(`jenis.${p.jenis}`)}, {t(`status.${p.status}`)}, {p.periode}
            </p>
            {p.ilustrasi && <img className="modul-lab__gambar" src={p.ilustrasi} alt="" width="640" height="360" loading="lazy" decoding="async" />}
            <p className="modul-lab__ringkas">{p.ringkas[locale]}</p>
            <div className="modul-lab__aksi">
              <Link className="modul-lab__lengkap" href={`/proyek/${p.slug}`}>
                {T("lengkap")}
              </Link>
              <button type="button" className="modul-lab__berikutnya" onClick={() => bukaPanel((state.buka + 1) % proyek.length, true)}>
                {T("berikutnya")}
              </button>
            </div>
          </div>
        )}
        {/* di dalam dialog: di luar dialog modal, isi halaman inert dan pengumumannya bisa tidak dibacakan */}
        <p className="sr-only" aria-live="polite">
          {umum}
        </p>
      </dialog>
    </section>
  );
}
