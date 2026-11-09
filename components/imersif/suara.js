// Efek suara rak CD dari rekaman asli (Freesound, CC0; asal di public/assets/suara/
// PROVENANCE.md), dimuat setelah gestur pertama. Selama rekaman belum siap atau gagal
// dimuat, resep sintesis di bawah dipakai sebagai cadangan, jadi tidak pernah sunyi.
// Satu AudioContext, dibuat pada gestur pertama (aturan autoplay peramban), dengan
// satu GainNode utama. Bisu disimpan di localStorage dan dibagikan ke tombol di bilah.

export const KUNCI_BISU = "suara-bisu";
// Tingkat utama sekitar -20 dB: suara sekadar menemani gerak, bukan menonjol.
export const TINGKAT = 0.1;

// Bisu awal: pilihan tersimpan menang; tanpa pilihan, pengguna yang meminta gerak
// dikurangi juga tidak diberi suara sampai menyalakannya sendiri.
export function bacaBisu(simpanan, kurangiGerak = false) {
  let v = null;
  try {
    v = simpanan?.getItem(KUNCI_BISU) ?? null;
  } catch {}
  if (v === "1") return true;
  if (v === "0") return false;
  return !!kurangiGerak;
}

export function simpanBisu(simpanan, bisu) {
  try {
    simpanan?.setItem(KUNCI_BISU, bisu ? "1" : "0");
    return true;
  } catch {
    return false;
  }
}

// Variasi nada kecil supaya bunyi yang sama tidak terdengar seperti diulang mesin.
export const variasi = (acak = Math.random) => 1 + (acak() * 2 - 1) * 0.03;

// Resep tiap peristiwa: daftar lapisan. "derau" = semburan derau berfilter,
// "nada" = osilator dengan selubung. Waktu dalam detik, frekuensi dalam Hz.
export const RESEP = {
  // Engsel tutup lepas dari kait: dua klik plastik dan dentum pelan.
  bukaKotak: [
    { jenis: "derau", filter: "bandpass", f: 3200, q: 4, kuat: 0.7, lama: 0.03 },
    { jenis: "derau", filter: "bandpass", f: 2400, q: 5, kuat: 0.5, lama: 0.03, tunda: 0.07 },
    { jenis: "nada", gelombang: "sine", f: 190, kuat: 0.5, lama: 0.09, tunda: 0.01 },
  ],
  // Tutup rapat: klak yang lebih tegas.
  rapat: [
    { jenis: "derau", filter: "bandpass", f: 2600, q: 3, kuat: 0.9, lama: 0.04 },
    { jenis: "nada", gelombang: "sine", f: 150, kuat: 0.8, lama: 0.12 },
  ],
  // Cakram diangkat dari nampan: desis gesek yang naik.
  angkat: [{ jenis: "derau", filter: "bandpass", f: 900, f2: 2600, q: 1.2, kuat: 0.35, lama: 0.28 }],
  // Cakram masuk ke poros: klik lalu dentum rendah.
  duduk: [
    { jenis: "derau", filter: "bandpass", f: 3600, q: 6, kuat: 0.8, lama: 0.025 },
    { jenis: "nada", gelombang: "sine", f: 120, kuat: 0.9, lama: 0.14, tunda: 0.015 },
  ],
  // Tombol keluarkan: klik, lalu desis turun saat cakram terangkat.
  keluarkan: [
    { jenis: "derau", filter: "bandpass", f: 3000, q: 5, kuat: 0.7, lama: 0.03 },
    { jenis: "derau", filter: "bandpass", f: 2200, f2: 700, q: 1.4, kuat: 0.3, lama: 0.35, tunda: 0.05 },
  ],
  // Tombol transport: klik taktil kecil.
  tombol: [
    { jenis: "derau", filter: "highpass", f: 4200, q: 0.7, kuat: 0.6, lama: 0.018 },
    { jenis: "nada", gelombang: "triangle", f: 1800, kuat: 0.2, lama: 0.02 },
  ],
  // Halaman buklet dibalik: gemerisik kertas.
  halaman: [
    { jenis: "derau", filter: "bandpass", f: 1800, f2: 4200, q: 0.9, kuat: 0.45, lama: 0.26, gemeretak: true },
  ],
  // Buklet ditarik keluar atau masuk ke tutup: gesekan kertas panjang dan halus.
  kertas: [{ jenis: "derau", filter: "highpass", f: 2200, f2: 1400, q: 0.6, kuat: 0.3, lama: 0.45 }],
  // Rak bergeser satu album: ketuk plastik kecil.
  rak: [{ jenis: "derau", filter: "bandpass", f: 2800, q: 5, kuat: 0.3, lama: 0.02 }],
};

