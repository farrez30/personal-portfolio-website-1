# Akun admin CMS portofolio: sandi dibuat dan disimpan Bitwarden, lalu dikirim lewat stdin ke
# scripts/cms/akun.mjs. Yang diketik hanya kata sandi utama Bitwarden.
#
# Buka vault sekali per terminal:   $env:BW_SESSION = bw unlock --raw
# Lalu dari folder repo:            npm run cms:akun
# Ke DB produksi: isi DATABASE_URI produksi di .env.production.local, lalu
#                                   npm run cms:akun -- -Produksi
param(
  [string]$Email = "farrezalhakim@gmail.com",
  [string]$Username = "farrez",
  [switch]$Produksi
)
$ErrorActionPreference = "Stop"
$kit = "D:\projects\ayam\coderoach-app\kit\akun-bitwarden.ps1"
$url = if ($Produksi) { "https://farrez.vercel.app/admin" } else { "http://localhost:3000/admin" }
$label = if ($Produksi) { "produksi" } else { "lokal" }

$item = & $kit -Nama "Portofolio CMS ($label)" -Username $Username -Url $url `
  -Folder "Pribadi/Portofolio" `
  -Catatan "Admin CMS farrez.vercel.app (Payload, ADR 0026). Masuk dengan username atau email $Email. Ganti sandi: jalankan ulang npm run cms:akun setelah sandi di Bitwarden diganti."

$env:NODE_OPTIONS = ""
$envFile = if ($Produksi) { ".env.production.local" } else { ".env.local" }
& bw get password $item.Id | node "--env-file=$envFile" scripts/cms/akun.mjs --email $Email --username $Username
if ($LASTEXITCODE -ne 0) { throw "Akun CMS gagal dibuat." }
