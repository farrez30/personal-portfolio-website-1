// Efek suara rak CD, seluruhnya disintesis Web Audio: tidak ada berkas audio yang
// diunduh, jadi tidak ada lisensi yang perlu dicatat dan tidak ada beban jaringan.
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
};

export const PERISTIWA = Object.keys(RESEP);

export function buatSuara({ Konteks = globalThis.AudioContext ?? globalThis.webkitAudioContext, simpanan = globalThis.localStorage, kurangiGerak = false, acak = Math.random } = {}) {
  let ctx = null;
  let utama = null;
  let derauBuf = null;
  let bisu = bacaBisu(simpanan, kurangiGerak);
  const pendengar = new Set();
  let motor = null;
  let dengung = null;
  let lajuMotor = 0;
  let kuatDengung = 0;

  const kabari = () => pendengar.forEach((fn) => fn(bisu));

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
    return ctx;
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
    return { s, f, o, g };
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
    return { g, f };
  };

  const buka = () => {
    siapkan();
    if (ctx?.state === "suspended") ctx.resume?.().catch?.(() => {});
  };

  return {
    // Dipanggil dari gestur pengguna (pointerdown/keydown).
    buka,
    mainkan(nama) {
      const resep = RESEP[nama];
      if (!resep || bisu || !ctx || ctx.state !== "running") return false;
      const t = ctx.currentTime + 0.005;
      for (const l of resep) lapisan(l, t);
      return true;
    },
    // r: 0..1 kecepatan putar relatif terhadap 120 rpm.
    motor(r) {
      lajuMotor = Math.max(0, Math.min(1, r));
      if (!ctx) return;
      if (!motor && lajuMotor > 0) motor = buatMotor();
      if (!motor) return;
      const t = ctx.currentTime;
      motor.g.gain.setTargetAtTime(lajuMotor * 0.35, t, 0.08);
      motor.f.frequency.setTargetAtTime(140 + 160 * lajuMotor, t, 0.08);
      motor.o.frequency.setTargetAtTime(20 + 30 * lajuMotor, t, 0.08);
    },
    // k: 0..1 terang sorot proyektor; kedip opsional mengguncang dengungnya.
    proyektor(k, kedip = 1) {
      kuatDengung = Math.max(0, Math.min(1, k));
      if (!ctx) return;
      if (!dengung && kuatDengung > 0) dengung = buatDengung();
      if (!dengung) return;
      const t = ctx.currentTime;
      dengung.g.gain.setTargetAtTime(kuatDengung * 0.3 * kedip, t, 0.03);
      dengung.f.frequency.setTargetAtTime(500 + 400 * kedip, t, 0.05);
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
  };
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
