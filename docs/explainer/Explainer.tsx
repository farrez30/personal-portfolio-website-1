import React from "react";
import {
  AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, CalculateMetadataFunction
} from "remotion";

// Explainer proyek untuk layar hologram portofolio. Satu komposisi untuk semua proyek:
// isi, warna, dan huruf datang dari JSON per proyek (props), bahasa dari props.lang.

export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

export type Babak = {
  kode: string;
  label: string;
  judul: { id: string; en: string };
  teks: { id: string; en: string };
  klip: string;
  dur: { id: number; en: number };
};
export type Proyek = {
  slug: string;
  judul: { id: string; en: string };
  katalog: string;
  warna: { kertas: string; tinta: string; aksen: string };
  huruf: { keluarga: string; berkas: string | null; berat: number };
  // Gaya per genre album: kemiringan blok judul, jenis sapuan antarbabak, sudutnya,
  // huruf kapital atau tidak, dan bingkai panel komik.
  tampilan?: { miring?: number; sapuan?: string; sudut?: number; kapital?: boolean; bingkai?: boolean };
  babak: Babak[];
};
export type Props = { lang: "id" | "en"; proyek: Proyek };

const PEMBUKA = 1.6;
const PENUTUP = 2.0;
const JEDA = 0.35;
const panjangBabak = (b: Babak, lang: "id" | "en") => b.dur[lang] + JEDA;

export const hitungDurasi = (p: Proyek, lang: "id" | "en") =>
  PEMBUKA + p.babak.reduce((s, b) => s + panjangBabak(b, lang), 0) + PENUTUP;

export const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: f(hitungDurasi(props.proyek, props.lang)),
});

const UI = "'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif";
const geser = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

const gaya = (p: Proyek) => ({
  miring: p.tampilan?.miring ?? -8,
  sapuan: p.tampilan?.sapuan ?? "diagonal",
  sudut: p.tampilan?.sudut ?? 18,
  kapital: p.tampilan?.kapital ?? true,
  bingkai: p.tampilan?.bingkai ?? false,
});
const kapital = (p: Proyek) => (gaya(p).kapital ? "uppercase" : "none") as "uppercase" | "none";

const Huruf = ({ p }: { p: Proyek }) => !p.huruf.berkas ? null : (
  <style>{`@font-face{font-family:'${p.huruf.keluarga}';src:url(${staticFile(p.huruf.berkas)}) format('woff2');font-weight:${p.huruf.berat}}`}</style>
);

/** Kartu pembuka: pita diagonal, lingkaran aksen, judul proyek meluncur masuk. */
const Pembuka = ({ proyek: p, lang }: Props) => {
  const fr = useCurrentFrame();
  const a = geser(fr, 0, 14);
  const b = geser(fr, 8, 26);
  const keluar = interpolate(fr, [f(PEMBUKA) - 8, f(PEMBUKA)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: p.warna.kertas, opacity: keluar }}>
      <div style={{ position: "absolute", right: 120, top: 70, width: 300, height: 300, borderRadius: "50%", background: p.warna.aksen,
        transform: `scale(${a})` }} />
      <div style={{ position: "absolute", left: -120, top: 470, width: 1700, height: 60, background: p.warna.aksen,
        transform: `rotate(${gaya(p).miring}deg) translateX(${(1 - a) * -1600}px)` }} />
      {/* Judul di blok tinta miring; boleh dua baris supaya judul panjang tidak keluar layar. */}
      <div style={{ position: "absolute", left: 80, top: 230, maxWidth: 1000, padding: "16px 30px 20px", background: p.warna.tinta,
        transform: `rotate(${gaya(p).miring}deg) translateX(${(1 - b) * -1200}px)`, transformOrigin: "left center",
        fontFamily: `'${p.huruf.keluarga}'`, fontWeight: p.huruf.berat, fontSize: 70, lineHeight: 1.02, color: p.warna.kertas,
        textTransform: kapital(p), letterSpacing: 1 }}>
        {p.judul[lang]}
      </div>
      <div style={{ position: "absolute", right: 120, bottom: 70, fontFamily: UI, fontSize: 26, letterSpacing: 6,
        color: p.warna.tinta, opacity: b }}>{p.katalog}</div>
    </AbsoluteFill>
  );
};

