import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { bacaBisu, simpanBisu, buatSuara, RESEP, PERISTIWA, TINGKAT, KUNCI_BISU, variasi, REKAMAN, semuaBerkas } from "../components/imersif/suara.js";

// Penyimpanan palsu; "rusak" meniru Safari privat yang melempar saat diakses.
const simpanan = (awal = {}, rusak = false) => {
  const isi = { ...awal };
  return {
    isi,
    getItem: (k) => {
      if (rusak) throw new Error("SecurityError");
      return k in isi ? isi[k] : null;
    },
    setItem: (k, v) => {
      if (rusak) throw new Error("QuotaExceededError");
      isi[k] = String(v);
    },
  };
};

// AudioContext palsu: cukup untuk mencatat node yang dibuat dan nilai gain utama.
// Seperti aslinya, exponentialRamp ke 0 melempar.
class Param {
  constructor(v = 0) {
    this.value = v;
  }
  setValueAtTime(v) {
    this.value = v;
  }
  linearRampToValueAtTime(v) {
    this.value = v;
  }
  exponentialRampToValueAtTime(v) {
    if (v <= 0) throw new RangeError("target harus positif");
    this.value = v;
  }
  setTargetAtTime(v) {
    this.value = v;
  }
}
class Node {
  constructor(ctx) {
    this.ctx = ctx;
    this.sambung = [];
  }
  connect(n) {
    this.sambung.push(n);
    return n;
  }
}
class KonteksPalsu {
  constructor() {
    this.state = "running";
    this.sampleRate = 8000;
    this.currentTime = 0;
    this.destination = new Node(this);
    this.dibuat = [];
    KonteksPalsu.terakhir = this;
  }
  catat(n) {
    this.dibuat.push(n);
    return n;
  }
  createGain() {
    const n = new Node(this);
    n.gain = new Param(1);
    return this.catat(n);
  }
  createBiquadFilter() {
    const n = new Node(this);
    n.frequency = new Param(350);
    n.Q = new Param(1);
    return this.catat(n);
  }
  createOscillator() {
    const n = new Node(this);
    n.frequency = new Param(440);
    n.start = () => (n.mulai = true);
    n.stop = () => {};
    return this.catat(n);
  }
  createBufferSource() {
    const n = new Node(this);
    n.playbackRate = new Param(1);
    n.start = () => (n.mulai = true);
    n.stop = (t) => (n.berhenti = t);
    return this.catat(n);
  }
  createBuffer(_, n) {
    const d = new Float32Array(n);
    return { getChannelData: () => d };
  }
  // Seperti aslinya: callback sukses atau gagal. Isi "rusak" gagal didekode.
  decodeAudioData(ab, ok, gagal) {
    queueMicrotask(() => (ab === "rusak" ? gagal(new Error("EncodingError")) : ok({ nama: ab, duration: 2 })));
  }
  resume() {
    this.state = "running";
    return Promise.resolve();
  }
}

test("bisu awal: tersimpan menang, tanpa simpanan ikut reduced-motion", () => {
  assert.equal(bacaBisu(simpanan({ [KUNCI_BISU]: "1" }), false), true);
  assert.equal(bacaBisu(simpanan({ [KUNCI_BISU]: "0" }), true), false);
  assert.equal(bacaBisu(simpanan(), false), false);
  assert.equal(bacaBisu(simpanan(), true), true);
});

test("penyimpanan yang melempar tidak merusak apa pun", () => {
  assert.equal(bacaBisu(simpanan({}, true), false), false);
  assert.equal(simpanBisu(simpanan({}, true), true), false);
});

test("variasi nada dalam ±3%", () => {
  assert.equal(variasi(() => 0), 0.97);
  assert.equal(variasi(() => 1), 1.03);
  assert.equal(variasi(() => 0.5), 1);
});

