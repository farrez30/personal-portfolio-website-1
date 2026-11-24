// Kontrak modul lab cerita v5 (F6, ADR 0024, storyboard-build.md §4 dan §8): loker dihitung dari
// daftar proyek tanpa pengisi, urutan loker = urutan daftar HTML, rel lorong tidak menembus rak,
// sekat, atau dinding dan lewat lubang palka, tiap rak terlihat dan labelnya terbaca di HP saat
// kamera berhenti di depannya, gulir dan fokus memilih loker yang sama, buka loker sesuai waktunya.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { proyek } from "../content/proyek.js";
import {
  susunLab, buatRel, poseRel, alamatPanel, panelDariAlamat, bagianRel, titikLoker, lokerGulir, kDariGulir, gulirDariK, poseLoker, poseMasuk, tahapBuka, lokerNyala, bendaLab,
  RUANG, PALKA, MODUL, pusatModul, RAK, MUKA_RAK, PINTU, TARIK, JENDELA_LAB, BUKA,
} from "../components/stasiun/lab.js";
import { buatKendali } from "../components/stasiun/kendaliLab.js";
import { ANCHOR_V5, poseAnchor, GESER } from "../components/stasiun/naskah.js";

const S = susunLab(proyek);
const BENDA = bendaLab(S);
const dalam = (p, b, sela = 0) => p.every((v, k) => v > b.min[k] - sela && v < b.max[k] + sela);
const BENTUK = [
  ["lebar", false, 1440, 900],
  ["tegak", true, 390, 844],
];
// Kamera seperti adegan.js: bingkai digeser dari kolom teks lewat setViewOffset.
function kamera(p, tegak, w, h) {
  const c = new THREE.PerspectiveCamera(p.fov, w / h, 0.01, 60);
  if (tegak) c.setViewOffset(w, h, 0, h * GESER.tegak, w, h);
  else c.setViewOffset(w, h, -w * GESER.lebar, 0, w, h);
  c.position.set(...p.posisi);
  c.lookAt(new THREE.Vector3(...p.lihat));
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
}
const SAMPEL = Array.from({ length: 401 }, (_, s) => s / 400);

test("loker: satu per proyek, lalu versi lama (rak CD), lalu kontak; urut seperti daftar, tanpa pengisi", () => {
  assert.equal(S.loker.length, proyek.length + 2);
  assert.deepEqual(S.loker.slice(0, -2).map((l) => l.slug), proyek.map((p) => p.slug));
  assert.equal(new Set(S.loker.map((l) => l.slug).filter(Boolean)).size, proyek.length);
  assert.deepEqual(S.loker.slice(-2).map((l) => l.jenis), ["arsip", "kontak"]);
  assert.ok(S.loker.at(-1).kontak && !S.loker.at(-1).slug && !S.loker.at(-2).kontak);
  assert.ok(S.loker.slice(0, -2).every((l) => l.jenis === "proyek" && !l.kontak));
  assert.equal(S.rak.length, Math.ceil(S.loker.length / 2));
  assert.equal(S.modul, Math.ceil(S.rak.length / 4));
  // 13 proyek: modul A penuh delapan loker, modul B lima proyek, loker arsip, dan loker kontak
  assert.equal(S.loker.filter((l) => l.modul === 0).length, 8);
  assert.deepEqual(S.loker.map((l) => l.label), S.loker.map((_, i) => `L-${String(i + 1).padStart(2, "0")}`));
});

test("loker: jumlah rak dan modul ikut daftar dari CMS, berapa pun panjangnya", () => {
  for (const n of [0, 1, 3, 7, 8, 15, 22]) {
    const s = susunLab(proyek.slice(0, 1).flatMap(() => Array.from({ length: n }, (_, i) => ({ slug: `p${i}` }))));
    assert.equal(s.loker.length, n + 2);
    assert.equal(s.rak.length, Math.ceil((n + 2) / 2), `n=${n}`);
    assert.deepEqual(s.loker.slice(-2).map((l) => l.jenis), ["arsip", "kontak"]);
    assert.equal(s.modul, Math.ceil(s.rak.length / 4), `n=${n}`);
    // tidak ada rak kosong: rak terakhir memuat satu atau dua loker
    assert.ok(s.rak.length * 2 - s.loker.length < 2);
  }
});

test("loker: pintu di muka rak, dua baris per rak, rak di dinding belakang modulnya", () => {
  for (const l of S.loker) {
    const r = S.rak[l.rak];
    assert.equal(l.pusat[0], r.x);
    assert.equal(l.pusat[1], PINTU.y[l.baris]);
    assert.ok(l.pusat[2] > MUKA_RAK && l.pusat[2] < MUKA_RAK + 0.1);
    assert.ok(Math.abs(r.x - pusatModul(r.modul)) < MODUL.panjang / 2 - RAK.lebar / 2, `rak ${r.r} keluar modulnya`);
  }
});

