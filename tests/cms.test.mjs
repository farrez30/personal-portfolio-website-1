// CMS portofolio (ADR 0026): penyusunan isi dari berkas + CMS, aturan kolom, kolom teks,
// penjaga migrasi, login Google, tombol intip sandi, dan kunci pembuatan akun.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { proyek } from "../content/proyek.js";
import { KLIEN } from "../content/klien.js";
import { situs } from "../content/situs.js";
import { susunKlien, susunProyek, susunSitus, ratakanKlien } from "../lib/isi/gabung.js";
import { dataTeks, gabungPesan, kolomTeks, namaKolom } from "../cms/teks.js";
import { jalurAset, placeholderSama, slugValid, tautanHttps, tautanKlien, teksProyekAman, warnaHex } from "../cms/aturan.js";
import { bacaIdToken, COOKIE_STATE, COOKIE_TUJUAN, emailSah, pasangSesi, stateCocok, tujuanAman, tukarKode, urlMasuk } from "../cms/google.js";
import { NextResponse } from "next/server.js";
import { generatePayloadCookie } from "payload/shared";
import { pasangTombolIntip, TANDA } from "../components/admin/intip-sandi.js";
import { Users } from "../cms/koleksi/Users.js";
import { Klien } from "../cms/koleksi/Klien.js";
import { Proyek } from "../cms/koleksi/Proyek.js";
import { BAGIAN_TEKS, Teks } from "../cms/global/Teks.js";

const baca = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8"));
const pesan = { id: baca("messages/id.json"), en: baca("messages/en.json") };
const slugs = (xs) => xs.map((x) => x.slug);
// Dokumen CMS seperti hasil find({ locale: "all" }), urutan lewat _order.
const docProyek = (p, i, ubah = {}) => ({ slug: p.slug, _order: `a${String(i).padStart(2, "0")}`, tampil: true, judul: p.judul, ringkas: p.ringkas, tautan: p.tautan, ...ubah });
const semuaDocProyek = (ubah = {}) => proyek.map((p, i) => docProyek(p, i, ubah[p.slug]));
// Seperti seed (scripts/cms/isi.mjs): klien pribadi dengan album tanpa teks kerja sendiri.
const docKlien = (k, i, ubah = {}) => ({ ...k, kerja: k.album ? { id: null, en: null } : (k.kerja ?? { id: null, en: null }), _order: `b${String(i).padStart(2, "0")}`, tampil: true, ...ubah });
const semuaDocKlien = (ubah = {}) => ratakanKlien(KLIEN).map((k, i) => docKlien(k, i, ubah[k.slug]));

// ---- susunProyek -------------------------------------------------------------------------

test("tanpa CMS (DB kosong atau tidak disetel) situs memakai berkas apa adanya", () => {
  assert.equal(susunProyek(proyek, null), proyek);
  assert.equal(susunKlien(KLIEN, null, proyek), KLIEN);
  assert.equal(susunSitus(situs, null), situs);
});

test("proyek yang dimatikan Tampil hilang, sisanya mengikuti urutan CMS", () => {
  const docs = semuaDocProyek({ jeda: { tampil: false } });
  docs.find((d) => d.slug === "d-day")._order = "a!"; // diseret ke paling atas
  const hasil = susunProyek(proyek, docs);
  assert.equal(hasil[0].slug, "d-day");
  assert.ok(!slugs(hasil).includes("jeda"));
  assert.equal(hasil.length, proyek.length - 1);
});

test("teks proyek dari CMS menang, bahasa yang kosong jatuh ke berkas", () => {
  const p = proyek.find((x) => x.slug === "fifofun");
  const hasil = susunProyek(proyek, semuaDocProyek({ fifofun: { ringkas: { id: "Ringkasan baru.", en: "" } } }));
  const f = hasil.find((x) => x.slug === "fifofun");
  assert.equal(f.ringkas.id, "Ringkasan baru.");
  assert.equal(f.ringkas.en, p.ringkas.en);
  // Kolom yang tidak disunting di CMS (arsitektur, buklet, layar) tetap dari berkas.
  assert.equal(f.arsitektur, p.arsitektur);
  assert.equal(f.layar, p.layar);
});