test("setiap peristiwa punya resep dengan lapisan yang sah", () => {
  for (const nama of ["bukaKotak", "rapat", "angkat", "duduk", "keluarkan", "tombol", "halaman", "kertas", "ketik", "lonceng", "papan", "relay", "tirai", "segel"]) {
    assert.ok(PERISTIWA.includes(nama), `tidak ada resep ${nama}`);
  }
  for (const [nama, lap] of Object.entries(RESEP)) {
    assert.ok(lap.length > 0, nama);
    for (const l of lap) {
      assert.ok(l.jenis === "nada" || l.jenis === "derau", `${nama}: jenis ${l.jenis}`);
      assert.ok(l.f > 0 && l.lama > 0 && l.lama < 1, `${nama}: f/lama`);
      assert.ok(l.kuat > 0 && l.kuat <= 1, `${nama}: kuat`);
    }
  }
});

test("sebelum gestur pertama tidak ada suara dan tidak ada konteks", () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan() });
  assert.equal(s.konteks, null);
  assert.equal(s.mainkan("tombol"), false);
});

test("setelah dibuka, semua peristiwa bisa dimainkan tanpa galat", () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan(), acak: () => 0.5 });
  s.buka();
  for (const nama of PERISTIWA) assert.equal(s.mainkan(nama), true, nama);
  assert.equal(s.mainkan("tidakAda"), false);
});

test("bisu: gain utama 0, tidak memainkan apa pun, dan pilihannya tersimpan", () => {
  const sim = simpanan();
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: sim });
  s.buka();
  const utama = KonteksPalsu.terakhir.dibuat[0];
  assert.equal(utama.gain.value, TINGKAT);
  let kabar = null;
  s.langgan((b) => (kabar = b));
  s.setBisu(true);
  assert.equal(utama.gain.value, 0);
  assert.equal(sim.isi[KUNCI_BISU], "1");
  assert.equal(kabar, true);
  assert.equal(s.mainkan("tombol"), false);
  // Muat ulang: mesin baru membaca pilihan yang sama.
  assert.equal(buatSuara({ Konteks: KonteksPalsu, simpanan: sim }).bisu, true);
  s.setBisu(false);
  assert.equal(utama.gain.value, TINGKAT);
});

test("lup motor dan proyektor hanya dibuat saat menyala, dijepit 0..1", () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan() });
  s.buka();
  const awal = KonteksPalsu.terakhir.dibuat.length;
  s.motor(0);
  s.proyektor(0);
  assert.equal(KonteksPalsu.terakhir.dibuat.length, awal);
  s.motor(2);
  s.proyektor(-1);
  assert.deepEqual(s.lup, { motor: 1, proyektor: 0, ruang: 0 });
  assert.ok(KonteksPalsu.terakhir.dibuat.length > awal);
});

// Pemuat palsu: "berkas" yang dikembalikan adalah namanya, supaya buffer bisa dikenali.
const muatSemua = (src) => Promise.resolve(src.split("/").pop());
const tunggu = () => new Promise((r) => setTimeout(r, 0));
const sumberRekaman = (ctx) => ctx.dibuat.filter((n) => n.buffer?.nama);

test("setiap peristiwa punya rekaman, dan semua berkasnya ada serta tercatat CC0", () => {
  const prov = readFileSync(new URL("../public/assets/suara/PROVENANCE.md", import.meta.url), "utf8");
  for (const nama of PERISTIWA) assert.ok(REKAMAN[nama]?.berkas.length, `tanpa rekaman: ${nama}`);
  for (const src of semuaBerkas()) {
    assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `${src} tidak ada`);
    const berkas = src.split("/").pop();
    assert.match(prov, new RegExp(`\\| ${berkas.replace(".", "\\.")} \\|[^\\n]*CC0`), `${berkas} tanpa asal CC0`);
  }
});

test("setelah rekaman siap, peristiwa memutar rekaman dan tidak mengulang take yang sama", async () => {
  // acak selalu 0: tanpa penyaring take terakhir, take pertama terpilih terus.
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan(), muat: muatSemua, acak: () => 0 });
  s.buka();
  await tunggu();
  const ctx = KonteksPalsu.terakhir;
  assert.equal(s.rekaman.length, semuaBerkas().length);
  const take = [];
  for (let i = 0; i < 6; i++) {
    s.mainkan("tombol");
    take.push(sumberRekaman(ctx).at(-1).buffer.nama);
  }
  for (const t of take) assert.match(t, /^tombol-\d\.mp3$/);
  for (let i = 1; i < take.length; i++) assert.notEqual(take[i], take[i - 1], "take sama berturut-turut");
});

