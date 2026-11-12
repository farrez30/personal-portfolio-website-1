"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PiCaretLeftBold, PiCaretRightBold, PiXBold, PiArrowUpRightBold } from "react-icons/pi";
import { useMode } from "@/components/mode/ModeProvider";
import { KELOMPOK, klienKelompok, cakramDepan } from "@/content/klien";
import { bentukCincin, kemajuanSeksi } from "./cincin";
import "./klien.css";

// Seksi klien dan partner (storyboard desain/klien, v0.3): cakram cetak penuh tiap klien di
// cincin yang mekar dari tumpukan lalu berputar satu putaran selama seksi dipin. Mode Ringan,
// layar sempit, dan gerak dikurangi memakai baris atau kisi cakram biasa.
export default function Klien() {
  const t = useTranslations("klien");
  const locale = useLocale();
  const { mode } = useMode();
  const [kelompok, setKelompok] = useState("coderoach");
  const [dibuka, setDibuka] = useState(null);
  const [cincin, setCincin] = useState(false);
  const daftar = useMemo(() => klienKelompok(kelompok), [kelompok]);
  const induk = KELOMPOK.find((k) => k.slug === kelompok);
  const bahasa = (x) => x[locale] ?? x.id;

  // Cincin hanya di mode Imersif, layar cukup lebar, dan tanpa gerak dikurangi.
  useEffect(() => {
    if (mode !== "imersif") return setCincin(false);
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const lebar = matchMedia("(min-width: 60rem)");
    const cek = () => setCincin(!mq.matches && lebar.matches);
    cek();
    mq.addEventListener("change", cek);
    lebar.addEventListener("change", cek);
    return () => {
      mq.removeEventListener("change", cek);
      lebar.removeEventListener("change", cek);
    };
  }, [mode]);

  return (
    <section
      id="klien"
      data-dunia="kasir"
      className={`klien ${cincin ? "klien--cincin" : "klien--daftar"}`}
      aria-labelledby="klien-judul"
    >
      {cincin ? (
        <Cincin
          t={t}
          bahasa={bahasa}
          daftar={daftar}
          induk={induk}
          kelompok={kelompok}
          setKelompok={setKelompok}
          buka={setDibuka}
        />
      ) : (
        <Daftar
          t={t}
          bahasa={bahasa}
          daftar={daftar}
          kelompok={kelompok}
          setKelompok={setKelompok}
          buka={setDibuka}
        />
      )}
      <Detail t={t} bahasa={bahasa} item={dibuka} tutup={() => setDibuka(null)} />
    </section>
  );
}

function Kepala({ t, kelompok, setKelompok }) {
  return (
    <header className="klien__kepala">
      <p className="mono klien__label">{t("label")}</p>
      <h2 id="klien-judul" className="klien__judul">
        {t("judul")}
      </h2>
      <p className="klien__pengantar">{t("pengantar")}</p>
      <div className="klien__tab" role="tablist" aria-label={t("label")}>
        {KELOMPOK.map((k) => (
          <button
            key={k.slug}
            type="button"
            role="tab"
            id={`klien-tab-${k.slug}`}
            aria-controls="klien-panel"
            aria-selected={k.slug === kelompok}
            className="mono"
            onClick={() => setKelompok(k.slug)}
          >
            {t(`tab.${k.slug}`)}
          </button>
        ))}
      </div>
      <p className="mono klien__keterangan">{t(`keterangan.${kelompok}`)}</p>
    </header>
  );
}

function Chip({ t, jenis }) {
  return (
    <ul className="klien__chip">
      {jenis.map((j) => (
        <li key={j} className="mono">
          {t(`jenis.${j}`)}
        </li>
      ))}
    </ul>
  );
}

// Muka cakram; box set memperlihatkan cakram anaknya menyembul di belakang.
function Muka({ item, besar = false }) {
  return (
    <span className={`muka ${besar ? "muka--besar" : ""}`}>
      {item.anak?.map((a, i) => (
        <img
          key={a.slug}
          className={`muka__anak muka__anak--${i}`}
          src={a.cakram}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ))}
      <img
        className="muka__utama"
        src={item.cakram}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={(e) => (e.currentTarget.dataset.muat = "selesai")}
      />
    </span>
  );
}

