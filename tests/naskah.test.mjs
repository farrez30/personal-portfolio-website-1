// Naskah cerita gulir v3 (components/cerita/naskah.js): satu kamera menyusuri soundstage, satu
// panel styleframe per beat (desain/cerita-v3). Kamera harus menyambung tanpa lompatan, tidak
// pernah menembus panel, kembali utuh saat digulir mundur, dan sejajar dengan bab di content.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BABAK,
  STASIUN,
  PANEL,
  keadaanPada,
  progresDari,
  bukit,
  halus,
} from "../components/cerita/naskah.js";
import { BAB } from "../content/cerita.js";

const AKHIR = BABAK.length;
const jarak = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const sampel = (langkah, f) => {
  for (let p = 0; p <= AKHIR + 1e-9; p += langkah) f(Math.min(p, AKHIR));
};
const babak = (id) => BABAK.findIndex((b) => b.id === id);

test("babak naskah sama dengan bab cerita, diawali pembuka", () => {
  assert.deepEqual(BABAK.map((b) => b.id), ["pembuka", ...BAB.map((b) => b.id)]);
  assert.equal(STASIUN.length, BAB.length);
});

test("setiap babak punya bobot gulir positif dan styleframe sendiri", () => {
  for (const b of BABAK) assert.ok(b.bobot > 0, `${b.id}: bobot ${b.bobot}`);
  const gambar = BABAK.slice(1).map((b) => b.gambar);
  assert.equal(new Set(gambar).size, gambar.length, "dua babak memakai styleframe yang sama");
});

test("kamera menyambung: tidak ada lompatan di mana pun, termasuk batas babak", () => {
  // Langkah 0,0002 p. Terbang antarpanel paling cepat sekitar 130 satuan per p (0,03 per
  // langkah); lompatan sungguhan, misalnya pose babak berikutnya yang tidak cocok, satu satuan
  // atau lebih.
  for (const hp of [false, true]) {
    let lalu = keadaanPada(0, { hp });
    sampel(0.0002, (p) => {
      const s = keadaanPada(p, { hp });
      assert.ok(jarak(s.posisi, lalu.posisi) < 0.25, `posisi melompat di p=${p.toFixed(4)} (hp ${hp})`);
      assert.ok(jarak(s.sasaran, lalu.sasaran) < 0.25, `sasaran melompat di p=${p.toFixed(4)} (hp ${hp})`);
      lalu = s;
    });
  }
});

test("kamera selalu di depan panel yang segaris dengannya, tidak pernah menembus panel", () => {
  // Panel yang bentangnya (ditambah 1 satuan) memuat x kamera harus ada di belakang kamera.
  sampel(0.002, (p) => {
    for (const hp of [false, true]) {
      const { posisi } = keadaanPada(p, { hp });
      for (const st of STASIUN) {
        if (Math.abs(posisi[0] - st.x) > PANEL.w / 2 + 1) continue;
        assert.ok(posisi[2] > st.z + 1, `kamera z=${posisi[2].toFixed(2)} di depan panel x=${st.x} pada p=${p.toFixed(3)}`);
      }
    }
  });
});

test("di tengah tiap beat kamera menatap panelnya sendiri", () => {
  for (let i = 0; i < STASIUN.length; i++) {
    const s = keadaanPada(i + 1.4);
    const st = STASIUN[i];
    assert.ok(Math.abs(s.sasaran[0] - st.x) <= PANEL.w / 2, `beat ${i + 1}: sasaran x di luar panel`);
    assert.ok(s.sasaran[1] >= st.y - PANEL.h / 2 && s.sasaran[1] <= st.y + PANEL.h / 2, `beat ${i + 1}: sasaran y di luar panel`);
    assert.ok(Math.abs(s.sasaran[2] - st.z) < 1e-9, `beat ${i + 1}: sasaran tidak di bidang panel`);
  }
});

test("maju dan mundur memberi keadaan yang sama (tanpa ingatan)", () => {
  const maju = [];
  for (let i = 0; i <= 110; i++) maju.push(keadaanPada(i / 10));
  for (let i = 110; i >= 0; i--) assert.deepEqual(keadaanPada(i / 10), maju[i], `p=${i / 10}`);
});

test("benang merah hanya tumbuh maju, dari stasiun pertama sampai terakhir", () => {
  assert.equal(keadaanPada(0).benang, 0);
  assert.equal(keadaanPada(1).benang, 0);
  assert.equal(keadaanPada(AKHIR).benang, 1);
  let lalu = 0;
  sampel(0.001, (p) => {
    const b = keadaanPada(p).benang;
    assert.ok(b >= lalu - 1e-12, `benang mundur di p=${p.toFixed(3)}`);
    lalu = b;
  });
});

