// Akses katalog bank gerak di /bank (ADR 0028): kode tamu, tiket, rewrite ke zona, dan koleksinya.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import {
  asalSama, bacaTiket, buatPenahan, buatTiket, kodeAcak, kodeBerlaku, kodeLayak, kunciBank, rapikanKode, sidikKode, UMUR_TIKET,
} from "../lib/bank/akses.js";
import { aturanBank } from "../content/bank.js";
import { KodeBank } from "../cms/koleksi/KodeBank.js";

const akar = new URL("../", import.meta.url);
const baca = (p) => readFileSync(new URL(p, akar), "utf8");
const kunci = kunciBank("rahasia-uji");

test("sidik kode tidak peduli spasi, tanda hubung, dan huruf besar, tapi peduli isinya", () => {
  assert.equal(sidikKode("Abcd-Efgh-Jkmn ", kunci), sidikKode("abcd-efghjkmn", kunci));
  assert.notEqual(sidikKode("abcd-efgh-jkmn", kunci), sidikKode("abcd-efgh-jkmp", kunci));
  // kunci lain, sidik lain: sidik dari DB tidak berguna tanpa PAYLOAD_SECRET
  assert.notEqual(sidikKode("abcd-efgh-jkmn", kunci), sidikKode("abcd-efgh-jkmn", kunciBank("lain")));
  assert.match(sidikKode("abcd-efgh-jkmn", kunci), /^[0-9a-f]{64}$/);
  assert.throws(() => kunciBank(""), /PAYLOAD_SECRET/);
});

test("kode pendek ditolak, panjang minimal dihitung tanpa spasi", () => {
  assert.equal(kodeLayak("abcd-efgh-jkmn"), true); // 12 karakter tanpa tanda hubung
  assert.match(String(kodeLayak("abcd-efgh-jkm")), /minimal 12/); // 11
  assert.match(String(kodeLayak("abc def ghi j")), /minimal 12/); // 10 tanpa spasi
  assert.match(String(kodeLayak("")), /minimal 12/);
  assert.equal(rapikanKode(" A-B–c "), "abc");
});

test("kode acak terbaca dan cukup panjang", () => {
  const k = kodeAcak();
  assert.match(k, /^[a-z2-9]{4}(-[a-z2-9]{4}){3}$/);
  assert.doesNotMatch(k, /[01ilo]/);
  assert.equal(kodeLayak(k), true);
  assert.notEqual(kodeAcak(), kodeAcak());
});

test("tiket sah dibaca, tiket rusak, palsu, atau kedaluwarsa ditolak", () => {
  const t0 = 1_800_000_000;
  const tiket = buatTiket({ id: 7, sekarang: t0 }, kunci);
  assert.equal(bacaTiket(tiket, kunci, t0 + 10), "7");
  assert.equal(bacaTiket(tiket, kunci, t0 + UMUR_TIKET + 1), null, "kedaluwarsa");
  assert.equal(bacaTiket(tiket, kunciBank("lain"), t0), null, "kunci lain");
  const [isi, sig] = tiket.split(".");
  const isiLain = Buffer.from(JSON.stringify({ k: "8", e: t0 + 999 })).toString("base64url");
  assert.equal(bacaTiket(`${isiLain}.${sig}`, kunci, t0), null, "id ditukar");
  assert.equal(bacaTiket(`${isi}.${sig}x`, kunci, t0), null, "tanda tangan diubah");
  assert.equal(bacaTiket(`${tiket}.lagi`, kunci, t0), null, "bagian berlebih");
  for (const sampah of [undefined, "", "a", "a.b", "..", "e30.e30"]) assert.equal(bacaTiket(sampah, kunci, t0), null, String(sampah));
});

test("kode berlaku hanya bila aktif dan belum lewat batasnya", () => {
  const kini = new Date("2026-11-23T10:00:00Z");
  assert.equal(kodeBerlaku({ aktif: true }, kini), true);
  assert.equal(kodeBerlaku({ aktif: true, kedaluwarsa: "2026-11-24T00:00:00Z" }, kini), true);
  assert.equal(kodeBerlaku({ aktif: true, kedaluwarsa: "2026-11-23T09:59:59Z" }, kini), false);
  assert.equal(kodeBerlaku({ aktif: false }, kini), false);
  assert.equal(kodeBerlaku(null, kini), false);
  assert.equal(kodeBerlaku(undefined, kini), false);
});

test("penahan menahan sesudah batas percobaan salah dan lepas sesudah jendelanya", () => {
  const p = buatPenahan({ batas: 3, jendela: 1000 });
  for (let i = 0; i < 3; i++) {
    assert.equal(p.tertahan("a", i), false);
    p.gagal("a", i);
  }
  assert.equal(p.tertahan("a", 10), true);
  assert.equal(p.tertahan("b", 10), false, "alamat lain tidak ikut tertahan");
  assert.equal(p.tertahan("a", 1001), false, "jendela lewat");
});

