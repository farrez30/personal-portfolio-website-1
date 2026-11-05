import { test } from "node:test";
import assert from "node:assert/strict";
import { bacaBisu, simpanBisu, buatSuara, RESEP, PERISTIWA, TINGKAT, KUNCI_BISU, variasi } from "../components/imersif/suara.js";

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
    n.start = () => (n.mulai = true);
    n.stop = () => {};
    return this.catat(n);
  }
  createBuffer(_, n) {
    const d = new Float32Array(n);
    return { getChannelData: () => d };
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
  for (const nama of ["bukaKotak", "rapat", "angkat", "duduk", "keluarkan", "tombol", "halaman", "kertas"]) {
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
  assert.deepEqual(s.lup, { motor: 1, proyektor: 0 });
  assert.ok(KonteksPalsu.terakhir.dibuat.length > awal);
});

test("tanpa AudioContext (peramban lama, SSR) semuanya diam tanpa galat", () => {
  const s = buatSuara({ Konteks: undefined, simpanan: simpanan() });
  s.buka();
  assert.equal(s.mainkan("tombol"), false);
  s.motor(1);
  s.proyektor(1);
  s.setBisu(true);
});