test("kotak CD masuk rak satu per satu, hanya di beat rilis", () => {
  const r = babak("rilis");
  for (let p = 0; p < r; p += 0.01) assert.ok(keadaanPada(p).kotak.every((k) => k === 0), `kotak bergerak sebelum rilis, p=${p}`);
  const n = keadaanPada(r).kotak.length;
  assert.ok(n >= 3, "minimal tiga kotak");
  for (let j = 1; j < n; j++) {
    // Kotak j belum bergerak sebelum kotak j-1 selesai.
    for (let u = 0; u <= 1; u += 0.001) {
      const k = keadaanPada(r + u).kotak;
      if (k[j] > 0) assert.equal(k[j - 1], 1, `kotak ${j} jalan sebelum kotak ${j - 1} selesai, u=${u.toFixed(3)}`);
    }
  }
  assert.ok(keadaanPada(AKHIR).kotak.every((k) => k === 1));
});

test("tirai terbuka sesudah semua kotak masuk, dan halaman memutih hanya di ujung", () => {
  const r = babak("rilis");
  for (let p = 0; p < r; p += 0.05) {
    assert.equal(keadaanPada(p).tirai, 0);
    assert.equal(keadaanPada(p).putih, 0);
  }
  for (let u = 0; u <= 1; u += 0.002) {
    const s = keadaanPada(r + u);
    if (s.tirai > 0) assert.ok(s.kotak.every((k) => k === 1), `tirai membuka sebelum kotak selesai, u=${u.toFixed(3)}`);
    if (s.putih > 0) assert.equal(s.tirai, 1, `memutih sebelum tirai terbuka penuh, u=${u.toFixed(3)}`);
  }
  assert.equal(keadaanPada(AKHIR).tirai, 1);
  assert.equal(keadaanPada(AKHIR).putih, 1);
});

test("efek sesaat hanya hidup di beat-nya sendiri", () => {
  const di = (id, kunci) => {
    const c = babak(id);
    let puncak = 0;
    sampel(0.002, (p) => {
      const v = keadaanPada(p)[kunci];
      if (p < c || p >= c + 1) assert.equal(v, 0, `${kunci} hidup di luar ${id}, p=${p.toFixed(3)}`);
      else puncak = Math.max(puncak, v);
    });
    return puncak;
  };
  assert.ok(di("bangun", "getar") > 0.95, "kamera tangan beat bangun tidak terasa");
  assert.equal(di("andal", "sendat"), 1, "film tidak pernah tersendat");
});

// Lampu set fondasi dan garis sibak di monitor grading adalah keadaan panelnya, yang sudah
// terlihat dari jauh sebelum beat-nya mulai. Keduanya hanya boleh naik, tanpa lompatan di batas.
for (const [id, kunci, awal] of [
  ["fondasi", "terang", 0.35],
  ["rapi", "sibak", 0],
]) {
  test(`${kunci} di beat ${id} naik dari ${awal} ke 1 tanpa pernah turun`, () => {
    const c = babak(id);
    assert.equal(keadaanPada(c - 0.01)[kunci], awal);
    assert.equal(keadaanPada(c + 1.01)[kunci], 1);
    let lalu = -Infinity;
    sampel(0.001, (p) => {
      const v = keadaanPada(p)[kunci];
      assert.ok(v >= lalu - 1e-12, `${kunci} turun di p=${p.toFixed(3)}`);
      lalu = v;
    });
  });
}

test("lampu fondasi menyala satu per satu: tiga anak tangga, bukan memudar halus", () => {
  const c = babak("fondasi");
  const nilai = new Set();
  for (let u = 0; u <= 1; u += 0.001) nilai.add(keadaanPada(c + u).terang.toFixed(4));
  assert.equal(nilai.size, 4, `nilai lampu: ${[...nilai].join(", ")}`);
});

test("di HP kamera menatap titik fokus HP, di desktop titik fokus kamera", () => {
  const c = babak("ide");
  const desktop = keadaanPada(c + 0.4).sasaran[0];
  const hp = keadaanPada(c + 0.4, { hp: true }).sasaran[0];
  assert.notEqual(desktop, hp);
});

test("panel tidak diperbesar melewati resolusi gambarnya, kecuali dorongan akhir ke tirai", () => {
  // Styleframe 1376 px: skala 1,6 di layar 1440 px sudah sekitar 1,6 piksel layar per piksel gambar.
  for (const b of BABAK.slice(1))
    for (const f of [b.kamera.dari, b.kamera.ke]) assert.ok(f.s <= 1.6, `${b.id}: skala ${f.s}`);
});

test("bukit dan halus tetap dalam rentang", () => {
  assert.equal(bukit(0), 0);
  assert.equal(bukit(1), 0);
  assert.equal(bukit(0.5), 1);
  for (let i = -10; i <= 20; i++) {
    const v = bukit(i / 10);
    assert.ok(v >= 0 && v <= 1);
    assert.ok(halus(i / 10) >= 0 && halus(i / 10) <= 1);
  }
});

test("progres dari gulir: nol di atas, naik per blok, berhenti di ujung", () => {
  const blok = [
    { atas: 100, tinggi: 200 },
    { atas: 300, tinggi: 100 },
  ];
  assert.equal(progresDari(0, blok), 0);
  assert.equal(progresDari(200, blok), 0.5);
  assert.equal(progresDari(350, blok), 1.5);
  assert.equal(progresDari(9999, blok), 2);
  assert.equal(progresDari(50, []), 0);
});
