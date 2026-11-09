#!/bin/bash
# Potong rekaman CC0 jadi berkas efek suara situs. Satu-tembakan: mono 44,1 kHz MP3,
# puncak dinormalkan ke -3 dBFS. Lup: WAV 22,05 kHz dengan sambungan disilang-pudar.
set -e
A=/d/downloads/claude/2026-11-09-suara-cd/asli
T=/d/projects/ayam/personal-portfolio-website-1/.claude/worktrees/practical-keller-35564d/public/assets/suara
mkdir -p $T

# nama sumber mulai lama [pudar-keluar]
satu() {
  local nama=$1 src=$2 s=$3 d=$4 fo=${5:-0.04} tetap=$6
  local tmp=$(mktemp --suffix=.wav)
  ffmpeg -v error -y -ss $s -t $d -i $A/$src.mp3 -ac 1 -ar 44100 \
    -af "highpass=f=60,afade=t=in:d=0.004,afade=t=out:st=$(awk "BEGIN{print $d-$fo}"):d=$fo" $tmp
  local pk=$(ffmpeg -hide_banner -i $tmp -af astats -f null - 2>&1 | grep -m1 "Peak level dB" | awk '{print $NF}')
  local g=${tetap:-$(awk "BEGIN{print -3 - ($pk)}")}
  ffmpeg -v error -y -i $tmp -af "volume=${g}dB" -c:a libmp3lame -b:a 112k $T/$nama.mp3
  rm $tmp
  echo "$nama  $src@$s+$d  puncak $pk dB, gain $g dB, $(stat -c%s $T/$nama.mp3) B"
}

# Lup: ambil L+X detik, silang-pudar X detik ekor ke kepala, normalkan RMS ke -22 dB.
lup() {
  local nama=$1 src=$2 s=$3 L=$4 X=$5 ar=${6:-22050}
  local tmp=$(mktemp --suffix=.wav)
  ffmpeg -v error -y -ss $s -t $(awk "BEGIN{print $L+$X}") -i $A/$src.mp3 -ac 1 -ar $ar -af "highpass=f=40" -c:a pcm_f32le $tmp
  node -e '
    const fs=require("fs"); const b=fs.readFileSync(process.argv[1]);
    const ar=+process.argv[4], L=Math.round(+process.argv[2]*ar), X=Math.round(+process.argv[3]*ar);
    const off=b.indexOf("data")+8; const s=new Float32Array(b.buffer.slice(b.byteOffset+off, b.byteOffset+off+(L+X)*4));
    const o=new Float32Array(L);
    for(let i=0;i<L;i++) o[i]=s[i];
    // Kepala lup = kepala asli memudar masuk + ekor sesudah L memudar keluar (daya tetap).
    for(let i=0;i<X;i++){ const t=i/X; o[i]=s[i]*Math.sin(t*Math.PI/2)+s[L+i]*Math.cos(t*Math.PI/2); }
    let q=0; for(const v of o) q+=v*v; const rms=Math.sqrt(q/L); const g=Math.pow(10,-22/20)/rms;
    const pcm=Buffer.alloc(L*2); for(let i=0;i<L;i++){ pcm.writeInt16LE(Math.max(-32767,Math.min(32767,Math.round(o[i]*g*32767))),i*2); }
    const h=Buffer.alloc(44); h.write("RIFF",0); h.writeUInt32LE(36+pcm.length,4); h.write("WAVE",8); h.write("fmt ",12);
    h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(1,22); h.writeUInt32LE(ar,24); h.writeUInt32LE(ar*2,28); h.writeUInt16LE(2,32); h.writeUInt16LE(16,34);
    h.write("data",36); h.writeUInt32LE(pcm.length,40); fs.writeFileSync(process.argv[5], Buffer.concat([h,pcm]));
    console.log(process.argv[6], "rms asli", (20*Math.log10(rms)).toFixed(1), "dB, gain", (20*Math.log10(g)).toFixed(1), "dB");
  ' "$tmp" $L $X $ar $T/$nama.wav $nama
  rm $tmp
  echo "$nama  $src@$s L=$L X=$X  $(stat -c%s $T/$nama.wav) B"
}

# Tutup dibuka: kait lepas (klik pelan) di 265634.
satu buka-1 265634 0.13 0.4 0.12 8.7
satu buka-2 265634 2.89 0.4 0.12 8.7
# Tutup rapat: klik keras di 265634.
satu rapat-1 265634 1.72 0.45 0.15 8.7
satu rapat-2 265634 4.24 0.45 0.15 8.7
# Cakram lepas dari hub, dan cakram masuk ke hub (854562).
satu angkat-1 854562 1.24 0.35 0.1
satu duduk-1 854562 2.17 0.35 0.1
# Tombol pemutar (760624, Neumann U 87).
satu tombol-1 760624 0.43 0.16 0.05
satu tombol-2 760624 3.08 0.16 0.05
satu tombol-3 760624 4.52 0.16 0.05
# Keluarkan: tombol lalu cakram lepas dari poros; dirakit di bawah.
# Balik halaman (513791), satu balikan utuh tiap take.
satu halaman-1 513791 1.50 1.05 0.15
satu halaman-2 513791 3.95 1.10 0.15
satu halaman-3 513791 7.62 1.05 0.15
# Buklet meluncur keluar dari tutup (464302).
satu kertas-1 464302 0.06 1.42 0.25
# Rak bergeser satu album: kait lepas yang pelan (265634).
satu rak-1 265634 5.43 0.2 0.08 8.7
satu rak-2 265634 7.59 0.2 0.08 8.7
satu rak-3 265634 2.89 0.2 0.08 8.7

# keluarkan-1 = tombol-1 + cakram lepas 80 ms kemudian.
ffmpeg -v error -y -i $T/tombol-1.mp3 -i $T/angkat-1.mp3 -filter_complex "[1]adelay=80[b];[0][b]amix=inputs=2:duration=longest:normalize=0,volume=-1dB" -ac 1 -ar 44100 -c:a libmp3lame -b:a 112k $T/keluarkan-1.mp3
echo "keluarkan-1  tombol-1 + angkat-1 @80ms  $(stat -c%s $T/keluarkan-1.mp3) B"

lup motor 207276 6.0 4.0 0.4
lup proyektor 849795 3.0 6.0 0.5 16000