test("mengosongkan tautan di CMS mencabut tautannya, tidak kembali ke berkas", () => {
  const hasil = susunProyek(proyek, semuaDocProyek({ fifofun: { tautan: { situs: "", repo: null, kasus: "https://coderoach.id/work/fifofun" } } }));
  assert.deepEqual(hasil.find((x) => x.slug === "fifofun").tautan, { kasus: "https://coderoach.id/work/fifofun" });
});

test("album baru di kode yang belum di-seed tetap tampil di ujung; slug CMS tanpa album di kode diabaikan", () => {
  const docs = semuaDocProyek().filter((d) => d.slug !== "flash-sale-lab");
  docs.push({ slug: "hantu", _order: "a0", tampil: true });
  const hasil = susunProyek(proyek, docs);
  assert.equal(hasil.at(-1).slug, "flash-sale-lab");
  assert.ok(!slugs(hasil).includes("hantu"));
});

// ---- susunKlien --------------------------------------------------------------------------

test("klien yang disembunyikan hilang dari daftarnya, klien lain tetap", () => {
  const hasil = susunKlien(KLIEN, semuaDocKlien({ "raja-roti": { tampil: false } }), proyek);
  assert.ok(!slugs(hasil).includes("raja-roti"));
  assert.ok(slugs(hasil).includes("uruzin"));
  assert.equal(hasil.length, KLIEN.length - 1);
});

test("box set: anak disusun kembali di bawah induk, induk yang disembunyikan ikut menyembunyikan anaknya", () => {
  const utuh = susunKlien(KLIEN, semuaDocKlien(), proyek);
  assert.deepEqual(slugs(utuh.find((k) => k.slug === "masaya-food").anak), ["chicken-wow", "geprek-wow"]);
  assert.ok(!slugs(utuh).includes("chicken-wow"), "anak tidak muncul sebagai klien tersendiri");

  const satuAnak = susunKlien(KLIEN, semuaDocKlien({ "geprek-wow": { tampil: false } }), proyek);
  assert.deepEqual(slugs(satuAnak.find((k) => k.slug === "masaya-food").anak), ["chicken-wow"]);

  const tanpaInduk = susunKlien(KLIEN, semuaDocKlien({ "masaya-food": { tampil: false } }), proyek);
  assert.ok(!slugs(tanpaInduk).some((s) => ["masaya-food", "chicken-wow", "geprek-wow"].includes(s)));
});

test("hasil susun klien tanpa suntingan sama persis dengan berkas", () => {
  assert.deepEqual(susunKlien(KLIEN, semuaDocKlien(), proyek), KLIEN);
});

test("kartu proyek pribadi ikut ringkasan album yang disunting, dan hilang bila albumnya disembunyikan", () => {
  const p = susunProyek(proyek, semuaDocProyek({ jeda: { ringkas: { id: "Jurnal baru.", en: "New journal." } } }));
  assert.deepEqual(susunKlien(KLIEN, semuaDocKlien(), p).find((k) => k.slug === "jeda").kerja, { id: "Jurnal baru.", en: "New journal." });

  const tanpaJeda = susunProyek(proyek, semuaDocProyek({ jeda: { tampil: false } }));
  assert.ok(!slugs(susunKlien(KLIEN, semuaDocKlien(), tanpaJeda)).includes("jeda"));
});

