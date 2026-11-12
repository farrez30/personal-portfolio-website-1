"""Timpa logo hasil Flow di muka cakram dengan piksel logo asli.

Nano Banana menggambar ulang logo, jadi bentuknya bisa bergeser sedikit. Skrip ini mencari
letak dan skala logo di gambar (korelasi ternormalisasi lintas skala), menghapus tinta logo
buatan AI di kotak itu, lalu menempel logo asli tanpa diubah bentuk dan warnanya.

    python scripts/logo-cakram.py <gambar-flow> <logo-asli> <keluar.png> [--latar-putih]

`--latar-putih` untuk logo JPG/PNG tanpa alfa yang latarnya putih.
Butuh numpy dan Pillow (`uv run --no-project --with numpy --with pillow`).
"""
import sys

import numpy as np
from PIL import Image, ImageFilter


def topeng_logo(logo, latar_putih):
    rgba = np.asarray(logo.convert("RGBA")).astype(np.float32) / 255
    alfa = rgba[..., 3]
    if latar_putih:
        # Jarak dari putih jadi alfa, supaya tepi antialias ikut halus.
        jarak = 1 - rgba[..., :3].min(axis=2)
        alfa = np.clip((jarak - 0.06) / 0.25, 0, 1) * alfa
    return rgba[..., :3], alfa


