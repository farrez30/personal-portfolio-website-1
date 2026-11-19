# Asal data peta previs

Diunduh 19 Nov 2026 atas izin Farrez (pertanyaan terstruktur, pilihan "Natural Earth + Black Marble").

| Berkas | Ukuran | Sumber | Lisensi atau syarat | Dipakai untuk |
|---|---|---|---|---|
| `ne_50m_land.geojson` | 1.636.166 byte | github.com/nvkelso/natural-earth-vector, `geojson/ne_50m_land.geojson` | Natural Earth: domain publik, boleh komersial, tanpa wajib atribusi (naturalearthdata.com/about/terms-of-use) | garis pantai globe dan peta Nusantara |
| `ne_50m_populated_places_simple.geojson` | 850.767 byte | repo yang sama, `geojson/ne_50m_populated_places_simple.geojson` | sama | titik kota besar (penduduk di atas 4 juta) di globe |
| `BlackMarble_2016_01deg.jpg` | 779.638 byte, 3600x1800 | NASA Earth Observatory, Earth at Night: Flat Maps, 2016 Color 0.1 derajat (science.nasa.gov/earth/earth-observatory/earth-at-night/maps) | Halaman unduh tidak memuat pernyataan lisensi. Kredit yang dipakai NASA: "NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC". Cek pedoman media NASA sebelum dipakai di situs tayang. | lampu kota globe malam (hanya piksel terang yang hangat yang dipakai) |

Data dari Suomi NPP VIIRS Day/Night Band. Previs hanya membaca berkas ini di peramban lewat
`fetch`, tidak ada yang dikirim ke luar.