/** Pecah narasi per kalimat; tiap kalimat tampil sebanding panjang hurufnya. */
// Pecah hanya di tanda akhir yang diikuti spasi, supaya "5.964" dan "1.591" tetap utuh.
const kalimat = (teks: string) => teks.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

const Babakan = ({ p, b, lang, nomor }: { p: Proyek; b: Babak; lang: "id" | "en"; nomor: number }) => {
  const fr = useCurrentFrame();
  const len = f(panjangBabak(b, lang));
  const klipDur = 6;
  const laju = Math.max(0.55, Math.min(1, klipDur / panjangBabak(b, lang)));
  const zoom = interpolate(fr, [0, len], [1.04, 1.12]);
  const judulMasuk = geser(fr, 6, 22);
  const label = geser(fr, 2, 14);
  const ks = kalimat(b.teks[lang]);
  const total = ks.reduce((s, k) => s + k.length, 0);
  let mulai = 0;
  const jadwal = ks.map((k) => {
    const d = (k.length / total) * f(b.dur[lang]);
    const j = { k, a: mulai, z: mulai + d };
    mulai += d;
    return j;
  });
  const kini = jadwal.find((j) => fr >= j.a && fr < j.z + 6) ?? jadwal[jadwal.length - 1];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo src={staticFile(b.klip)} playbackRate={laju} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {/* Pita label babak, miring seperti potongan poster. */}
      <div style={{ position: "absolute", left: 48, top: 44, padding: "8px 22px", background: p.warna.aksen, color: p.warna.kertas,
        fontFamily: UI, fontWeight: 700, fontSize: 22, letterSpacing: 5, textTransform: "uppercase",
        transform: `skewX(${gaya(p).miring * 1.5}deg) translateX(${(1 - label) * -400}px)` }}>
        {String(nomor).padStart(2, "0")}  {b.label}
      </div>
      <div style={{ position: "absolute", left: 40, top: 104, maxWidth: 860, padding: "10px 26px 14px", background: p.warna.tinta,
        color: p.warna.kertas, fontFamily: `'${p.huruf.keluarga}'`, fontWeight: p.huruf.berat, fontSize: 64, lineHeight: 1.02,
        textTransform: kapital(p), transform: `skewX(${gaya(p).miring}deg) translateX(${(1 - judulMasuk) * -1100}px)` }}>
        {b.judul[lang]}
      </div>
      {/* Teks narasi: kotak kertas di bawah, satu kalimat sekali. */}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 36, display: "flex", justifyContent: "center" }}>
        <div key={kini.k} style={{ maxWidth: 1040, padding: "14px 26px", background: p.warna.kertas, color: p.warna.tinta,
          fontFamily: UI, fontSize: 32, lineHeight: 1.3, fontWeight: 600, borderLeft: `10px solid ${p.warna.aksen}`,
          opacity: interpolate(fr, [kini.a, kini.a + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {kini.k}
        </div>
      </div>
      <Audio src={staticFile(`narasi/${p.slug}/${lang}-${b.kode}.wav`)} />
      {gaya(p).bingkai && (
        <AbsoluteFill style={{ border: `18px solid ${p.warna.tinta}`, boxShadow: `inset 0 0 0 6px ${p.warna.kertas}` }} />
      )}
    </AbsoluteFill>
  );
};

/** Sapuan antarbabak sesuai genre, dengan gesekan kertas. */
const Sapuan = ({ p }: { p: Proyek }) => {
  const fr = useCurrentFrame();
  const g = gaya(p);
  const t = interpolate(fr, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const x = -1500 + t * 3200;
  let isi: React.ReactNode;
  if (g.sapuan === "pudar") {
    // ECM dan cetak cukil: kertas naik lalu turun, tanpa gerak keras.
    isi = <AbsoluteFill style={{ background: p.warna.kertas, opacity: Math.sin(t * Math.PI) }} />;
  } else if (g.sapuan === "lingkaran") {
    // Bauhaus: lingkaran aksen membesar dari tengah lalu lepas ke kanan.
    const r = Math.sin(t * Math.PI) * 1500;
    isi = <div style={{ position: "absolute", left: 640 - r / 2 + t * 300, top: 360 - r / 2, width: r, height: r, borderRadius: "50%", background: p.warna.aksen }} />;
  } else if (g.sapuan === "blok") {
    // Blue Note: dua persegi datar bergeser berlawanan arah.
    isi = <>
      <div style={{ position: "absolute", top: 0, left: x, width: 900, height: 360, background: p.warna.aksen }} />
      <div style={{ position: "absolute", top: 360, left: 1280 - x - 900, width: 900, height: 360, background: p.warna.tinta }} />
    </>;
  } else {
    // diagonal, tirai (tegak lurus), komik (diagonal bergaris hitam tebal).
    const sudut = g.sapuan === "tirai" ? 0 : g.sudut;
    const garis = g.sapuan === "komik" ? `12px solid ${p.warna.tinta}` : "none";
    isi = <>
      <div style={{ position: "absolute", top: -300, left: x, width: 520, height: 1400, background: p.warna.aksen, transform: `rotate(${sudut}deg)`, borderLeft: garis, borderRight: garis }} />
      <div style={{ position: "absolute", top: -300, left: x - 140, width: 90, height: 1400, background: p.warna.tinta, transform: `rotate(${sudut}deg)` }} />
    </>;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {isi}
      <Audio src={staticFile("sfx/sapu.mp3")} volume={0.35} />
    </AbsoluteFill>
  );
};

const Penutup = ({ proyek: p, lang }: Props) => {
  const fr = useCurrentFrame();
  const a = geser(fr, 0, 16);
  return (
    <AbsoluteFill style={{ background: p.warna.tinta, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 220, height: 220, borderRadius: "50%", background: p.warna.aksen, transform: `scale(${a})`, position: "absolute", left: 160, top: 120 }} />
      <div style={{ fontFamily: `'${p.huruf.keluarga}'`, fontWeight: p.huruf.berat, fontSize: 70, color: p.warna.kertas,
        textTransform: kapital(p), transform: `skewX(${gaya(p).miring}deg) translateY(${(1 - a) * 60}px)`, opacity: a, textAlign: "center", maxWidth: 1000 }}>
        {p.judul[lang]}
      </div>
      <div style={{ marginTop: 22, fontFamily: UI, fontSize: 24, letterSpacing: 6, color: p.warna.kertas, opacity: a * 0.75 }}>{p.katalog}</div>
    </AbsoluteFill>
  );
};

export const Explainer = ({ lang, proyek: p }: Props) => {
  let t = PEMBUKA;
  const awal = p.babak.map((b) => {
    const o = t;
    t += panjangBabak(b, lang);
    return o;
  });
  return (
    <AbsoluteFill style={{ background: p.warna.tinta }}>
      <Huruf p={p} />
      <Sequence durationInFrames={f(PEMBUKA)}>
        <Pembuka lang={lang} proyek={p} />
      </Sequence>
      {p.babak.map((b, i) => (
        <Sequence key={b.kode} from={f(awal[i])} durationInFrames={f(panjangBabak(b, lang))}>
          <Babakan p={p} b={b} lang={lang} nomor={i + 1} />
        </Sequence>
      ))}
      {p.babak.map((b, i) => (
        <Sequence key={`s-${b.kode}`} from={f(awal[i]) - 7} durationInFrames={16}>
          <Sapuan p={p} />
        </Sequence>
      ))}
      <Sequence from={f(t)} durationInFrames={f(PENUTUP)}>
        <Penutup lang={lang} proyek={p} />
      </Sequence>
    </AbsoluteFill>
  );
};