function Daftar({ t, bahasa, daftar, kelompok, setKelompok, buka }) {
  return (
    <div className="wadah klien__isi">
      <Kepala t={t} kelompok={kelompok} setKelompok={setKelompok} />
      <ul id="klien-panel" className="klien__baris" role="tabpanel" aria-labelledby={`klien-tab-${kelompok}`}>
        {daftar.map((item) => (
          <li key={item.slug}>
            <button
              type="button"
              className="klien__kartu"
              onClick={() => buka(item)}
              aria-label={t("buka", { nama: item.nama })}
            >
              <Muka item={item} />
              <span className="klien__nama">{item.nama}</span>
              <span className="mono klien__industri">{bahasa(item.industri)}</span>
              {item.anak ? (
                <span className="mono klien__industri">{t("set", { n: item.anak.length })}</span>
              ) : null}
            </button>
            <Chip t={t} jenis={item.jenis} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cincin({ t, bahasa, daftar, induk, kelompok, setKelompok, buka }) {
  const seksi = useRef(null);
  const panggung = useRef(null);
  const cakram = useRef([]);
  const geser = useRef(0); // putaran tambahan dari seretan, tombol, atau ganti tab (0..1 = satu putaran)
  const tarik = useRef(null);
  const [depan, setDepan] = useState(0);
  const n = daftar.length;

  const gambar = useCallback(() => {
    const el = seksi.current;
    const pg = panggung.current;
    if (!el || !pg) return;
    const p = kemajuanSeksi(el.getBoundingClientRect(), innerHeight);
    const r = pg.clientWidth * 0.4;
    const bentuk = bentukCincin(p, n, geser.current, r);
    bentuk.cakram.forEach((b, i) => {
      const d = cakram.current[i];
      if (!d) return;
      d.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) scale(${b.skala.toFixed(3)})`;
      d.style.opacity = b.terang.toFixed(3);
      d.style.zIndex = String(b.lapis);
      d.dataset.depan = String(i === bentuk.depan);
    });
    setDepan((lama) => (lama === bentuk.depan ? lama : bentuk.depan));
  }, [n]);

  useEffect(() => {
    let jalan = 0;
    const minta = () => {
      if (!jalan) jalan = requestAnimationFrame(() => ((jalan = 0), gambar()));
    };
    gambar();
    addEventListener("scroll", minta, { passive: true });
    addEventListener("resize", minta);
    return () => {
      cancelAnimationFrame(jalan);
      removeEventListener("scroll", minta);
      removeEventListener("resize", minta);
    };
  }, [gambar]);

  // Ganti tab: putaran dimulai lagi dari cakram pertama kelompok baru.
  useEffect(() => {
    const el = seksi.current;
    if (!el) return;
    const p = kemajuanSeksi(el.getBoundingClientRect(), innerHeight);
    geser.current = -bentukCincin(p, n, 0, 1).putaran;
    gambar();
  }, [kelompok, n, gambar]);

  const putarKe = (i) => {
    const el = seksi.current;
    const p = kemajuanSeksi(el.getBoundingClientRect(), innerHeight);
    const dasar = bentukCincin(p, n, 0, 1).putaran;
    geser.current = i / n - dasar;
    gambar();
  };

  const baruSeret = useRef(false);
  const tekan = (e) => {
    if (e.button !== 0) return;
    tarik.current = { x: e.clientX, awal: geser.current, gerak: false, id: e.pointerId };
  };
  const seret = (e) => {
    const tr = tarik.current;
    if (!tr) return;
    const dx = e.clientX - tr.x;
    if (!tr.gerak && Math.abs(dx) > 6) {
      tr.gerak = true;
      panggung.current.setPointerCapture?.(tr.id);
    }
    geser.current = tr.awal - dx / (panggung.current.clientWidth * 1.6);
    gambar();
  };
  const lepas = () => {
    const tr = tarik.current;
    tarik.current = null;
    if (!tr?.gerak) return;
    // Klik yang menyusul seretan bukan pilihan cakram.
    baruSeret.current = true;
    setTimeout(() => (baruSeret.current = false), 0);
    putarKe(cakramDepan(360 * (geser.current + bentukDasar()), n));
  };
  const bentukDasar = () =>
    bentukCincin(kemajuanSeksi(seksi.current.getBoundingClientRect(), innerHeight), n, 0, 1).putaran;

  const item = daftar[depan] ?? daftar[0];

  return (
    <div ref={seksi} className="klien__gulir">
      <div className="klien__lekat">
        <div className="wadah klien__isi">
          <div className="klien__kiri">
            <Kepala t={t} kelompok={kelompok} setKelompok={setKelompok} />
            {item ? (
              <div className="klien__sorot">
                <p className="klien__nama klien__nama--besar">{item.nama}</p>
                <p className="mono klien__industri">
                  {bahasa(item.industri)}
                  {item.anak ? `. ${t("set", { n: item.anak.length })}` : ""}
                </p>
                <Chip t={t} jenis={item.jenis} />
                <div className="klien__aksi">
                  <button
                    type="button"
                    className="tombol"
                    aria-label={t("buka", { nama: item.nama })}
                    onClick={() => buka(item)}
                  >
                    {t("detail")}
                  </button>
                  <button
                    type="button"
                    className="klien__panah"
                    aria-label={t("sebelumnya")}
                    onClick={() => putarKe((depan - 1 + n) % n)}
                  >
                    <PiCaretLeftBold aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="klien__panah"
                    aria-label={t("berikutnya")}
                    onClick={() => putarKe((depan + 1) % n)}
                  >
                    <PiCaretRightBold aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div
            ref={panggung}
            id="klien-panel"
            className="klien__panggung"
            role="tabpanel"
            aria-labelledby={`klien-tab-${kelompok}`}
            onPointerDown={tekan}
            onPointerMove={seret}
            onPointerUp={lepas}
            onPointerCancel={lepas}
          >
            <span className="klien__spindel" aria-hidden>
              <img src={induk.induk} alt="" />
            </span>
            {daftar.map((x, i) => (
              <button
                key={`${kelompok}-${x.slug}`}
                ref={(el) => (cakram.current[i] = el)}
                type="button"
                className="klien__cakram"
                aria-label={t("buka", { nama: x.nama })}
                onFocus={() => putarKe(i)}
                onClick={() => (baruSeret.current ? null : buka(x))}
              >
                <Muka item={x} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ t, bahasa, item, tutup }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  const isi = item ? (item.anak ?? [item]) : [];
  return (
    <dialog
      ref={ref}
      className="klien__detail"
      onClose={tutup}
      onClick={(e) => e.target === ref.current && tutup()}
      aria-labelledby="klien-detail-judul"
    >
      {item ? (
        <div className="klien__detail-isi">
          <div className="klien__detail-kepala">
            <h3 id="klien-detail-judul">{item.nama}</h3>
            <button type="button" className="klien__panah" aria-label={t("tutup")} onClick={tutup}>
              <PiXBold aria-hidden />
            </button>
          </div>
          {item.anak ? <p className="klien__pengantar">{bahasa(item.kerja)}</p> : null}
          <div className={`klien__detail-set ${isi.length > 1 ? "klien__detail-set--dua" : ""}`}>
            {isi.map((x) => (
              <article key={x.slug} className="klien__detail-kartu">
                <Muka item={x} besar />
                {item.anak ? <h4 className="klien__nama">{x.nama}</h4> : null}
                <p className="mono klien__industri">{bahasa(x.industri)}</p>
                <Chip t={t} jenis={x.jenis} />
                {x.kerja ? <p className="klien__kerja">{bahasa(x.kerja)}</p> : null}
                {x.tautan ? (
                  <a className="klien__tautan" href={x.tautan} target="_blank" rel="noopener noreferrer">
                    {t("kasus")} <PiArrowUpRightBold aria-hidden />
                  </a>
                ) : null}
                {x.album ? (
                  <a className="klien__tautan" href="#rak" onClick={tutup}>
                    {t("album")}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
