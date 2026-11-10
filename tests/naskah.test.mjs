// Naskah adegan cerita gulir v2 (components/cerita/naskah.js): keadaan harus menyambung di
// setiap batas babak, kembali utuh saat digulir mundur, dan sejajar dengan bab di content/cerita.js.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BABAK, POSE, keadaanPada, progresDari, bukit } from "../components/cerita/naskah.js";
import { BAB } from "../content/cerita.js";

const angka = (s) =>
  Object.entries(s)
    .filter(([k]) => k !== "babak" && k !== "u")
    .flatMap(([k, v]) => (Array.isArray(v) ? v.map((x, i) => [`${k}${i}`, x]) : [[k, v]]));

function dekat(a, b, toleransi, pesan) {
  const A = Object.fromEntries(angka(a));
  for (const [k, v] of angka(b)) assert.ok(Math.abs(A[k] - v) <= toleransi, `${pesan}: ${k} ${A[k]} vs ${v}`);
}

test("babak naskah sama dengan bab cerita, diawali pembuka", () => {
  assert.deepEqual(BABAK.map((b) => b.id), ["pembuka", ...BAB.map((b) => b.id)]);
  assert.equal(POSE.length, BABAK.length + 1);
});

test("keadaan menyambung di setiap batas babak", () => {
  for (let c = 1; c < BABAK.length; c++) {
    dekat(keadaanPada(c - 1e-6), keadaanPada(c), 1e-3, `batas ${c}`);
  }
});

test("gerak sisipan nol di kedua ujung babak, jadi pose babak utuh", () => {
  for (let c = 0; c < BABAK.length; c++) {
    const s = keadaanPada(c);
    for (const k of ["sinyal", "uv", "segel", "buklet", "tumpuk", "urai", "layarPenuh", "perangkat", "iris"]) {
      assert.ok(Math.abs(s[k] - POSE[c][k]) < 1e-6, `babak ${c}: ${k}=${s[k]}`);
    }
  }
});

test("tiap bab mencapai momen utamanya di tengah babak", () => {
  const puncak = (id, kunci) => {
    const c = BABAK.findIndex((b) => b.id === id);
    let maks = 0;
    for (let i = 0; i <= 200; i++) maks = Math.max(maks, keadaanPada(c + i / 200)[kunci]);
    return maks;
  };
  assert.ok(puncak("demo", "coret") > 0.99);
  assert.ok(puncak("aransemen", "perangkat") > 0.99);
  assert.ok(puncak("aransemen", "layarPenuh") > 0.95);
  assert.ok(puncak("aransemen", "iris") > 0.99);
  assert.ok(puncak("transparansi", "buklet") > 0.99);
  assert.ok(puncak("keamanan", "segel") > 0.99);
  assert.ok(puncak("keamanan", "uv") > 0.95);
  assert.ok(puncak("keandalan", "sinyal") > 0.95);
  assert.ok(puncak("skala", "tumpuk") > 0.99);
  assert.ok(puncak("infrastruktur", "urai") > 0.99);
});

test("kotak dan meja perangkat bertukar hanya di balik tirai yang tertutup penuh", () => {
  // Regresi 10 Nov 2026: alas laptop sempat terlihat menembus cakram saat kamera menyelam.
  const c = BABAK.findIndex((b) => b.id === "aransemen");
  let sebelum = keadaanPada(c);
  for (let i = 1; i <= 2000; i++) {
    const s = keadaanPada(c + i / 2000);
    assert.ok(s.meja === 0 || s.meja === 1, `meja harus 0 atau 1, dapat ${s.meja}`);
    if (s.meja !== sebelum.meja) assert.ok(Math.max(s.iris, sebelum.iris) > 0.98, `tukar di u=${i / 2000} saat iris ${s.iris}`);
    if (s.meja === 0) assert.equal(s.perangkat, 0, `perangkat tampil tanpa meja di u=${i / 2000}`);
    sebelum = s;
  }
});

test("maju dan mundur memberi keadaan yang sama (tanpa ingatan)", () => {
  const maju = [];
  for (let i = 0; i <= 90; i++) maju.push(keadaanPada(i / 10));
  for (let i = 90; i >= 0; i--) dekat(keadaanPada(i / 10), maju[i], 0, `p=${i / 10}`);
});

test("bukit nol di ujung, satu di puncak, dan tidak keluar rentang", () => {
  assert.equal(bukit(0), 0);
  assert.equal(bukit(1), 0);
  assert.equal(bukit(0.5), 1);
  for (let i = -10; i <= 20; i++) {
    const v = bukit(i / 10);
    assert.ok(v >= 0 && v <= 1);
  }
});

test("progres dari garis tengah layar mengikuti blok babak", () => {
  const blok = [
    { atas: 1000, tinggi: 500 },
    { atas: 1500, tinggi: 1000 },
    { atas: 2500, tinggi: 500 },
  ];
  assert.equal(progresDari(0, blok), 0);
  assert.equal(progresDari(1000, blok), 0);
  assert.equal(progresDari(1250, blok), 0.5);
  assert.equal(progresDari(1500, blok), 1);
  assert.equal(progresDari(2000, blok), 1.5);
  assert.equal(progresDari(2999, blok), 2 + 499 / 500);
  assert.equal(progresDari(5000, blok), 3);
  assert.equal(progresDari(10, []), 0);
});