test("anchor modul-lab: pose awal rel, sama dengan rel untuk jumlah rak berapa pun", () => {
  const i = ANCHOR_V5.findIndex((a) => a.id === "modul-lab");
  for (const [nama, tegak] of BENTUK) {
    const p = poseAnchor(i, tegak);
    assert.equal(p.tahap, "lab");
    assert.ok(p.rel);
    for (const n of [2, 5, 7, 12]) {
      const q = poseRel(buatRel(n, tegak), 0);
      assert.deepEqual(q.posisi, p.posisi, `${nama} ${n} rak`);
      assert.deepEqual(q.lihat, p.lihat, `${nama} ${n} rak`);
    }
  }
});

test("rel: di dalam ruang modul, tidak menembus rak, peralatan, sekat, atau dinding", () => {
  for (const [nama, tegak] of BENTUK)
    for (const opsi of [{}, { henti: true }]) {
      const rel = buatRel(S.rak.length, tegak);
      for (const k of SAMPEL) {
        const p = poseRel(rel, k, opsi).posisi;
        assert.ok(p[1] > RUANG.y[0] + 0.3 && p[1] < RUANG.y[1] - 0.3 && p[2] > RUANG.z[0] + 0.3 && p[2] < RUANG.z[1] - 0.3, `${nama} k=${k}: ${p}`);
        const kena = BENDA.find((b) => dalam(p, b, 0.08));
        assert.equal(kena, undefined, `${nama} k=${k} menembus ${kena?.nama}`);
      }
    }
});

test("rel: lewat lubang palka di tiap sekat antarmodul", () => {
  for (const [nama, tegak] of BENTUK) {
    const rel = buatRel(S.rak.length, tegak);
    const sekat = [pusatModul(0) + MODUL.panjang / 2, pusatModul(1) - MODUL.panjang / 2];
    for (const x of sekat) {
      let lewat = false;
      for (let s = 0; s < 4000; s++) {
        const p = poseRel(rel, s / 4000).posisi;
        if (Math.abs(p[0] - x) < 0.02) {
          lewat = true;
          assert.ok(Math.hypot(p[1], p[2]) < PALKA.r - 0.25, `${nama} di sekat ${x}: ${p}`);
        }
      }
      assert.ok(lewat, `${nama} tidak melewati sekat ${x}`);
    }
  }
});

test("rel: maju terus sepanjang lorong (gulir maju tidak pernah memundurkan kamera)", () => {
  for (const [nama, tegak] of BENTUK) {
    const rel = buatRel(S.rak.length, tegak);
    let lalu = -Infinity;
    for (const k of SAMPEL) {
      const x = poseRel(rel, k, { henti: true }).posisi[0];
      assert.ok(x >= lalu - 1e-9, `${nama} k=${k}`);
      lalu = x;
    }
    assert.ok(Math.abs(poseRel(rel, 1).posisi[0] - (S.rak.at(-1).x - (tegak ? 0.55 : 1.1))) < 1e-6);
  }
});

test("rel: di henti tiap rak, raknya di bingkai dan label lokernya terbaca di HP (paling sedikit 11 px)", () => {
  for (const [nama, tegak, w, h] of BENTUK) {
    const rel = buatRel(S.rak.length, tegak);
    rel.kHenti.forEach((k, r) => {
      const c = kamera(poseRel(rel, k), tegak, w, h);
      for (const l of S.loker.filter((x) => x.rak === r)) {
        const v = new THREE.Vector3(...l.pusat).project(c);
        assert.ok(Math.abs(v.x) < 0.95 && Math.abs(v.y) < 0.95 && v.z < 1, `${nama} ${l.label} di luar bingkai: ${v.x.toFixed(2)}, ${v.y.toFixed(2)}`);
        // tinggi huruf label kira-kira 40% dari tinggi pelat 0,135 m
        const atas = new THREE.Vector3(l.pusat[0], l.pusat[1] + 0.1 + 0.027, l.pusat[2]).project(c);
        const bawah = new THREE.Vector3(l.pusat[0], l.pusat[1] + 0.1 - 0.027, l.pusat[2]).project(c);
        assert.ok(((atas.y - bawah.y) / 2) * h >= 11, `${nama} ${l.label} huruf ${(((atas.y - bawah.y) / 2) * h).toFixed(1)} px`);
      }
    });
  }
});