test("lama memotong rekaman tepat di akhir gerak", async () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan(), muat: muatSemua, acak: () => 0.5 });
  s.buka();
  await tunggu();
  s.mainkan("kertas", 1.2);
  const src = sumberRekaman(KonteksPalsu.terakhir).at(-1);
  assert.equal(src.buffer.nama, "kertas-1.mp3");
  assert.ok(Math.abs(src.berhenti - (0.005 + 1.2 + 0.02)) < 1e-9);
});

test("rekaman yang gagal dimuat jatuh ke sintesis, tidak sunyi", async () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan(), muat: () => Promise.resolve("rusak") });
  s.buka();
  await tunggu();
  assert.equal(s.rekaman.length, 0);
  const ctx = KonteksPalsu.terakhir;
  const sebelum = ctx.dibuat.length;
  assert.equal(s.mainkan("rapat"), true);
  assert.ok(ctx.dibuat.length > sebelum, "resep sintesis tidak membuat node");
});

test("motor sintesis yang sedang jalan diganti lup rekaman begitu rekamannya siap", async () => {
  let lepas;
  const tahan = new Promise((r) => (lepas = r));
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan(), muat: (src) => tahan.then(() => muatSemua(src)) });
  s.buka();
  s.motor(1);
  const ctx = KonteksPalsu.terakhir;
  assert.equal(sumberRekaman(ctx).length, 0);
  lepas();
  await tunggu();
  const lup = sumberRekaman(ctx).find((n) => n.buffer.nama === "motor.wav");
  assert.ok(lup?.loop && lup.mulai, "lup motor rekaman tidak dimulai");
  assert.equal(lup.playbackRate.value, 1);
});

test("latensi = base + output + jadwal 5 ms; 0 sebelum ada konteks", () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan(), muat: muatSemua });
  assert.equal(s.latensi, 0);
  s.buka();
  Object.assign(KonteksPalsu.terakhir, { baseLatency: 0.01, outputLatency: 0.04 });
  assert.ok(Math.abs(s.latensi - 0.055) < 1e-9);
});

test("bunyi kontak (tutup rapat, cakram duduk) dipicu lebih awal sebesar latensi, sekali per gerak", () => {
  const src = readFileSync(new URL("../components/imersif/adegan.js", import.meta.url), "utf8");
  assert.match(src, /!kt\.rapatBerbunyi && kt\.buka < ambangKontak\(/);
  assert.match(src, /!k_\.dudukBerbunyi && lajuDengar >= 0 && k_\.dengar > 1 - ambangKontak\(/);
  // Latensi yang tak masuk akal dibatasi 150 ms supaya bunyi tidak mendahului gerak terlalu jauh.
  assert.match(src, /Math\.min\(0\.15, latensiSuara\?\.\(\) \?\? 0\)/);
  const panggung = readFileSync(new URL("../components/imersif/Panggung.jsx", import.meta.url), "utf8");
  assert.match(panggung, /latensiSuara: \(\) => sfx\?\.latensi/);
});

test("tanpa AudioContext (peramban lama, SSR) semuanya diam tanpa galat", () => {
  const s = buatSuara({ Konteks: undefined, simpanan: simpanan() });
  s.buka();
  assert.equal(s.mainkan("tombol"), false);
  s.motor(1);
  s.proyektor(1);
  s.setBisu(true);
});

test("room tone cerita: lup hanya dibuat saat menyala, dijepit 0..1, dan bisu tetap menang", () => {
  const s = buatSuara({ Konteks: KonteksPalsu, simpanan: simpanan() });
  s.buka();
  const ctx = KonteksPalsu.terakhir;
  const awal = ctx.dibuat.length;
  s.ruang(0);
  assert.equal(ctx.dibuat.length, awal);
  s.ruang(3);
  assert.equal(s.lup.ruang, 1);
  assert.ok(ctx.dibuat.length > awal);
  s.setBisu(true);
  assert.equal(ctx.dibuat.find((n) => n.sambung.includes(ctx.destination)).gain.value, 0);
});
