# Tekstur lantai beton dunia toko kaset (lembar look-dev, docs/look-dev.md).
# Dibuat sekali di sini, bukan di peramban: versi kanvas 2D terukur sekitar 150 ms sinkron per
# peta saat dunia dimuat, dan ular loader tersendat.
#   uv run --no-project --with numpy --with pillow python -I scripts/beton.py public/assets/dunia
# Noda dibuat dengan menyaring derau di ranah frekuensi (FFT), jadi ubinnya menyambung sendiri
# di keempat sisi tanpa jahitan.
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

N = 512
acak = np.random.default_rng(31)


def noda(skala):
    """Derau halus yang bisa diulang: derau putih disaring gaussian dengan lebar `skala` px."""
    f = np.fft.fftfreq(N)
    fx, fy = np.meshgrid(f, f)
    saring = np.exp(-(fx**2 + fy**2) * (np.pi * skala) ** 2 * 2)
    d = np.real(np.fft.ifft2(np.fft.fft2(acak.standard_normal((N, N))) * saring))
    return (d - d.mean()) / d.std()


def goresan(jumlah, lebar):
    """Goresan tipis acak, digambar sembilan kali bergeser supaya menyambung di tepi."""
    besar = Image.new("L", (N * 3, N * 3), 0)
    g = ImageDraw.Draw(besar)
    for _ in range(jumlah):
        x, y = acak.uniform(0, N, 2)
        a = acak.uniform(0, np.pi)
        p = acak.uniform(20, 90)
        for dx in (0, N, 2 * N):
            for dy in (0, N, 2 * N):
                g.line([(x + dx, y + dy), (x + dx + np.cos(a) * p, y + dy + np.sin(a) * p)], fill=255, width=lebar)
    m = np.asarray(besar, dtype=np.float32)
    return np.maximum.reduce([m[i * N:(i + 1) * N, j * N:(j + 1) * N] for i in range(3) for j in range(3)]) / 255


def simpan(arr, path):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path, "WEBP", quality=82, method=6)


def main(keluar):
    keluar = Path(keluar)
    besar, sedang, halus = noda(60), noda(14), acak.standard_normal((N, N))
    gores = goresan(45, 1)
    # Albedo: abu hangat #6e655c, noda besar dan sedang, butir, goresan sedikit lebih gelap.
    nilai = 1 + 0.10 * besar + 0.05 * sedang + 0.025 * halus - 0.18 * gores
    dasar = np.array([0x6E, 0x65, 0x5C], dtype=np.float32)
    simpan(dasar[None, None, :] * nilai[..., None], keluar / "beton.webp")
    # Roughness (kanal hijau dibaca three.js): beton aus lebih halus di noda gelap, jadi kolam
    # lampu sedikit memantul; goresan lebih kasar.
    kasar = 200 + 30 * noda(40) + 12 * sedang + 10 * halus + 40 * gores
    simpan(np.repeat(kasar[..., None], 3, axis=2), keluar / "beton-kasar.webp")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "public/assets/dunia")