test("klien baru dari CMS tampil dengan isiannya sendiri", () => {
  const baru = { slug: "toko-baru", nama: "Toko Baru", kelompok: "coderoach", cakram: "/assets/klien/cakram/uruzin.webp", industri: { id: "Ritel", en: "Retail" }, kerja: { id: "Situs toko.", en: "A shop site." }, jenis: ["website"], tampil: true, _order: "b99" };
  const hasil = susunKlien(KLIEN, [...semuaDocKlien(), baru], proyek);
  const k = hasil.find((x) => x.slug === "toko-baru");
  assert.equal(k.nama, "Toko Baru");
  assert.deepEqual(k.industri, { id: "Ritel", en: "Retail" });
});

test("tautan pribadi: nilai CMS yang terisi menimpa berkas, yang kosong tidak", () => {
  assert.deepEqual(susunSitus(situs, { email: "baru@contoh.test", github: "" }), { ...situs, email: "baru@contoh.test" });
});

// ---- teks UI -----------------------------------------------------------------------------

test("teks UI: nilai CMS menimpa, kolom kosong memakai berkas, kunci bertanda hubung tetap", () => {
  const cms = dataTeks(pesan.id);
  cms.klien.judul = "Judul baru";
  cms.klien.jenis.company_profile = "Profil usaha";
  cms.kontak.judul = "";
  const hasil = gabungPesan(pesan.id, cms);
  assert.equal(hasil.klien.judul, "Judul baru");
  assert.equal(hasil.klien.jenis["company-profile"], "Profil usaha");
  assert.equal(hasil.kontak.judul, pesan.id.kontak.judul);
  assert.deepEqual(gabungPesan(pesan.en, dataTeks(pesan.en)), pesan.en);
  assert.deepEqual(gabungPesan(pesan.id, null), pesan.id);
});

test("setiap kunci teks punya kolom di admin, dan tiap global di bawah batas 100 kolom Postgres", () => {
  const daun = (fields) => fields.flatMap((f) => (f.type === "group" ? daun(f.fields) : [f]));
  assert.deepEqual(Teks.map((g) => g.slug), BAGIAN_TEKS.map((b) => `teks-${b}`));
  assert.deepEqual(BAGIAN_TEKS, Object.keys(pesan.id));
  let total = 0;
  for (const [i, g] of Teks.entries()) {
    const n = daun(g.fields).length;
    const hitung = (o) => Object.values(o).reduce((a, v) => a + (typeof v === "object" ? hitung(v) : 1), 0);
    assert.equal(n, hitung(pesan.id[BAGIAN_TEKS[i]]), g.slug);
    assert.ok(n < 100, `${g.slug}: ${n} kolom, pecah jadi dua global`);
    total += n;
  }
  assert.ok(total > 150);
});

test("kolom teks menolak placeholder yang hilang atau bertambah", () => {
  const [kolom] = kolomTeks({ bab: "Bab {n} dari {total}" });
  assert.equal(kolom.validate("Chapter {n} of {total}"), true);
  assert.equal(kolom.validate(""), true, "kosong boleh, memakai berkas");
  assert.match(String(kolom.validate("Bab {n}")), /\{n\} \{total\}/);
  assert.notEqual(placeholderSama("Halo {nama}", "Halo"), true);
});

test("nama kolom Payload tanpa tanda hubung", () => {
  assert.equal(namaKolom("company-profile"), "company_profile");
  const nama = (fields) => fields.flatMap((f) => [f.name, ...(f.fields ? nama(f.fields) : [])]);
  for (const g of Teks) for (const n of nama(g.fields)) assert.match(n, /^[A-Za-z0-9_]+$/, n);
});

// ---- aturan kolom ------------------------------------------------------------------------

test("aturan kolom menerima isi berkas yang sekarang (seed tidak akan ditolak)", () => {
  for (const p of proyek) {
    for (const b of ["id", "en"]) {
      assert.equal(teksProyekAman(p.judul[b]), true, `${p.slug} judul ${b}`);
      assert.equal(teksProyekAman(p.ringkas[b]), true, `${p.slug} ringkas ${b}`);
    }
    for (const u of Object.values(p.tautan ?? {})) assert.equal(tautanHttps(u), true, u);
    assert.equal(warnaHex(p.warna), true, p.slug);
  }
  for (const k of ratakanKlien(KLIEN)) {
    assert.equal(slugValid(k.slug), true, k.slug);
    assert.equal(jalurAset(k.cakram), true, k.cakram);
    assert.equal(tautanKlien(k.tautan), true, k.slug);
    if (k.album) assert.ok(proyek.some((p) => p.slug === k.album), k.album);
  }
});

