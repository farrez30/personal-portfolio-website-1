"""Aset akhir cakram seksi klien: potong bulat, lubang tengah transparan, WebP 640 px.

    python scripts/cakram-akhir.py <masukan> <keluar.webp> [--sudah-dipotong]

Masukan berupa foto cakram di atas kertas (hasil Flow mentah atau label album), atau hasil
scripts/logo-cakram.py yang sudah dipotong (`--sudah-dipotong`).
"""
import importlib.util
import pathlib
import sys

import numpy as np
from PIL import Image

SISI = 640
# CD 120 mm dengan lubang 15 mm: jari-jari lubang 1/16 sisi. Tepi luar dikurangi 2 px
# supaya garis kertas di pinggir potongan tidak ikut.
LUBANG = SISI / 16


def muat_potong():
    jalur = pathlib.Path(__file__).with_name("logo-cakram.py")
    spek = importlib.util.spec_from_file_location("logo_cakram", jalur)
    modul = importlib.util.module_from_spec(spek)
    spek.loader.exec_module(modul)
    return modul.potong_cakram


def main():
    argumen = [a for a in sys.argv[1:] if not a.startswith("--")]
    masukan, keluar = argumen
    gambar = Image.open(masukan).convert("RGB")
    if "--sudah-dipotong" not in sys.argv:
        gambar = muat_potong()(gambar, SISI)
    gambar = gambar.resize((SISI, SISI), Image.LANCZOS)
    yy, xx = np.mgrid[:SISI, :SISI] + 0.5
    r = np.hypot(xx - SISI / 2, yy - SISI / 2)
    luar = np.clip(SISI / 2 - 3 - r, 0, 1)  # tepi halus satu piksel
    dalam = np.clip(r - LUBANG, 0, 1)
    alfa = (luar * dalam * 255).astype(np.uint8)
    hasil = Image.fromarray(np.dstack([np.asarray(gambar), alfa]), "RGBA")
    pathlib.Path(keluar).parent.mkdir(parents=True, exist_ok=True)
    hasil.save(keluar, "WEBP", quality=86, method=6)
    print(keluar, pathlib.Path(keluar).stat().st_size)


if __name__ == "__main__":
    main()
