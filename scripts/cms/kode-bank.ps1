# Kode tamu bank gerak (farrez.vercel.app/bank, ADR 0028): kode dibuat dan disimpan Bitwarden,
# lalu dikirim lewat stdin ke scripts/cms/kode-bank.mjs. Yang diketik hanya kata sandi utama
# Bitwarden. Kodenya dibagikan dari Bitwarden (salin dari item "Bank gerak: <nama>").
#
# Buka vault sekali per terminal:   $env:BW_SESSION = bw unlock --raw
# Lalu dari folder repo:            npm run bank:kode -- -Nama Zidni
# Ke DB produksi: isi DATABASE_URI produksi di .env.production.local, lalu
#                                   npm run bank:kode -- -Nama Zidni -Produksi
# Mencabut: buka /admin, koleksi "Kode bank gerak", matikan Aktif.
param(
  [Parameter(Mandatory = $true)][string]$Nama,
  [switch]$Produksi
)
$ErrorActionPreference = "Stop"
$kit = "D:\projects\ayam\ai-farrez\kit\akun-bitwarden.ps1"
$url = if ($Produksi) { "https://farrez.vercel.app/bank/masuk" } else { "http://localhost:3000/bank/masuk" }
$label = if ($Produksi) { "produksi" } else { "lokal" }

$item = & $kit -Nama "Bank gerak: $Nama ($label)" -Username $Nama -Url $url `
  -Folder "Pribadi/Portofolio/Bank gerak" -Panjang 16 -TanpaSimbol `
  -Catatan "Kode tamu katalog bank gerak di farrez.vercel.app/bank (ADR 0028 portofolio). Kode ini dibagikan ke $Nama. Mencabut: /admin, Kode bank gerak, matikan Aktif. Ganti kode: ganti sandi item ini, lalu jalankan ulang npm run bank:kode -- -Nama $Nama."

$env:NODE_OPTIONS = ""
$envFile = if ($Produksi) { ".env.production.local" } else { ".env.local" }
& bw get password $item.Id | node "--env-file=$envFile" scripts/cms/kode-bank.mjs --nama $Nama
if ($LASTEXITCODE -ne 0) { throw "Kode bank gagal disimpan." }