test("aturan kolom menolak domain, rahasia, tautan liar, dan jalur keluar public", () => {
  assert.notEqual(teksProyekAman("Situsnya di toko.com"), true);
  assert.notEqual(teksProyekAman("Login lewat OAuth dan JWT"), true);
  assert.notEqual(teksProyekAman("https://contoh.test"), true);
  assert.notEqual(tautanHttps("http://contoh.test"), true);
  assert.notEqual(tautanHttps("javascript:alert(1)"), true);
  assert.notEqual(tautanKlien("https://contoh.test/work/a"), true);
  assert.notEqual(jalurAset("/assets/../../etc/passwd.png"), true);
  assert.notEqual(jalurAset("https://contoh.test/a.webp"), true);
  assert.notEqual(slugValid("Raja Roti"), true);
  assert.notEqual(warnaHex("red"), true);
});

test("validasi kolom klien dan proyek terpasang di koleksinya", () => {
  const kolom = (k, n) => k.fields.find((f) => f.name === n);
  assert.notEqual(kolom(Klien, "kerja").validate("", { siblingData: { kelompok: "coderoach" } }), true);
  assert.equal(kolom(Klien, "kerja").validate("", { siblingData: { kelompok: "pribadi" } }), true);
  assert.notEqual(kolom(Klien, "album").validate("hantu"), true);
  assert.equal(kolom(Klien, "album").validate("jeda"), true);
  assert.equal(kolom(Proyek, "ringkas").validate, teksProyekAman);
  assert.equal(Proyek.access.create(), false, "album baru hanya lewat kode");
  assert.equal(Proyek.access.delete(), false);
  assert.equal(Klien.access.read({ req: {} }), false, "REST klien tertutup untuk publik");
});

// ---- penjaga migrasi ---------------------------------------------------------------------

test("migrasi terakhir memuat semua kolom teks dan jenis klien (kalau gagal: npm run cms:migrasi -- migrate:create nama)", () => {
  const dir = new URL("../cms/migrasi/", import.meta.url);
  const snap = readdirSync(dir).filter((f) => f.endsWith(".json")).sort().at(-1);
  assert.ok(snap, "belum ada migrasi");
  const s = JSON.parse(readFileSync(new URL(snap, dir), "utf8"));
  assert.deepEqual(s.enums["public.enum_klien_jenis"].values, Object.keys(pesan.id.klien.jenis));
  const hitung = (o) => Object.values(o).reduce((a, v) => a + (typeof v === "object" ? hitung(v) : 1), 0);
  for (const b of BAGIAN_TEKS) {
    const t = s.tables[`public.teks_${b}_locales`];
    assert.ok(t, `tabel teks ${b} belum ada di migrasi`);
    const kolom = Object.keys(t.columns).filter((c) => !["id", "_locale", "_parent_id"].includes(c));
    assert.equal(kolom.length, hitung(pesan.id[b]), `teks ${b}: kunci di messages berubah`);
  }
  // Migrasi berupa .js, bukan .ts (Node tidak bisa memuat import tipe Payload tanpa kompilasi).
  assert.deepEqual(readdirSync(dir).filter((f) => f.endsWith(".ts")), []);
});

// ---- Google ------------------------------------------------------------------------------

const idToken = (klaim) => ["e30", Buffer.from(JSON.stringify(klaim)).toString("base64url"), "tanda"].join(".");
const klaimSah = { iss: "https://accounts.google.com", aud: "klien-123", exp: 2_000_000_000, email: "Farrez@Contoh.Test", email_verified: true };

