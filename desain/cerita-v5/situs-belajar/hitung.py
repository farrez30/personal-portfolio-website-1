# Hitung skor situs belajar dan tulis situs-belajar-skor.html.
# Pakai: python -I hitung.py   (dari folder ini)
# Semua angka di laporan berasal dari sini; jangan sunting HTML hasilnya dengan tangan.
import html
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import BOBOT, JENIS, KATEGORI, KRITERIA, RUBRIK, SITUS, TIDAK_DINILAI  # noqa: E402

AMBANG_WAJIB, AMBANG_BERGUNA, INDUSTRI_WAJIB = 75, 65, 4
WARNA = {"Wajib": "#a4502c", "Berguna": "#2f62b0", "Pelengkap": "#9aa0ab"}
LABEL = {"t": ("t", "terbukti"), "d": ("d", "dari halaman"), "p": ("p", "dugaan")}
e = html.escape

for j, w in BOBOT.items():
    assert sum(w.values()) == 100, f"bobot {j} tidak 100"
    assert set(w) == set(KRITERIA), j


def skor(s):
    w = BOBOT[s[3]]
    nilai = dict(zip("IBPMAR", s[4:10]))
    assert all(1 <= v <= 5 for v in nilai.values()), s[1]
    return round(sum(w[k] * nilai[k] for k in w) / 5, 1)


def tingkat(s):
    t = skor(s)
    if t >= AMBANG_WAJIB and s[4] >= INDUSTRI_WAJIB:
        return "Wajib"
    if t >= AMBANG_BERGUNA:
        return "Berguna"
    return "Pelengkap"


def angka(x):
    return f"{x:.0f}" if x == int(x) else f"{x:.1f}".replace(".", ",")


nama_unik = [s[1] for s in SITUS]
assert len(nama_unik) == len(set(nama_unik)), "nama ganda"
for s in SITUS:
    assert s[0] in KATEGORI and s[3] in JENIS and s[13] in LABEL and s[10] in "VI", s[1]

N = len(SITUS)
per_tingkat = Counter(tingkat(s) for s in SITUS)
wajib = [s for s in SITUS if tingkat(s) == "Wajib"]
i5 = [s for s in SITUS if s[4] == 5]
dua_sisi = [s for s in SITUS if s[4] >= 4 and s[7] >= 4]
mirip5 = [s for s in SITUS if s[7] == 5]
gratis_wajib = [s for s in wajib if s[8] >= 4]
terbaik = max(SITUS, key=skor)

halaman = []


def slide(kicker, judul, sub, isi, kaki, sampul=False):
    if sampul:
        halaman.append(f'<section class="slide" style="justify-content:center"><div class="kicker">{kicker}</div>'
                       f'<h1 style="font-size:38pt;margin:4mm 0;max-width:240mm">{judul}</h1>{isi}'
                       f'<div class="kaki"><span>{kaki}</span><span class="no">{len(halaman) + 1}</span></div></section>')
        return
    s = f'<p class="sub">{sub}</p>' if sub else ""
    halaman.append(f'<section class="slide"><div class="kicker">{kicker}</div><h2 class="judul">{judul}</h2>{s}'
                   f'<div class="isi">{isi}</div>'
                   f'<div class="kaki"><span>{kaki}</span><span class="no">{len(halaman) + 1}</span></div></section>')


def lb(k):
    c, t = LABEL[k]
    return f'<span class="lb {c}">{t}</span>'


SUMBER = "Dicek 20 Nov 2026 lewat situs dan sumber resminya, empat riset paralel plus browser panel."

# 1. Sampul
slide("Situs belajar interaktif, versi skor. 20 Nov 2026",
      f"{len(wajib)} dari {N} situs layak jadi bahan belajar utama",
      "",
      f'<p style="font-size:13pt;color:var(--tinta-2);max-width:215mm">Cloud dan DevOps, keamanan siber, desain sistem, '
      f'serta elektronika dan robotika. Tiap situs diberi skor dari enam kriteria, dengan bobot yang berbeda per jenis: '
      f'visual, lab, kursus, dan alat. Dipakai juga sebagai rujukan isi layar konsol previs cerita v5.</p>',
      f"Disusun untuk Farrez. {SUMBER}", sampul=True)