test("kiriman form hanya diterima dari situs sendiri", () => {
  const req = (h) => ({ headers: new Headers(h) });
  assert.equal(asalSama(req({ origin: "https://farrez.vercel.app", host: "farrez.vercel.app" })), true);
  assert.equal(asalSama(req({ origin: "https://farrez.vercel.app", "x-forwarded-host": "farrez.vercel.app", host: "x" })), true);
  assert.equal(asalSama(req({ origin: "https://jahat.example", host: "farrez.vercel.app" })), false);
  assert.equal(asalSama(req({ host: "farrez.vercel.app" })), false, "tanpa origin");
  assert.equal(asalSama(req({ origin: "null", host: "farrez.vercel.app" })), false);
});

test("/bank diteruskan ke zona dan tidak diberi awalan bahasa", () => {
  const { rewrites } = aturanBank("https://zona.example");
  assert.deepEqual(rewrites, [
    { source: "/bank", destination: "https://zona.example/bank" },
    { source: "/bank/:path*", destination: "https://zona.example/bank/:path*" },
  ]);
  assert.match(baca("next.config.mjs"), /aturanBank\(\)\.rewrites/);
  const literal = baca("proxy.js").match(/matcher:\s*\[\s*("[^"]+")\s*\]/)[1];
  const pola = new RegExp(`^${Function(`return ${literal}`)()}$`);
  for (const lewat of ["/bank", "/bank/masuk", "/bank/pola/01", "/bank/_next/static/a.js"]) assert.equal(pola.test(lewat), false, lewat);
  for (const kena of ["/", "/lab", "/proyek/jeda"]) assert.equal(pola.test(kena), true, kena);
});

// ---- koleksi kode-bank --------------------------------------------------------------------
const kait = KodeBank.hooks.beforeChange[0];
const reqUji = { payload: { secret: "rahasia-uji" } };

test("kode disimpan sebagai sidik, kolom kodenya tidak ikut tersimpan", () => {
  const data = kait({ data: { nama: "Zidni", kode: "abcd-efgh-jkmn" }, operation: "create", req: reqUji });
  assert.equal(data.kode, undefined);
  assert.equal(data.sidik, sidikKode("abcd-efgh-jkmn", kunci));
  const kolom = KodeBank.fields.find((f) => f.name === "kode");
  assert.equal(kolom.virtual, true);
  // Payload menjadikan field virtual read-only di form admin kecuali diminta lain
  // (payload/dist/fields/config/sanitize.js); tanpa ini kode tidak bisa ditempel di /admin.
  assert.equal(kolom.admin.readOnly, false);
  assert.equal(KodeBank.fields.find((f) => f.name === "sidik").admin.hidden, true);
});

test("kode pendek atau kosong saat membuat ditolak, ubah tanpa kode baru tetap jalan", () => {
  assert.throws(() => kait({ data: { nama: "A", kode: "pendek" }, operation: "create", req: reqUji }), /minimal 12/);
  assert.throws(() => kait({ data: { nama: "A" }, operation: "create", req: reqUji }), /Isi kode/);
  const ubah = kait({ data: { aktif: false }, operation: "update", req: reqUji });
  assert.deepEqual(ubah, { aktif: false });
});

test("koleksi hanya untuk admin dan terpasang di config", () => {
  for (const aksi of ["read", "create", "update", "delete"]) {
    assert.equal(KodeBank.access[aksi]({ req: {} }), false, aksi);
    assert.equal(KodeBank.access[aksi]({ req: { user: { id: 1 } } }), true, aksi);
  }
  assert.match(baca("payload.config.js"), /collections: \[[^\]]*KodeBank/);
});

test("migrasi terakhir memuat tabel kode_bank", () => {
  const dir = new URL("../cms/migrasi/", import.meta.url);
  const snap = readdirSync(dir).filter((f) => f.endsWith(".json")).sort().at(-1);
  const tabel = JSON.parse(readFileSync(new URL(snap, dir), "utf8")).tables;
  const t = Object.values(tabel).find((x) => x.name === "kode_bank");
  assert.ok(t, "tabel kode_bank belum ada (npm run cms:migrasi -- migrate:create kode_bank)");
  for (const k of ["nama", "sidik", "aktif", "kedaluwarsa", "terakhir_masuk"]) assert.ok(t.columns[k], k);
  assert.equal(t.columns.kode, undefined, "kode polos tidak boleh punya kolom");
});

test("cookie tamu httpOnly dan route menolak asal lain", () => {
  const masuk = baca("app/(payload)/api/bank/masuk/route.js");
  assert.match(masuk, /httpOnly: true/);
  assert.match(masuk, /asalSama\(req\)/);
  assert.match(masuk, /penahan\.gagal/);
  assert.match(baca("app/(payload)/api/bank/keluar/route.js"), /asalSama\(req\)/);
  // sesi hanya menjawab peran, tidak pernah dokumen akunnya
  const sesi = baca("app/(payload)/api/bank/sesi/route.js");
  assert.match(sesi, /no-store/);
  assert.doesNotMatch(sesi, /jawab\(\{[^}]*user/);
});