test("Google: hanya klaim yang sah menghasilkan email, huruf kecil", () => {
  const cek = (ubah) => emailSah(bacaIdToken(idToken({ ...klaimSah, ...ubah })), { clientId: "klien-123", sekarang: 1_900_000_000 });
  assert.equal(cek({}), "farrez@contoh.test");
  assert.equal(cek({ aud: "klien-lain" }), null);
  assert.equal(cek({ iss: "https://penipu.test" }), null);
  assert.equal(cek({ exp: 1_800_000_000 }), null);
  assert.equal(cek({ email_verified: false }), null);
  assert.equal(cek({ email_verified: "true" }), null);
  assert.equal(bacaIdToken("bukan-token"), null);
  assert.equal(bacaIdToken(null), null);
});

test("Google: state dibandingkan utuh, kosong selalu ditolak", () => {
  assert.equal(stateCocok("abc", "abc"), true);
  assert.equal(stateCocok("abc", "abd"), false);
  assert.equal(stateCocok("abc", "abcd"), false);
  assert.equal(stateCocok(undefined, "abc"), false);
  assert.equal(stateCocok("", ""), false);
});

test("Google: URL masuk meminta scope email dan pilih akun", () => {
  const u = new URL(urlMasuk({ clientId: "klien-123", redirectUri: "https://farrez.vercel.app/api/google/balik", state: "s1" }));
  assert.equal(u.origin, "https://accounts.google.com");
  assert.equal(u.searchParams.get("scope"), "openid email");
  assert.equal(u.searchParams.get("prompt"), "select_account");
  assert.equal(u.searchParams.get("state"), "s1");
  assert.equal(u.searchParams.get("response_type"), "code");
});

test("Google: kode ditukar dengan POST form; respons gagal jadi null", async () => {
  let dikirim;
  const ok = async (url, init) => ((dikirim = { url, body: String(init.body) }), { ok: true, json: async () => ({ id_token: "t" }) });
  assert.equal(await tukarKode({ code: "k", clientId: "c", clientSecret: "r", redirectUri: "u", fetchFn: ok }), "t");
  assert.equal(dikirim.url, "https://oauth2.googleapis.com/token");
  assert.match(dikirim.body, /grant_type=authorization_code/);
  const gagal = async () => ({ ok: false, json: async () => ({}) });
  assert.equal(await tukarKode({ code: "k", clientId: "c", clientSecret: "r", redirectUri: "u", fetchFn: gagal }), null);
});