# 2. Ringkasan
isi = f'''<div class="kolom k4" style="margin-bottom:5mm">
<div class="angka-besar"><div class="n aksen">{len(wajib)}</div><div class="l">situs Wajib: skor {AMBANG_WAJIB}+ dan relevansi industri {INDUSTRI_WAJIB}+. {len(gratis_wajib)} di antaranya gratis atau cukup akun.</div></div>
<div class="angka-besar"><div class="n">{len(i5)}</div><div class="l">situs terhubung langsung ke sertifikasi resmi vendor (relevansi industri 5).</div></div>
<div class="angka-besar"><div class="n">{len(dua_sisi)}</div><div class="l">situs yang kuat di industri sekaligus mirip designed-to-scale.</div></div>
<div class="angka-besar"><div class="n">{angka(skor(terbaik))}</div><div class="l">skor tertinggi, {e(terbaik[1])}.</div></div>
</div>
<div class="kolom k3">
<div class="kartu pilih"><h3>1. Belajar untuk kerja</h3><p>Mulai dari lab Wajib di bidang yang dituju, lalu ambil sertifikasinya. Lab vendor (AWS, Google, Microsoft, PortSwigger) paling dekat ke lowongan.</p></div>
<div class="kartu"><h3>2. Paham dulu, baru praktik</h3><p>Situs visual yang mirip designed-to-scale dipakai sebagai pemanasan. Pengakuannya rendah, jadi jangan berhenti di sana.</p></div>
<div class="kartu"><h3>3. Yang perlu Anda putuskan</h3><p>Bidang mana yang jadi fokus pertama. Jalur per bidang ada di halaman jalur belajar.</p></div>
</div>'''
halaman_ringkasan = len(halaman)
slide("Ringkasan", f"Lab bersertifikat menang di industri, situs visual menang di kemiripan",
      f"{N} situs dinilai di empat bidang; {len(TIDAK_DINILAI)} situs lain mati atau belum bisa dinilai.",
      isi + "</div><!-- alur --><!-- /alur --><div>",
      f"Skor dihitung hitung.py dari data.py {lb('t')}. Kekuatan belajar dan kemiripan adalah penilaian kami {lb('p')}.")

# 3. Rubrik
baris = ""
for k, nama in KRITERIA.items():
    r = RUBRIK[k]
    baris += f'<tr><td><b>{nama}</b></td>' + "".join(
        f'<td>{e(r[n]) if n in r else "<span class=kecil>di antaranya</span>"}</td>' for n in (5, 4, 3, 2, 1)) + '</tr>'
isi = (f'<table class="rubrik"><tr><th style="width:13%">Kriteria</th><th>5</th><th>4</th><th>3</th><th>2</th><th>1</th></tr>'
       f'{baris}</table>')
isi += ('<p class="kecil" style="margin-top:3mm">Relevansi industri, akses, dan perawatan diukur dari bukti yang dibuka. '
        'Kekuatan belajar, kedalaman praktik, dan kemiripan dinilai setelah situsnya dicoba.</p>')
slide("Cara menilai", "Enam kriteria, masing-masing bernilai 1 sampai 5",
      "Relevansi industri ikut di semua jenis: dipakai atau diakui di pekerjaan, bukan sekadar populer.",
      isi, f"Rubrik ditetapkan 20 Nov 2026 {lb('p')}. Bukti industri tiap situs ada di lampiran.")

# 4. Bobot per jenis
kepala = "".join(f'<th class="angka">{KRITERIA[k]}</th>' for k in KRITERIA)
baris = ""
for j in JENIS:
    sel = ""
    for k in KRITERIA:
        w = BOBOT[j][k]
        alpha = 0.12 + w / 25 * 0.75
        sel += f'<td class="angka" style="background:rgba(164,80,44,{alpha:.2f});font-weight:700">{w}%</td>'
    jumlah = Counter(s[3] for s in SITUS)[j]
    baris += f'<tr><td><b>{j}</b><br><span class="kecil">{jumlah} situs</span></td>{sel}</tr>'
isi = f'<table class="bobot"><tr><th>Jenis</th>{kepala}</tr>{baris}</table>'
isi += f'''<div class="kolom k3" style="margin-top:6mm">
<div class="kartu"><h3>Skor total</h3><p>Jumlah bobot kali nilai, dibagi 5. Hasilnya 20 sampai 100.</p></div>
<div class="kartu pilih"><h3>Wajib</h3><p>Skor {AMBANG_WAJIB}+ dan relevansi industri {INDUSTRI_WAJIB}+. Situs bagus yang belum diakui industri tidak masuk sini.</p></div>
<div class="kartu"><h3>Berguna, Pelengkap</h3><p>Berguna: skor {AMBANG_BERGUNA}+. Pelengkap: di bawah {AMBANG_BERGUNA}, dipakai untuk satu topik saja.</p></div>
</div>'''
slide("Bobot", "Bobot mengikuti jenisnya: lab dinilai dari praktik, visual dari kemiripan",
      "Persen per kriteria; tiap baris berjumlah 100. Relevansi industri 20 sampai 25% di semua jenis.",
      isi, f"Bobot seimbang sesuai pilihan Farrez 20 Nov 2026 {lb('t')}.")