export const PERISTIWA = Object.keys(RESEP);

// Rekaman per peristiwa: beberapa take dipilih bergantian supaya tidak terdengar diulang.
// Satu-tembakan (MP3) dinormalkan puncaknya ke -3 dBFS, kecuali klik kotak 265634 yang
// berbagi satu gain supaya kait lepas tetap lebih pelan dari tutup menghentak.
// `kuat` mengatur keras relatifnya di atas TINGKAT utama.
const AKAR = "/assets/suara/";
export const REKAMAN = {
  bukaKotak: { berkas: ["buka-1", "buka-2"], kuat: 2 },
  rapat: { berkas: ["rapat-1", "rapat-2"], kuat: 1.6 },
  angkat: { berkas: ["angkat-1"], kuat: 1.2 },
  duduk: { berkas: ["duduk-1"], kuat: 1.4 },
  keluarkan: { berkas: ["keluarkan-1"], kuat: 1.4 },
  tombol: { berkas: ["tombol-1", "tombol-2", "tombol-3"], kuat: 1 },
  halaman: { berkas: ["halaman-1", "halaman-2", "halaman-3"], kuat: 1.4 },
  kertas: { berkas: ["kertas-1"], kuat: 1 },
  rak: { berkas: ["rak-1", "rak-2", "rak-3"], kuat: 1.8 },
};
// Lup (WAV, karena MP3 menambah jeda di ujung berkas dan sambungan lupnya berbunyi klik).
export const LUP = { motor: "motor", proyektor: "proyektor" };
export const semuaBerkas = () => [
  ...Object.values(REKAMAN).flatMap((r) => r.berkas.map((n) => `${AKAR}${n}.mp3`)),
  ...Object.values(LUP).map((n) => `${AKAR}${n}.wav`),
];

