# Memasang rahasia CMS di Vercel (Production saja) dan di .env.production.local, tanpa
# nilainya tampil di layar. Yang dicetak hanya nama dan panjang.
#
#   String koneksi Neon (salin dulu "Pooled connection" dari Neon > Connect):
#     npm run cms:setel -- -Nama DATABASE_URI
#   Rahasia Payload (dibuat acak di sini, tidak perlu disalin):
#     npm run cms:setel -- -Nama PAYLOAD_SECRET -Acak
#   OAuth Google (salin dari Google Cloud > Credentials):
#     npm run cms:setel -- -Nama GOOGLE_CLIENT_ID
#     npm run cms:setel -- -Nama GOOGLE_CLIENT_SECRET
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("DATABASE_URI", "PAYLOAD_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")]
  [string]$Nama,
  [switch]$Acak,
  [string]$Project = "farrez-cstz"
)
$ErrorActionPreference = "Stop"

$POLA = @{
  DATABASE_URI         = '^postgres(ql)?://[^\s:@]+:[^\s@]+@[^\s/]+-pooler\.[^\s/]+/\S+$'
  PAYLOAD_SECRET       = '^\S{32,}$'
  GOOGLE_CLIENT_ID     = '^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$'
  GOOGLE_CLIENT_SECRET = '^GOCSPX-[\w-]{20,}$'
}

if ($Acak) {
  $b = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  $nilai = [Convert]::ToBase64String($b)
} else {
  $nilai = (Get-Clipboard -Raw)
  if ($nilai) { $nilai = $nilai.Trim().TrimStart([char]0xFEFF) }
}
if (-not $nilai -or $nilai -notmatch $POLA[$Nama]) {
  $panjang = if ($nilai) { $nilai.Length } else { 0 }
  throw "Isi clipboard bukan $Nama yang benar (panjang $panjang). Salin ulang lalu jalankan lagi."
}

# 1. .env.production.local, dipakai npm run cms:isi dan cms:akun -Produksi.
$berkas = Join-Path (Get-Location) ".env.production.local"
$baris = @()
if (Test-Path $berkas) { $baris = @(Get-Content $berkas | Where-Object { $_ -notmatch "^$Nama=" }) }
$baris += "$Nama=$nilai"
[IO.File]::WriteAllLines($berkas, $baris, (New-Object Text.UTF8Encoding $false))

# 2. Vercel Production, sebagai Secret. Nilai dikirim lewat stdin dari berkas sementara tanpa
# baris baru: pipe PowerShell 5.1 menambah CRLF, dan argumen --value terlihat di daftar proses.
# CLI vercel menulis info ke stderr, jadi galat tidak dihentikan otomatis di bagian ini.
$ErrorActionPreference = "Continue"
$tmp = Join-Path $env:TEMP ("nilai-" + [guid]::NewGuid())
[IO.File]::WriteAllText($tmp, $nilai, (New-Object Text.UTF8Encoding $false))
& cmd /c "vercel env rm $Nama production --project $Project --yes >nul 2>&1"
& cmd /c "vercel env add $Nama production --project $Project --sensitive < `"$tmp`" >nul 2>&1"
$ok = $LASTEXITCODE -eq 0
Remove-Item $tmp -Force
$nilai = $null
if (-not $Acak) { Set-Clipboard -Value " " }

# 3. Nilai Secret tidak bisa dibaca balik, jadi yang dicek: namanya ada di Production.
$daftar = & cmd /c "vercel env ls production --project $Project 2>&1"
$ErrorActionPreference = "Stop"
if ($ok -and ($daftar -match "^\s*$Nama\s")) {
  Write-Output "$Nama terpasang di Vercel Production dan .env.production.local (panjang $($baris[-1].Length - $Nama.Length - 1)). Clipboard dikosongkan."
} else {
  throw "$Nama belum terpasang di Vercel. Cek: vercel env ls --project $Project"
}