# 5. Matriks industri x kemiripan
sel = Counter((s[4], s[7]) for s in SITUS)
x0, y0, c = 190, 20, 140
svg = [f'<svg viewBox="0 0 1000 585" font-family="Public Sans" role="img" aria-label="Jumlah situs per nilai relevansi industri dan kemiripan">']
for i in range(1, 6):
    for m in range(1, 6):
        x = x0 + (i - 1) * c
        y = y0 + (5 - m) * 100
        sorot = i >= 4 and m >= 4
        svg.append(f'<rect x="{x}" y="{y}" width="{c}" height="100" fill="{"#f6e8e0" if sorot else "#fff"}" stroke="#dfe1e6"/>')
        n = sel.get((i, m), 0)
        if n:
            r = 8 + n ** 0.5 * 9
            svg.append(f'<circle cx="{x + c / 2}" cy="{y + 50}" r="{r:.1f}" fill="{"#a4502c" if sorot else "#2f62b0"}" opacity=".9"/>')
            svg.append(f'<text x="{x + c / 2}" y="{y + 56}" text-anchor="middle" font-size="17" font-weight="700" fill="#fff">{n}</text>')
for i in range(1, 6):
    svg.append(f'<text x="{x0 + (i - 0.5) * c}" y="{y0 + 525}" text-anchor="middle" font-size="15" fill="#4a5263">{i}</text>')
for m in range(1, 6):
    svg.append(f'<text x="{x0 - 14}" y="{y0 + (5 - m) * 100 + 56}" text-anchor="end" font-size="15" fill="#4a5263">{m}</text>')
svg.append(f'<text x="{x0 + 2.5 * c}" y="{y0 + 552}" text-anchor="middle" font-size="15" fill="#1d2433">relevansi industri</text>')
svg.append(f'<text x="0" y="{y0 + 12}" font-size="15" fill="#1d2433">mirip designed-to-scale</text>')
nama_dua = ", ".join(s[1] for s in dua_sisi)
svg.append('</svg>')
isi = (f'<div class="kolom" style="grid-template-columns:1.7fr 1fr"><div>{"".join(svg)}</div>'
       f'<div><div class="catatan"><b>Kotak sorot, {len(dua_sisi)} situs:</b> {e(nama_dua)}.</div>'
       f'<p class="kecil" style="margin-top:4mm">{len(mirip5)} situs yang paling mirip (nilai 5) semuanya bernilai industri 2: '
       f'belum ada bukti pengakuan. {len(i5)} situs bernilai industri 5 semuanya lab, kursus, atau alat vendor, '
       f'dengan kemiripan 1 sampai 2.</p></div></div>')
assert {s[4] for s in mirip5} == {2} and {s[7] for s in i5} <= {1, 2}
slide("Peta", f"Hanya {len(dua_sisi)} situs kuat di industri sekaligus mirip designed-to-scale",
      "Lingkaran menunjukkan jumlah situs per pasangan nilai. Kanan atas berarti kuat di dua sisi.",
      isi, f"Relevansi industri dari bukti per situs {lb('t')} {lb('d')}. Kemiripan dari mencoba situsnya {lb('p')}.")