const ambil = (src) => fetch(src).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status} ${src}`))));

export function buatSuara({
  Konteks = globalThis.AudioContext ?? globalThis.webkitAudioContext,
  simpanan = globalThis.localStorage,
  kurangiGerak = false,
  acak = Math.random,
  muat = ambil,
} = {}) {
  let ctx = null;
  let utama = null;
  let derauBuf = null;
  let bisu = bacaBisu(simpanan, kurangiGerak);
  const pendengar = new Set();
  let motor = null;
  let dengung = null;
  let lajuMotor = 0;
  let kuatDengung = 0;
  // Rekaman yang sudah terdekode, per nama berkas; dan take terakhir per peristiwa.
  const rekaman = new Map();
  const takeLalu = {};

  const kabari = () => pendengar.forEach((fn) => fn(bisu));

  // Lup sintesis yang sedang jalan diganti rekamannya begitu rekaman itu siap.
  const gantiLup = (nama) => {
    if (nama === LUP.motor && motor?.sintesis) {
      motor.g.disconnect?.();
      motor = null;
      if (lajuMotor > 0) api.motor(lajuMotor);
    }
    if (nama === LUP.proyektor && dengung?.sintesis) {
      dengung.g.disconnect?.();
      dengung = null;
      if (kuatDengung > 0) api.proyektor(kuatDengung);
    }
  };

  const muatRekaman = () => {
    for (const src of semuaBerkas()) {
      const nama = src.slice(AKAR.length, -4);
      Promise.resolve()
        .then(() => muat(src))
        .then((ab) => new Promise((ok, gagal) => ctx.decodeAudioData(ab, ok, gagal)))
        .then((buf) => {
          rekaman.set(nama, buf);
          gantiLup(nama);
        })
        .catch(() => {});
    }
  };

  const siapkan = () => {
    if (ctx || !Konteks) return ctx;
    try {
      ctx = new Konteks();
    } catch {
      return null;
    }
    utama = ctx.createGain();
    utama.gain.value = bisu ? 0 : TINGKAT;
    utama.connect(ctx.destination);
    // Dua detik derau putih, dipakai ulang semua lapisan dengan titik mulai acak.
    const n = Math.floor(ctx.sampleRate * 2);
    derauBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = derauBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = acak() * 2 - 1;
    muatRekaman();
    return ctx;
  };

  // Mainkan satu take rekaman. `lama` (detik) memotongnya dengan pudar supaya bunyi
  // berhenti bersama geraknya; tanpa `lama` rekaman diputar utuh.
  const putarRekaman = (nama, t, lama) => {
    const r = REKAMAN[nama];
    const siap = r?.berkas.filter((b) => rekaman.has(b)) ?? [];
    if (!siap.length) return false;
    const pilihan = siap.length > 1 ? siap.filter((b) => b !== takeLalu[nama]) : siap;
    const take = pilihan[Math.floor(acak() * pilihan.length) % pilihan.length];
    takeLalu[nama] = take;
    const s = ctx.createBufferSource();
    s.buffer = rekaman.get(take);
    s.playbackRate.value = variasi(acak);
    const g = ctx.createGain();
    const kuat = r.kuat * (0.9 + acak() * 0.2);
    g.gain.setValueAtTime(kuat, t);
    s.connect(g);
    g.connect(utama);
    s.start(t);
    if (lama) {
      const pudar = Math.min(0.15, lama / 3);
      g.gain.setValueAtTime(kuat, t + lama - pudar);
      g.gain.linearRampToValueAtTime(0.0001, t + lama);
      s.stop(t + lama + 0.02);
    }
    return true;
  };

  const lupRekaman = (nama) => {
    const buf = rekaman.get(nama);
    if (!buf) return null;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0;
    s.connect(g);
    g.connect(utama);
    s.start(0, acak() * buf.duration);
    return { s, g };
  };

  const sumberDerau = (loop = false) => {
    const s = ctx.createBufferSource();
    s.buffer = derauBuf;
    s.loop = loop;
    return s;
  };

  // Selubung cepat naik, turun eksponensial; nilai 0 tidak boleh untuk eksponensial.
  const selubung = (g, t, kuat, lama) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(kuat, t + Math.min(0.004, lama / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + lama);
  };

  const lapisan = (l, mulai) => {
    const v = variasi(acak);
    const t = mulai + (l.tunda ?? 0);
    const g = ctx.createGain();
    g.connect(utama);
    if (l.jenis === "nada") {
      const o = ctx.createOscillator();
      o.type = l.gelombang;
      o.frequency.setValueAtTime(l.f * v, t);
      o.frequency.exponentialRampToValueAtTime(l.f * v * 0.7, t + l.lama);
      selubung(g, t, l.kuat, l.lama);
      o.connect(g);
      o.start(t);
      o.stop(t + l.lama + 0.02);
      return;
    }
    const s = sumberDerau();
    const f = ctx.createBiquadFilter();
    f.type = l.filter;
    f.Q.value = l.q;
    f.frequency.setValueAtTime(l.f * v, t);
    if (l.f2) f.frequency.exponentialRampToValueAtTime(l.f2 * v, t + l.lama);
    s.connect(f);
    if (l.gemeretak) {
      // Kertas tidak berdesis rata: amplitudonya patah-patah.
      const p = ctx.createGain();
      p.gain.setValueAtTime(0.3, t);
      for (let i = 1; i < 9; i++) p.gain.setValueAtTime(0.25 + acak() * 0.75, t + (l.lama * i) / 9);
      f.connect(p);
      p.connect(g);
    } else f.connect(g);
    selubung(g, t, l.kuat, l.lama);
    s.start(t, acak() * 1.5);
    s.stop(t + l.lama + 0.02);
  };

  // Lup: dibuat sekali, dikendalikan lewat gain dan frekuensi.
  const buatMotor = () => {
    const s = sumberDerau(true);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 220;
    f.Q.value = 3;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 40;
    const og = ctx.createGain();
    og.gain.value = 0.05;
    const g = ctx.createGain();
    g.gain.value = 0;
    s.connect(f);
    f.connect(g);
    o.connect(og);
    og.connect(g);
    g.connect(utama);
    s.start();
    o.start();
    return { s, f, o, g, sintesis: true };
  };

  const buatDengung = () => {
    const s = sumberDerau(true);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 700;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 50;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 100;
    const og = ctx.createGain();
    og.gain.value = 0.5;
    const og2 = ctx.createGain();
    og2.gain.value = 0.2;
    // LFO pelan yang membuat dengungnya bernapas.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.15;
    const g = ctx.createGain();
    g.gain.value = 0;
    const napas = ctx.createGain();
    napas.gain.value = 0.85;
    lfo.connect(lfoG);
    lfoG.connect(napas.gain);
    s.connect(f);
    f.connect(napas);
    o.connect(og);
    og.connect(napas);
    o2.connect(og2);
    og2.connect(napas);
    napas.connect(g);
    g.connect(utama);
    s.start();
    o.start();
    o2.start();
    lfo.start();
    return { g, f, sintesis: true };
  };

  const buka = () => {
    siapkan();
    if (ctx?.state === "suspended") ctx.resume?.().catch?.(() => {});
  };

  const api = {
    // Dipanggil dari gestur pengguna (pointerdown/keydown).
    buka,
    // `lama` (detik, opsional): panjang gerak yang ditemani, supaya bunyinya ikut berhenti.
    mainkan(nama, lama) {
      const resep = RESEP[nama];
      if (!resep || bisu || !ctx || ctx.state !== "running") return false;
      const t = ctx.currentTime + 0.005;
      if (putarRekaman(nama, t, lama)) return true;
      for (const l of resep) lapisan(l, t);
      return true;
    },
    // r: 0..1 kecepatan putar relatif terhadap 120 rpm. Rekaman motor diputar lebih
    // lambat saat cakram baru mulai berputar, jadi nadanya ikut naik seperti aslinya.
    motor(r) {
      lajuMotor = Math.max(0, Math.min(1, r));
      if (!ctx) return;
      if (!motor && lajuMotor > 0) motor = lupRekaman(LUP.motor) ?? buatMotor();
      if (!motor) return;
      const t = ctx.currentTime;
      if (motor.sintesis) {
        motor.g.gain.setTargetAtTime(lajuMotor * 0.35, t, 0.08);
        motor.f.frequency.setTargetAtTime(140 + 160 * lajuMotor, t, 0.08);
        motor.o.frequency.setTargetAtTime(20 + 30 * lajuMotor, t, 0.08);
        return;
      }
      motor.g.gain.setTargetAtTime(Math.min(1, lajuMotor * 1.4) * 1.5, t, 0.06);
      motor.s.playbackRate.setTargetAtTime(0.5 + 0.5 * lajuMotor, t, 0.06);
    },
    // k: 0..1 terang sorot proyektor; kedip opsional mengguncang dengungnya.
    proyektor(k, kedip = 1) {
      kuatDengung = Math.max(0, Math.min(1, k));
      if (!ctx) return;
      if (!dengung && kuatDengung > 0) dengung = lupRekaman(LUP.proyektor) ?? buatDengung();
      if (!dengung) return;
      const t = ctx.currentTime;
      if (dengung.sintesis) {
        dengung.g.gain.setTargetAtTime(kuatDengung * 0.3 * kedip, t, 0.03);
        dengung.f.frequency.setTargetAtTime(500 + 400 * kedip, t, 0.05);
        return;
      }
      dengung.g.gain.setTargetAtTime(kuatDengung * 1.2 * kedip, t, 0.03);
    },
    get bisu() {
      return bisu;
    },
    setBisu(b) {
      bisu = !!b;
      simpanBisu(simpanan, bisu);
      if (utama && ctx) utama.gain.setTargetAtTime(bisu ? 0 : TINGKAT, ctx.currentTime, 0.02);
      kabari();
    },
    langgan(fn) {
      pendengar.add(fn);
      return () => pendengar.delete(fn);
    },
    get konteks() {
      return ctx;
    },
    get lup() {
      return { motor: lajuMotor, proyektor: kuatDengung };
    },
    // Jeda dari menjadwalkan bunyi sampai terdengar (detik). Bunyi kontak (tutup rapat,
    // cakram duduk) dipicu lebih awal sebesar ini supaya jatuh tepat di bingkai kontaknya.
    get latensi() {
      return ctx ? (ctx.baseLatency || 0) + (ctx.outputLatency || 0) + 0.005 : 0;
    },
    // Nama berkas rekaman yang sudah siap dipakai.
    get rekaman() {
      return [...rekaman.keys()];
    },
  };
  return api;
}

// Satu mesin suara untuk seluruh halaman, dibuat saat pertama dibutuhkan di peramban.
let tunggal = null;
export function suara() {
  if (!tunggal && typeof window !== "undefined") {
    tunggal = buatSuara({ kurangiGerak: matchMedia("(prefers-reduced-motion: reduce)").matches });
    const buka = () => tunggal.buka();
    window.addEventListener("pointerdown", buka, { passive: true });
    window.addEventListener("keydown", buka);
  }
  return tunggal;
}
