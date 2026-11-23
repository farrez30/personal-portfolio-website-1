// System Design Lab (ADR 0027): isi loker, rewrite ke zona, dan pengecualian di proxy.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { eksperimen, ZONA, TEKS_HUB, alamatHalaman, aturanZona, eksperimenUntukProyek } from "../content/lab.js";
import { cariProyek } from "../content/proyek.js";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");

test("setiap eksperimen lengkap dua bahasa dan menunjuk proyek yang ada", () => {
  for (const e of eksperimen) {
    assert.match(e.nomor, /^SDL-\d{2}$/);
    assert.ok(cariProyek(e.proyek), `${e.slug}: proyek ${e.proyek} tidak ada di content/proyek.js`);
    assert.ok(ZONA[e.zona]?.startsWith("https://"), `${e.slug}: asal zona harus https`);
    for (const teks of [e.jalur, e.judul, e.masalah, ...e.halaman.flatMap((h) => [h.judul, h.ket, h.meta])]) {
      assert.ok(teks.id?.trim() && teks.en?.trim(), `${e.slug}: ada teks yang kosong di satu bahasa`);
    }
  }
  const nomor = eksperimen.map((e) => e.nomor);
  assert.equal(new Set(nomor).size, nomor.length, "nomor SDL ganda");
  // beberapa eksperimen bisa berbagi zona; alamatnya /lab/<zona>/<kunci>, jadi kunci unik per zona
  for (const z of new Set(eksperimen.map((e) => e.zona))) {
    const kunci = eksperimen.filter((e) => e.zona === z).flatMap((e) => e.halaman.map((h) => h.kunci));
    assert.equal(new Set(kunci).size, kunci.length, `zona ${z}: kunci halaman ganda`);
  }
});

test("eksperimen 2 sampai 4 tinggal di zona flash-sale dan ikut diteruskan", () => {
  const { rewrites, redirects } = aturanZona();
  const asal = ZONA["flash-sale"];
  for (const k of ["bayar", "backup", "berkas"]) {
    assert.ok(rewrites.some((r) => r.source === `/lab/flash-sale/${k}` && r.destination === `${asal}/lab/flash-sale/${k}`), k);
  }
  // satu zona, satu aturan _next dan satu pengalihan akar, berapa pun eksperimennya
  assert.equal(rewrites.filter((r) => r.source.endsWith("/_next/:path+")).length, 1);
  assert.equal(redirects.length, 1);
  const e = eksperimen.find((x) => x.slug === "backup");
  assert.equal(alamatHalaman(e, e.halaman[0], "en"), "/lab/flash-sale/backup?bahasa=en");
});

test("alamat halaman membawa bahasa situs ke pilihan bahasa zona", () => {
  const e = eksperimenUntukProyek("flash-sale-lab");
  const [replay, skala] = e.halaman;
  assert.equal(alamatHalaman(e, replay, "id"), "/lab/flash-sale/replay");
  assert.equal(alamatHalaman(e, replay, "en"), "/lab/flash-sale/replay?bahasa=en");
  assert.equal(alamatHalaman(e, skala, "id"), "/lab/flash-sale/skala");
  assert.equal(eksperimenUntukProyek("jeda"), null);
});

test("rewrite hanya meneruskan halaman yang dipajang dan aset _next-nya", () => {
  const { rewrites, redirects } = aturanZona();
  const asal = ZONA["flash-sale"];
  const ke = (src) => rewrites.find((r) => r.source === src)?.destination;
  assert.equal(ke("/lab/flash-sale/replay"), `${asal}/lab/flash-sale/replay`);
  assert.equal(ke("/lab/flash-sale/skala/:path+"), `${asal}/lab/flash-sale/skala/:path+`);
  assert.equal(ke("/lab/flash-sale/_next/:path+"), `${asal}/lab/flash-sale/_next/:path+`);
  // toko di akar zona butuh API, jadi tidak diteruskan
  assert.equal(ke("/lab/flash-sale"), undefined);
  assert.deepEqual(redirects, [{ source: "/lab/flash-sale", destination: "/lab", permanent: false }]);
});

test("proxy bahasa melewati halaman zona tapi tetap memberi bahasa pada hub /lab", () => {
  const literal = baca("proxy.js").match(/matcher:\s*\[\s*("[^"]+")\s*\]/)[1];
  const pola = new RegExp(`^${Function(`return ${literal}`)()}$`);
  for (const lewat of ["/lab/flash-sale/replay", "/lab/flash-sale/_next/static/chunks/a.js", "/lab/flash-sale/skala"]) {
    assert.equal(pola.test(lewat), false, `${lewat} tidak boleh diberi awalan bahasa`);
  }
  for (const kena of ["/lab", "/", "/proyek/flash-sale-lab"]) {
    assert.equal(pola.test(kena), true, `${kena} harus lewat proxy bahasa`);
  }
});

test("setiap teks t(...) di hub lab ada di kedua bahasa", () => {
  const pakai = [...baca("components/lab/HubLab.jsx").matchAll(/\bt\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.ok(pakai.length > 0);
  for (const k of pakai) assert.ok(TEKS_HUB[k]?.id?.trim() && TEKS_HUB[k]?.en?.trim(), `TEKS_HUB.${k} tidak lengkap`);
});