def ncc_peta(gambar, templat):
    """Korelasi silang ternormalisasi lewat FFT, sama dengan cv2.TM_CCOEFF_NORMED."""
    H, W = gambar.shape
    h, w = templat.shape
    t = templat - templat.mean()
    tn = np.sqrt((t ** 2).sum()) + 1e-9
    F = np.fft.rfft2(gambar, (H, W))
    T = np.fft.rfft2(t[::-1, ::-1], (H, W))
    kor = np.fft.irfft2(F * T, (H, W))[h - 1:, w - 1:]
    ii = np.pad(gambar.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    ii2 = np.pad((gambar ** 2).cumsum(0).cumsum(1), ((1, 0), (1, 0)))

    def jumlah(a):
        return a[h:, w:] - a[:-h, w:] - a[h:, :-w] + a[:-h, :-w]

    s, s2 = jumlah(ii), jumlah(ii2)
    var = np.maximum(s2 - s ** 2 / (h * w), 1e-9)
    return kor[: var.shape[0], : var.shape[1]] / (np.sqrt(var) * tn)


def cari(gambar_abu, logo_rgb, alfa):
    abu_logo = 1 - (1 - logo_rgb.mean(axis=2)) * alfa  # logo di atas putih
    terbaik = (-1, None)
    W = gambar_abu.shape[1]
    # AI kadang memipihkan atau melebarkan logo sedikit, jadi rasio ikut dicari (±15%).
    for rasio in (1.0, 0.92, 1.08, 0.85, 1.15):
        for lebar in range(int(W * 0.15), int(W * 0.75), max(2, W // 200)):
            skala = lebar / abu_logo.shape[1]
            h = max(4, round(abu_logo.shape[0] * skala * rasio))
            if h >= gambar_abu.shape[0]:
                continue
            t = np.asarray(Image.fromarray((abu_logo * 255).astype(np.uint8)).resize((lebar, h), Image.LANCZOS)) / 255
            peta = ncc_peta(gambar_abu, t)
            i = np.unravel_index(np.argmax(peta), peta.shape)
            if peta[i] > terbaik[0]:
                terbaik = (float(peta[i]), (int(i[1]), int(i[0]), lebar, h))
    return terbaik


UKURAN = 640  # sisi akhir muka cakram; logo asli ditempel di ukuran ini supaya hanya diperkecil


def potong_cakram(gambar, sisi):
    """Potong kotak cakram dari foto Flow (latar kertas polos) lalu kecilkan ke `sisi`."""
    g = np.asarray(gambar).astype(np.float32) / 255
    sudut = np.concatenate([g[:20, :20].reshape(-1, 3), g[-20:, -20:].reshape(-1, 3), g[:20, -20:].reshape(-1, 3), g[-20:, :20].reshape(-1, 3)])
    beda = np.abs(g - np.median(sudut, axis=0)).max(axis=2) > 0.15
    # Kertas punya gradasi cahaya, jadi pakai baris dan kolom yang sebagian besar berbeda
    # dari kertas (melintasi cakram), bukan piksel satu per satu.
    kolom = np.where(beda.mean(axis=0) > 0.12)[0]
    baris = np.where(beda.mean(axis=1) > 0.12)[0]
    x0, x1 = kolom.min(), kolom.max()
    y0, y1 = baris.min(), baris.max()
    cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, max(x1 - x0, y1 - y0) / 2 + 4
    return gambar.crop((round(cx - r), round(cy - r), round(cx + r), round(cy + r))).resize((sisi, sisi), Image.LANCZOS)


def main():
    argumen = [a for a in sys.argv[1:] if not a.startswith("--")]
    latar_putih = "--latar-putih" in sys.argv
    sumber, asal, keluar = argumen
    gambar = potong_cakram(Image.open(sumber).convert("RGB"), UKURAN)
    logo = Image.open(asal)
    logo_rgb, alfa = topeng_logo(logo, latar_putih)

    # Cari di resolusi kecil dulu supaya cepat, lalu pakai koordinat di resolusi asli.
    kecil = 512 / gambar.width
    abu = np.asarray(gambar.resize((512, round(gambar.height * kecil))).convert("L")) / 255
    skor, (x, y, w, h) = cari(abu, logo_rgb, alfa)
    x, y, w, h = (round(v / kecil) for v in (x, y, w, h))
    print(f"skor {skor:.3f} kotak x={x} y={y} w={w} h={h}")
    if skor < 0.45:
        sys.exit("logo tidak ketemu dengan yakin; periksa gambarnya")

    # --tempel=<berkas>: logo untuk mencari letak berbeda dari logo yang ditempel, misalnya
    # versi gelap dicari lalu versi terang (bentuk sama, warna dibalik) ditempel di latar gelap.
    # Warna tinta AI tetap dikenali dari logo pencarian.
    palet_cari = logo_rgb[alfa > 0.9]
    tempel = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--tempel=")), None)
    if tempel:
        logo_rgb, alfa = topeng_logo(Image.open(tempel), False)

    # Kotak AI hanya penunjuk letak. Logo asli tetap memakai rasionya sendiri, dipusatkan
    # tegak di kotak AI, jadi tidak pernah ikut dipipihkan.
    ai_x, ai_y, ai_h = x, y, h
    h = round(alfa.shape[0] * w / alfa.shape[1])
    y = max(0, min(ai_y + (ai_h - h) // 2, gambar.height - h))

    g = np.asarray(gambar).astype(np.float32) / 255
    # Perkecil dalam bentuk premultiplied supaya warna piksel transparan (sering hitam)
    # tidak merembes jadi pinggiran gelap.
    def kecilkan(kanal):  # mode "F" supaya Pillow tidak mengolah alfa sendiri
        return np.asarray(Image.fromarray(kanal.astype(np.float32), "F").resize((w, h), Image.LANCZOS))

    a = np.clip(kecilkan(alfa), 0, 1)
    rgb = np.clip(np.dstack([kecilkan(logo_rgb[..., i] * alfa) for i in range(3)]) / np.maximum(a[..., None], 1e-3), 0, 1)

    # Kotak kerja dilebarkan: logo AI bisa sedikit lebih besar atau bergeser dari logo asli.
    m = min(max(round(w * 0.06), abs(ai_h - h) // 2 + 4), x, y, g.shape[1] - x - w, g.shape[0] - y - h)
    a = np.pad(a, m)
    rgb = np.pad(rgb, ((m, m), (m, m), (0, 0)), mode="edge")
    x, y, w, h = x - m, y - m, w + 2 * m, h + 2 * m
    kotak = g[y:y + h, x:x + w].copy()

    # Hapus tinta AI hanya di sekitar tinta logo asli (logo AI menumpuk hampir tepat di
    # sana), supaya tekstur cetakan di luar logo tidak tersentuh. Lubangnya diisi dengan
    # konvolusi ternormalisasi: rata-rata piksel latar di sekitarnya, bukan satu warna.
    def lebarkan(m, r):
        return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(r))) / 255

    def buram(x, r):  # Gauss float terpisah; versi uint8 Pillow membulatkan bobot kecil jadi nol
        t = np.arange(-int(3 * r), int(3 * r) + 1)
        k = np.exp(-(t ** 2) / (2 * r * r))
        k /= k.sum()
        p = len(t) // 2
        y_ = np.pad(x, [(p, p), (0, 0)] + [(0, 0)] * (x.ndim - 2), mode="reflect")
        y_ = sum(k[i] * y_[i:i + x.shape[0]] for i in range(len(t)))
        y_ = np.pad(y_, [(0, 0), (p, p)] + [(0, 0)] * (x.ndim - 2), mode="reflect")
        return sum(k[i] * y_[:, i:i + x.shape[1]] for i in range(len(t)))

    dekat = lebarkan((a > 0.05).astype(np.float32), 2 * max(3, w // 30) + 1)
    lokal = buram(kotak, w / 25)
    beda = np.abs(kotak - lokal).max(axis=2)
    tinta_ai = (a > 0.05).astype(np.float32)
    # Di sekitar logo asli dan di kotak logo AI (bisa lebih lebar dari logo asli), hapus hanya piksel yang warnanya
    # mirip warna tinta logo asli, supaya latar bertekstur di sekitarnya tidak ikut rata.
    palet = np.concatenate([rgb[a > 0.9], palet_cari])
    if len(palet):
        palet = palet[np.linspace(0, len(palet) - 1, min(96, len(palet))).astype(int)]
        jarak = np.min(np.linalg.norm(kotak[..., None, :] - palet[None, None], axis=-1), axis=-1)
        kotak_ai = np.zeros_like(a)
        kotak_ai[max(0, ai_y - y):ai_y - y + ai_h, ai_x - x:ai_x - x + w - 2 * m] = 1
        tinta_ai = np.maximum(tinta_ai, np.maximum(kotak_ai, dekat) * (jarak < 0.16) * (beda > 0.04))
    tinta_ai = lebarkan(tinta_ai, 3)
    keras = tinta_ai
    sisa = 1 - keras
    isi = buram(kotak * sisa[..., None], w / 12) / np.maximum(buram(sisa, w / 12)[..., None], 1e-6)
    # Tepi tambalan dibaurkan supaya tidak terlihat seperti potongan kertas.
    halus = np.clip(buram(keras, max(2, w / 80)) * 1.4, 0, 1)
    bersih = kotak * (1 - halus[..., None]) + np.clip(isi, 0, 1) * halus[..., None]
    jadi = bersih * (1 - a[..., None]) + rgb * a[..., None]
    g[y:y + h, x:x + w] = jadi
    Image.fromarray((g * 255).round().astype(np.uint8)).save(keluar)
    print("tersimpan", keluar)


if __name__ == "__main__":
    main()