test("rel: henti lembut di desktop, laju rata di HP, gerak dikurangi langsung ke rak terdekat", () => {
  const rel = buatRel(S.rak.length, false);
  for (const k of rel.kHenti.slice(1, -1)) {
    // di sekitar henti kamera hampir diam walau gulir terus berjalan
    const d = bagianRel(rel, k + 0.004, { henti: true }) - bagianRel(rel, k - 0.004, { henti: true });
    assert.ok(d < 0.008 * 0.05, `henti ${k}: ${d}`);
    assert.ok(Math.abs(bagianRel(rel, k, { henti: true }) - k) < 1e-9);
  }
  for (const k of SAMPEL) {
    assert.equal(bagianRel(rel, k), k);
    assert.ok(rel.kHenti.includes(bagianRel(rel, k, { potong: true })));
  }
});

test("gulir: tiap loker punya titik gulirnya, urut, dan titik itu menyalakan loker yang sama", () => {
  for (const [, tegak] of BENTUK) {
    const t = titikLoker(buatRel(S.rak.length, tegak), S.loker.length);
    assert.equal(t.length, S.loker.length);
    t.forEach((k, i) => {
      if (i) assert.ok(k > t[i - 1], `titik ${i}`);
      assert.equal(lokerGulir(t, k), i);
    });
    assert.equal(lokerGulir(t, 0), 0);
    assert.equal(lokerGulir(t, 1), S.loker.length - 1);
  }
  // k dari posisi gulir dan sebaliknya
  for (const k of [0, 0.2, 0.5, 1]) assert.ok(Math.abs(kDariGulir(gulirDariK(k, 844, 9000, 3200), 844, 9000, 3200) - k) < 1e-9);
  assert.equal(kDariGulir(9000 - 422, 844, 9000, 3200), 0);
});

test("sorotan: buka menang atas fokus, fokus atas hover, hover atas gulir", () => {
  assert.equal(lokerNyala({ gulir: 4 }), 4);
  assert.equal(lokerNyala({ gulir: 4, hover: 2 }), 2);
  assert.equal(lokerNyala({ gulir: 4, hover: 2, fokus: 7 }), 7);
  assert.equal(lokerNyala({ gulir: 4, hover: 2, fokus: 7, buka: 1 }), 1);
});

test("kendali: fokus item ke-n menyorot loker ke-n, lepas fokus kembali ke gulir, tanpa kabar ganda", () => {
  const k = buatKendali();
  const kabar = [];
  k.dengar((s) => kabar.push({ ...s }));
  k.set({ gulir: 3 });
  assert.equal(k.nyala(), 3);
  for (let n = 0; n < S.loker.length; n++) {
    k.set({ fokus: n });
    assert.equal(k.nyala(), n);
  }
  k.set({ fokus: -1 });
  assert.equal(k.nyala(), 3);
  const jumlah = kabar.length;
  k.set({ fokus: -1, gulir: 3 });
  assert.equal(kabar.length, jumlah);
  k.set({ buka: 5, fokus: 2 });
  assert.equal(k.nyala(), 5);
});

test("buka loker: kamera mendekat dulu, loker meluncur mulai setengah detik, kartu sesudah kamera tiba", () => {
  assert.deepEqual(tahapBuka(0), { kamera: 0, tarik: 0 });
  assert.equal(tahapBuka(0.4).tarik, 0);
  assert.equal(tahapBuka(BUKA.kamera[1]).kamera, 1);
  assert.equal(tahapBuka(BUKA.tarik[1]).tarik, 1);
  assert.ok(BUKA.kartu >= BUKA.kamera[1] && BUKA.kartu < BUKA.total);
  // meluncur 0,4 s, kamera 0,6 sampai 0,9 s (riset-modul-lab.md §4)
  assert.ok(Math.abs(BUKA.tarik[1] - BUKA.tarik[0] - 0.4) < 1e-9);
  assert.ok(BUKA.kamera[1] >= 0.6 && BUKA.kamera[1] <= 0.9);
  let lalu = { kamera: 0, tarik: 0 };
  for (let s = 0; s <= 1.2; s += 0.01) {
    const x = tahapBuka(s);
    assert.ok(x.kamera >= lalu.kamera && x.tarik >= lalu.tarik);
    lalu = x;
  }
});

