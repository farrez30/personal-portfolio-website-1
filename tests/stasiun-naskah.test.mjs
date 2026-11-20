// Kontrak naskah kamera cerita v5 (storyboard-build.md §8): urutan babak, variasi perpindahan,
// batas durasi di dalam gedung, gerak dikurangi, teks id dan en.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ANCHOR_V5, JENIS, BATAS_DALAM, durasiPindah, periksaNaskah, pemicuAnchorV5 } from "../components/stasiun/naskah.js";
import { BABAK_V5 } from "../content/cerita-v5.js";

test("naskah v5 sehat: tanpa jenis sama berturut-turut, durasi dalam gedung di bawah batas", () => {
  assert.deepEqual(periksaNaskah(), []);
});

test("urutan anchor: gerbang, sepuluh babak sesuai urutan konten, lalu modul lab", () => {
  assert.deepEqual(ANCHOR_V5.map((a) => a.id), ["gerbang", ...BABAK_V5.map((b) => b.id), "modul-lab"]);
  assert.equal(BABAK_V5.length, 10);
});

test("tiap babak menunjuk seksinya lewat kelas bab--<id>", () => {
  for (const b of BABAK_V5) assert.equal(ANCHOR_V5.find((a) => a.id === b.id).seksi[0].sel, `.bab--${b.id}`);
});

test("pemeriksa menangkap dua jenis sama berturut-turut", () => {
  const rusak = [{ id: "a", keluar: "whip", durasi: 0.6 }, { id: "b", keluar: "whip", durasi: 0.6 }];
  assert.match(periksaNaskah(rusak).join(), /jenis sama berturut-turut/);
});

test("pemeriksa menangkap perpindahan dalam gedung yang terlalu lama, tapi tidak serah terima makro", () => {
  assert.match(periksaNaskah([{ id: "a", keluar: "orbit", durasi: BATAS_DALAM + 0.1 }]).join(), /melewati/);
  assert.deepEqual(periksaNaskah([{ id: "a", keluar: "zoom-satelit", durasi: 5.5 }]), []);
  assert.equal(JENIS["zoom-satelit"].makro, true);
});

test("gerak dikurangi: semua perpindahan jadi potongan", () => {
  ANCHOR_V5.forEach((_, i) => assert.equal(durasiPindah(i, true), 0));
  assert.equal(durasiPindah(1), 1.4);
  assert.equal(durasiPindah(99), 0);
});

test("pemicu gulir naik berurutan dan seksi yang belum ada tidak memundurkan urutan", () => {
  const ada = new Map(ANCHOR_V5.map((a, i) => [a.seksi[0].sel, { atas: i * 800, tinggi: 800 }]));
  ada.delete(".bab--biaya");
  const t = pemicuAnchorV5((sel) => ada.get(sel) ?? null);
  assert.equal(t.length, ANCHOR_V5.length);
  for (let i = 1; i < t.length; i++) assert.ok(t[i].y > t[i - 1].y || t[i].id === "biaya", `urutan ${t[i].id}`);
});

test("judul dan isi tiap babak ada di id dan en, tanpa pola teks yang dilarang", () => {
  for (const b of BABAK_V5) {
    for (const k of ["judul", "isi"]) for (const l of ["id", "en"]) {
      assert.ok(b[k][l]?.trim().length > 3, `${b.id}.${k}.${l}`);
      assert.doesNotMatch(b[k][l], / · | — | \| |→/, `${b.id}.${k}.${l} memakai penyambung simbol`);
    }
  }
});