# 6 sampai 9. Batang per kategori
def batang(daftar):
    daftar = sorted(daftar, key=lambda s: (-skor(s), s[1]))
    h = min(30, 500 // len(daftar))  # tinggi baris menyesuaikan supaya muat satu halaman
    tinggi = len(daftar) * h + 34
    x0, skala = 330, 5.0
    g = [f'<svg viewBox="0 0 1000 {tinggi}" font-family="Public Sans" role="img" aria-label="Skor total per situs, diurutkan">']
    for n in (0, 25, 50, 75, 100):
        x = x0 + n * skala
        g.append(f'<line x1="{x}" y1="4" x2="{x}" y2="{tinggi - 26}" stroke="{"#7a8191" if n == 0 else "#eceef1"}"/>')
        g.append(f'<text x="{x}" y="{tinggi - 8}" text-anchor="middle" font-size="12" fill="#7a8191">{n}</text>')
    for idx, s in enumerate(daftar):
        y = 6 + idx * h
        t = tingkat(s)
        nama = s[1] if len(s[1]) <= 38 else s[1][:36] + "…"
        g.append(f'<text x="{x0 - 10}" y="{y + h * 0.6}" text-anchor="end" font-size="14" fill="#1d2433">{e(nama)}</text>')
        g.append(f'<rect x="{x0}" y="{y + 3}" width="{skor(s) * skala:.1f}" height="{h - 9}" rx="3" fill="{WARNA[t]}"/>')
        g.append(f'<text x="{x0 + skor(s) * skala + 7}" y="{y + h * 0.6}" font-size="14" font-weight="700" fill="#1d2433">{angka(skor(s))}</text>')
        g.append(f'<text x="{x0 + skor(s) * skala + 40}" y="{y + h * 0.6}" font-size="12" fill="#4a5263">{s[3]}, industri {s[4]}, mirip {s[7]}</text>')
    g.append("</svg>")
    return "".join(g)


def legenda():
    return ('<div class="legenda">' + "".join(
        f'<span><i style="background:{w}"></i>{t} ({per_kat[t]})</span>' for t, w in WARNA.items()) + "</div>")


JUDUL_KAT = {
    "Cloud dan DevOps": "Tiga lab vendor resmi di puncak, visual Kubernetes jadi pemanasan",
    "Keamanan siber": "PortSwigger paling kuat dengan 91 poin, dan belajarnya gratis",
    "Desain sistem": "Situs paling mirip designed-to-scale belum ada yang diakui industri",
    "Elektronika dan robotika": "ROS 2 dan CircuitVerse unggul; Arduino satu-satunya bersertifikat resmi",
}
for kat in KATEGORI:
    daftar = [s for s in SITUS if s[0] == kat]
    per_kat = Counter(tingkat(s) for s in daftar)
    slide(kat, JUDUL_KAT[kat], f"{len(daftar)} situs, skor 20 sampai 100, diurutkan. Warna menunjukkan tingkat.",
          legenda() + batang(daftar),
          f"Skor dari hitung.py {lb('t')}. Bukti industri tiap situs di lampiran {lb('d')}.")

# cek judul kategori terhadap data
ks = [s for s in SITUS if s[0] == "Keamanan siber"]
assert max(ks, key=skor)[1].startswith("PortSwigger") and skor(max(ks, key=skor)) == 91
assert all(s[4] < 4 for s in SITUS if s[0] == "Desain sistem" and s[7] == 5)
el = [s for s in SITUS if s[0] == "Elektronika dan robotika"]
assert [s[1] for s in el if s[4] == 5] == ["Arduino Docs dan Certification"]
assert {s[1] for s in sorted(el, key=skor)[-2:]} == {"ROS 2 Documentation", "CircuitVerse"}
cl = sorted([s for s in SITUS if s[0] == "Cloud dan DevOps"], key=skor)[-3:]
assert all(s[4] == 5 for s in cl)


# 10. Jalur belajar per bidang
def puncak(kat, syarat):
    daftar = [s for s in SITUS if s[0] == kat and syarat(s)]
    return max(daftar, key=skor) if daftar else None


# Topik tetangga: dinilai di kategorinya, tapi bukan inti bidang itu, jadi tidak masuk jalur.
TETANGGA = {"Learn Git Branching", "Cisco Packet Tracer", "VisuAlgo"}
baris = ""
for kat in KATEGORI:
    inti = lambda s, f: s[1] not in TETANGGA and f(s)  # noqa: E731
    v = puncak(kat, lambda s: inti(s, lambda s: s[7] >= 4))
    p = puncak(kat, lambda s: inti(s, lambda s: s[6] >= 4 and s[1] != v[1]))
    sert = [s[1] for s in SITUS if s[0] == kat and s[4] == 5 and s[1] not in TETANGGA]
    if not sert:
        sert = ["belum ada sertifikasi untuk bidang ini; hasil latihan jadi portofolio"]
    baris += (f'<tr><td><b>{kat}</b></td><td>{e(v[1])} <span class="kecil">({angka(skor(v))})</span></td>'
              f'<td>{e(p[1])} <span class="kecil">({angka(skor(p))})</span></td><td>{e(", ".join(sert))}</td></tr>')
isi = (f'<table class="jalur"><tr><th style="width:17%">Bidang</th><th>1. Pahami (visual, mirip 4+)</th>'
       f'<th>2. Latihan (praktik 4+)</th><th>3. Buktikan (sertifikasi vendor, industri 5)</th></tr>{baris}</table>'
       '<div class="kolom k3" style="margin-top:6mm">'
       '<div class="kartu"><h3>Pahami</h3><p>Satu atau dua jam di situs visual. Tujuannya gambaran utuh sebelum mengetik perintah.</p></div>'
       '<div class="kartu pilih"><h3>Latihan</h3><p>Bagian terbesar waktunya. Lab dengan terminal atau mesin sungguhan, dikerjakan sampai lancar.</p></div>'
       '<div class="kartu"><h3>Buktikan</h3><p>Sertifikasi atau badge yang bisa ditaruh di CV. Biaya ujian dicek ulang sebelum mendaftar.</p></div></div>')
slide("Jalur belajar", "Urutannya pahami lewat visual, latihan di lab, lalu buktikan dengan sertifikasi",
      "Tiap kolom berisi situs berskor tertinggi yang memenuhi syarat kolom. Topik tetangga (Git, jaringan Cisco, algoritma) tidak dihitung.",
      isi, f"Dipilih otomatis oleh hitung.py dari skor {lb('t')}. Urutan tiga langkah adalah saran kami {lb('p')}.")

# 11. Rujukan layar previs
POLA = {
    "Interactive Kubernetes, explained": "tombol play, pause, step di atas peta komponen",
    "Cyber Security Visual Learning Lab": "animasi serangan bertahap dengan tombol Next",
    "designed-to-scale (patokan)": "angka latensi hidup per hop, 10 langkah berlabel",
    "Reqflow": "trace request per langkah plus kuis",
    "Toolkit (guide dan 34 simulator)": "simulator kecil per konsep (CAP, Raft, circuit breaker)",
    "200 Milliseconds": "satu request diikuti dari DNS sampai database",
    "Full Stack Observatory": "log paket dan pelacak seq/ack, kecepatan 0,5 sampai 4x",
    "NandGame": "level bertahap dengan cek otomatis, dari NAND sampai CPU",
}
assert set(POLA) == {s[1] for s in mirip5}, "POLA harus sama dengan daftar mirip 5"
kartu = "".join(f'<div class="kartu"><h3 style="font-size:11.5pt">{e(s[1])}</h3><p class="kecil">{e(POLA[s[1]])}</p>'
                f'<p class="kecil" style="color:var(--tinta-3)">{s[0]}, skor {angka(skor(s))}</p></div>' for s in sorted(mirip5, key=lambda s: -skor(s)))
slide("Untuk previs", f"{len(mirip5)} situs ini paling cocok jadi isi layar konsol previs",
      "Semua bernilai mirip 5. Yang dipinjam adalah polanya, bukan gambar atau teksnya.",
      f'<div class="kolom k4">{kartu}</div>',
      f"Pola dibaca dari situsnya 20 Nov 2026 {lb('d')}. Hak cipta tetap milik pembuatnya.")

# Lampiran: tabel lengkap per kategori, dipecah supaya muat
PER_HAL = 20
for kat in KATEGORI:
    daftar = sorted([s for s in SITUS if s[0] == kat], key=lambda s: (-skor(s), s[1]))
    jml = -(-len(daftar) // PER_HAL)
    uk = -(-len(daftar) // jml)
    potong = [daftar[i:i + uk] for i in range(0, len(daftar), uk)]
    for no, bag in enumerate(potong, 1):
        rows = ""
        for s in bag:
            t = tingkat(s)
            rows += (f'<tr><td><a href="{e(s[2])}">{e(s[1])}</a>{" <span class=kecil>(I)</span>" if s[10] == "I" else ""}</td>'
                     f'<td>{s[3]}</td>' + "".join(f'<td class="angka">{v}</td>' for v in s[4:10]) +
                     f'<td class="angka"><b>{angka(skor(s))}</b></td><td><span class="tk" style="color:{WARNA[t]}">{t}</span></td>'
                     f'<td>{e(s[11])}</td><td>{e(s[12])} {lb(s[13])}</td></tr>')
        bagian = f", bagian {no} dari {len(potong)}" if len(potong) > 1 else ""
        slide("Lampiran", f"Skor lengkap {kat}{bagian}", "",
              '<table class="lamp"><tr><th style="width:18%">Situs</th><th>Jenis</th><th class="angka">I</th><th class="angka">B</th>'
              '<th class="angka">P</th><th class="angka">M</th><th class="angka">A</th><th class="angka">R</th><th class="angka">Skor</th>'
              f'<th>Tingkat</th><th style="width:14%">Biaya</th><th>Bukti industri</th></tr>{rows}</table>',
              "I industri, B belajar, P praktik, M mirip, A akses, R dirawat. (I): isi dari pihak ketiga. "
              f"{lb('t')} sumber resmi, {lb('d')} klaim situsnya, {lb('p')} belum dicek.")

# Lampiran: tidak dinilai dan batasan
rows = "".join(f'<tr><td>{e(a)}</td><td>{e(b)}</td><td>{e(c)}</td></tr>' for a, b, c in TIDAK_DINILAI)
isi = (f'<div class="kolom k2"><div><h3 style="font-size:13pt;margin-bottom:2mm">Tidak dinilai ({len(TIDAK_DINILAI)})</h3>'
       f'<table><tr><th>Situs</th><th>Alasan</th><th>Status</th></tr>{rows}</table></div>'
       '<div><h3 style="font-size:13pt;margin-bottom:2mm">Batasan</h3><ul>'
       '<li>Kekuatan belajar dan kemiripan adalah penilaian setelah mencoba, bukan ukuran baku. Selisih 2 sampai 3 poin di skor total tidak bermakna.</li>'
       '<li>Klaim pemakai dan mitra (TryHackMe, CircuitVerse, Hacksplaining) berasal dari situsnya sendiri dan belum diaudit pihak lain.</li>'
       '<li>Harga berubah cepat. Angka di lampiran dibaca 20 Nov 2026; cek lagi sebelum membayar.</li>'
       '<li>Situs yang gagal lewat fetch dan panel dibuka ulang di Chrome; enam situs elektronika masuk penilaian lewat jalur itu.</li>'
       '<li>Tidak ditemukan penjelasan visual interaktif khusus IAM, serverless, Terraform, atau elektronika analog yang setara designed-to-scale.</li>'
       '</ul></div></div>')
slide("Lampiran", f"{len(TIDAK_DINILAI)} situs tidak dinilai, dan batas yang perlu diingat", "", isi,
      f"Status dari percobaan 20 Nov 2026 {lb('t')}.")


CSS_TAMBAHAN = """
.legenda { display: flex; gap: 6mm; font-size: 9pt; color: var(--tinta-2); margin-bottom: 2mm; }
.legenda i { display: inline-block; width: 3.2mm; height: 3.2mm; border-radius: .6mm; margin-right: 1.5mm; vertical-align: -.4mm; }
table.rubrik td { font-size: 8.4pt; } table.jalur td { font-size: 9.2pt; }
table.bobot td, table.bobot th { font-size: 10pt; padding: 2.4mm 2mm; }
table.lamp { font-size: 7.4pt; line-height: 1.3; }
table.lamp td, table.lamp th { padding: .8mm 1.2mm; }
table.lamp .lb { font-size: 6.4pt; }
.slide .isi:has(+ .alur) { padding-bottom: 0; }
.alur { margin-top: 3mm; }
table.lamp a { color: var(--tinta); font-weight: 600; text-decoration: none; }
.tk { font-weight: 700; }
"""

doc = ('<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Skor situs belajar interaktif</title>'
       f'<link rel="stylesheet" href="gaya.css"><style>{CSS_TAMBAHAN}</style></head><body>\n'
       + "\n".join(halaman) + "\n</body></html>\n")
# ringkasan: alur ditaruh sesudah .isi. Penanda sementara di atas memecah div; rapikan.
doc = doc.replace('</div><!-- alur --><!-- /alur --><div></div>', '</div><!-- alur --><!-- /alur -->')
assert doc.count("<!-- alur -->") == 1 and '<div></div>' not in doc

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "situs-belajar-skor.html")
with open(out, "w", encoding="utf-8", newline="\n") as f:
    f.write(doc)

print(f"{N} situs, {len(halaman)} halaman")
print("tingkat:", dict(per_tingkat))
print("wajib:", ", ".join(f"{s[1]} {angka(skor(s))}" for s in sorted(wajib, key=lambda s: -skor(s))))
print("industri 5:", ", ".join(s[1] for s in i5))
print("dua sisi:", nama_dua)