test("buka loker: pose dekat tidak menembus benda, pintu yang meluncur di bingkai dan tidak menabrak kamera", () => {
  for (const [nama, tegak, w, h] of BENTUK)
    for (const l of S.loker) {
      const p = poseLoker(l, tegak);
      assert.equal(BENDA.find((b) => dalam(p.posisi, b, 0.08)), undefined, `${nama} ${l.label}`);
      assert.ok(p.posisi[2] < RUANG.z[1] - 0.3 && Math.abs(p.posisi[1]) < RUANG.y[1] - 0.3, `${nama} ${l.label} keluar ruang modul: ${p.posisi}`);
      const muka = l.pusat[2] + TARIK + PINTU.tebal / 2;
      assert.ok(p.posisi[2] - muka > 0.4, `${nama} ${l.label} terlalu dekat pintu`);
      const v = new THREE.Vector3(l.pusat[0], l.pusat[1], l.pusat[2] + TARIK).project(kamera(p, tegak, w, h));
      assert.ok(Math.abs(v.x) < 0.8 && Math.abs(v.y) < 0.8, `${nama} ${l.label}: ${v.x}, ${v.y}`);
      // seluruh lebar pintu yang meluncur di bingkai (lembar kontak F6: di HP pintunya terpotong)
      for (const sx of [-1, 1]) {
        const tepi = new THREE.Vector3(l.pusat[0] + (sx * PINTU.lebar) / 2, l.pusat[1] + 0.1, l.pusat[2] + TARIK).project(kamera(p, tegak, w, h));
        assert.ok(Math.abs(tepi.x) < 1, `${nama} ${l.label} tepi pintu ${sx} di luar bingkai: ${tepi.x.toFixed(2)}`);
      }
    }
});

test("masuk: desktop mulai di balik kaca jendela modul A; HP dekat rak L-01; keduanya menatap L-01", () => {
  for (const [nama, tegak, w, h] of BENTUK) {
    const p = poseMasuk(tegak);
    if (tegak) {
      assert.ok(p.posisi[2] - MUKA_RAK > 0.5 && p.posisi[2] - MUKA_RAK < 1.3, nama);
      assert.equal(BENDA.find((b) => dalam(p.posisi, b, 0.08)), undefined);
    } else {
      assert.ok(p.posisi[2] < JENDELA_LAB.pusat[2] && p.posisi[2] > JENDELA_LAB.pusat[2] - 0.3, nama);
      assert.ok(Math.hypot(p.posisi[0] - JENDELA_LAB.pusat[0], p.posisi[1] - JENDELA_LAB.pusat[1]) < JENDELA_LAB.r);
    }
    const c = kamera(p, tegak, w, h);
    const v = new THREE.Vector3(...S.loker[0].pusat).project(c);
    assert.ok(Math.abs(v.x) < 1 && Math.abs(v.y) < 1, `${nama} L-01 tidak terlihat`);
    // label L-01 utuh sejak bingkai pertama di dalam (lembar kontak F6: di HP sempat terpotong)
    for (const sx of [-1, 1]) {
      const [x, y, z] = S.loker[0].pusat;
      const t = new THREE.Vector3(x + sx * 0.36, y + 0.1, z).project(c);
      assert.ok(Math.abs(t.x) < 1 && Math.abs(t.y) < 1, `${nama} tepi label L-01 ${sx} terpotong: ${t.x.toFixed(2)}`);
    }
  }
});

test("masuk: dari pose masuk ke awal rel kamera sungguh bergerak, di HP mundur sambil lensanya melebar", () => {
  const i = ANCHOR_V5.findIndex((a) => a.id === "modul-lab");
  for (const [nama, tegak] of BENTUK) {
    const a = poseMasuk(tegak);
    const b = poseAnchor(i, tegak);
    const jarak = Math.hypot(...a.posisi.map((v, k) => v - b.posisi[k]));
    assert.ok(jarak >= 0.8, `${nama} hanya ${jarak.toFixed(2)} m`);
    if (tegak) {
      assert.ok(b.posisi[2] - a.posisi[2] > 0.3, "HP: kamera mundur dari rak");
      assert.ok(b.fov - a.fov >= 15, "HP: lensa melebar");
    }
  }
});

test("alamat panel: ?proyek=<slug> ditulis dan dibaca, slug asing ditolak, parameter lain utuh", () => {
  const dasar = "https://farrez.vercel.app/id/v5?uji=1#kontak";
  const alamat = alamatPanel(dasar, proyek[2].slug);
  assert.equal(alamat, `/id/v5?uji=1&proyek=${proyek[2].slug}#kontak`);
  assert.equal(panelDariAlamat(new URL(alamat, dasar).href, proyek), 2);
  assert.equal(alamatPanel(new URL(alamat, dasar).href, null), "/id/v5?uji=1#kontak");
  assert.equal(panelDariAlamat(dasar, proyek), -1);
  assert.equal(panelDariAlamat("https://x.test/v5?proyek=%3Cscript%3E", proyek), -1);
  assert.equal(panelDariAlamat("https://x.test/v5?proyek=", proyek), -1);
});