test("Google: respons balikan membawa cookie sesi Payload dan menghapus cookie state", () => {
  const cookie = generatePayloadCookie({
    collectionAuthConfig: { cookies: { sameSite: "Lax", secure: true }, tokenExpiration: Users.auth.tokenExpiration },
    cookiePrefix: "payload",
    token: "token-uji",
    returnCookieAsObject: true,
  });
  const header = pasangSesi(NextResponse.redirect("https://contoh.test/admin"), cookie).headers.getSetCookie();
  const sesi = header.find((h) => h.startsWith("payload-token="));
  assert.ok(sesi, `cookie sesi hilang: ${JSON.stringify(header)}`);
  assert.match(sesi, /payload-token=token-uji/);
  assert.match(sesi, /HttpOnly/i);
  assert.match(sesi, /Secure/i);
  assert.match(sesi, /SameSite=lax/i);
  assert.match(sesi, /Path=\//);
  assert.ok(header.some((h) => h.startsWith(`${COOKIE_STATE}=;`) && /Path=\/api\/google/.test(h)), "cookie state tidak dihapus");
});

test("tujuan sesudah login Google hanya /admin atau /bank di situs ini", () => {
  for (const ok of ["/bank", "/bank/pola/01?x=1", "/admin", "/admin/collections/kode-bank"]) assert.equal(tujuanAman(ok), ok, ok);
  for (const buruk of [undefined, "", "bank", "//jahat.example/bank", "/\\jahat.example", "https://jahat.example/bank", "/bankir", "/admin2", "/api/bank/sesi", "javascript:alert(1)", "/bank\n", `/bank/${"a".repeat(300)}`]) {
    assert.equal(tujuanAman(buruk), null, String(buruk));
  }
});

test("login Google membawa tujuan lewat cookie dan menghapusnya sesudah masuk", async () => {
  const cookie = await generatePayloadCookie({
    collectionAuthConfig: { cookies: { sameSite: "Lax", secure: true }, tokenExpiration: Users.auth.tokenExpiration },
    cookiePrefix: "payload",
    token: "token-uji",
    returnCookieAsObject: true,
  });
  const header = pasangSesi(NextResponse.redirect("https://contoh.test/bank"), cookie).headers.getSetCookie();
  assert.ok(header.some((h) => h.startsWith(`${COOKIE_TUJUAN}=;`) && /Path=\/api\/google/.test(h)), "cookie tujuan tidak dihapus");
  const teks = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  const mulai = teks("app/(payload)/api/google/mulai/route.js");
  assert.match(mulai, /tujuanAman\(/);
  assert.match(mulai, /COOKIE_TUJUAN/);
  const balik = teks("app/(payload)/api/google/balik/route.js");
  assert.match(balik, /tujuanAman\(req\.cookies\.get\(COOKIE_TUJUAN\)/);
  assert.match(teks("components/admin/MasukGoogle.jsx"), /\/api\/google\/mulai\?ke=/);
});

// ---- tombol intip sandi -------------------------------------------------------------------

function kolomPalsu() {
  const atribut = {};
  const tombol = { atribut: {}, pendengar: {}, setAttribute(k, v) { this.atribut[k] = v; }, addEventListener(k, f) { this.pendengar[k] = f; } };
  const input = {
    type: "password", spellcheck: true, setelah: null,
    setAttribute: (k, v) => (atribut[k] = v),
    ownerDocument: { createElement: () => tombol },
    after(el) { this.setelah = el; },
  };
  return { input, tombol, atribut };
}

test("tombol intip: ganti type dan label, tidak mencuri fokus, mati saat dikirim", () => {
  const { input, tombol, atribut } = kolomPalsu();
  const atur = pasangTombolIntip(input);
  assert.equal(input.setelah, tombol);
  assert.equal(tombol.type, "button");
  assert.ok(TANDA in atribut);
  assert.equal(atribut.autocapitalize, "none");
  assert.equal(input.spellcheck, false);
  assert.equal(tombol.atribut["aria-label"], "Tampilkan sandi");
  assert.equal(tombol.atribut["aria-pressed"], "false");

  tombol.pendengar.click();
  assert.equal(input.type, "text");
  assert.equal(tombol.atribut["aria-label"], "Sembunyikan sandi");
  assert.equal(tombol.atribut["aria-pressed"], "true");

  let dicegah = false;
  tombol.pendengar.mousedown({ preventDefault: () => (dicegah = true) });
  assert.ok(dicegah, "fokus tetap di kolom");

  atur(false);
  assert.equal(input.type, "password");
});

// ---- akun --------------------------------------------------------------------------------

test("akun baru ditolak tanpa admin yang masuk, termasuk lewat halaman buat akun pertama", () => {
  const [kait] = Users.hooks.beforeChange;
  const data = { email: "x@contoh.test" };
  assert.throws(() => kait({ operation: "create", req: { context: {} }, data }), /cms:akun/);
  assert.equal(kait({ operation: "create", req: { user: { id: 1 }, context: {} }, data }), data);
  assert.equal(kait({ operation: "create", req: { context: { izinkanAkunBaru: true } }, data }), data);
  assert.equal(kait({ operation: "update", req: { context: {} }, data }), data);
  assert.equal(Users.auth.maxLoginAttempts, 5);
});
