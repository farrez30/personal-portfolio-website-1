# Kode tamu bank gerak (farrez.vercel.app/bank, ADR 0028). Kode dibuat dan disimpan Bitwarden.
# Yang diketik hanya kata sandi utama Bitwarden.
#
# Buka vault sekali per terminal:   $env:BW_SESSION = bw unlock --raw
#
# Produksi (bawaan):                npm run bank:kode -- -Nama Zidni
#   DATABASE_URI dan PAYLOAD_SECRET produksi bertipe sensitive di Vercel, jadi tidak bisa ditarik
#   ke laptop. Skrip menaruh kode di clipboard; tempel di /admin, koleksi "Kode bank gerak",
#   kolom "Kode baru", lalu Save. Clipboard dikosongkan sesudah Enter.
# Lokal (DB uji di .env.local):     npm run bank:kode -- -Nama Zidni -Lokal
#
# Mencabut: /admin, Kode bank gerak, matikan Aktif. Kodenya dibagikan dari item Bitwarden
# "Bank gerak: <nama> (produksi)".
param(
  [Parameter(Mandatory = $true)][string]$Nama,
  [switch]$Lokal
)
$ErrorActionPreference = "Stop"
$kit = "D:\projects\ayam\ai-farrez\kit\akun-bitwarden.ps1"
$label = if ($Lokal) { "lokal" } else { "produksi" }
$asal = if ($Lokal) { "http://localhost:3000" } else { "https://farrez.vercel.app" }

$item = & $kit -Nama "Bank gerak: $Nama ($label)" -Username $Nama -Url "$asal/bank/masuk" `
  -Folder "Pribadi/Portofolio/Bank gerak" -Panjang 16 -TanpaSimbol `
  -Catatan "Kode tamu katalog bank gerak di farrez.vercel.app/bank (ADR 0028 portofolio). Kode ini dibagikan ke $Nama. Mencabut: /admin, Kode bank gerak, matikan Aktif. Ganti kode: ganti sandi item ini, lalu tempel ulang di kolom Kode baru."

if ($Lokal) {
  $env:NODE_OPTIONS = ""
  & bw get password $item.Id | node "--env-file=.env.local" scripts/cms/kode-bank.mjs --nama $Nama
  if ($LASTEXITCODE -ne 0) { throw "Kode bank gagal disimpan." }
  return
}

& bw get password $item.Id | Set-Clipboard
Write-Host "Kode untuk $Nama ada di clipboard (dan di Bitwarden)."
Write-Host "1. Buka $asal/admin/collections/kode-bank/create"
Write-Host "2. Untuk siapa: $Nama"
Write-Host "3. Kode baru: tempel (Ctrl+V), lalu Save"
Read-Host "Tekan Enter sesudah tersimpan untuk mengosongkan clipboard" | Out-Null
Set-Clipboard -Value $null
Write-Host "Clipboard dikosongkan."
