#!/bin/bash
# Potong rekaman CC0 jadi suara ruangan cerita gulir v3 (bab per bab). Satu-tembakan: mono 44,1 kHz MP3,
# puncak dinormalkan ke -3 dBFS. Lup: WAV 22,05 kHz dengan sambungan disilang-pudar.
set -e
A=/d/downloads/claude/2026-11-11-suara-cerita/asli
T=${T:-$(cd "$(dirname "$0")/../.." && pwd)/public/assets/suara}
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

# Mesin tik Royal Quiet De Luxe (240839): ketikan di awal, lonceng dan geser kereta di ujung.
satu ketik-1 240839_2688492 0.33 2.0 0.25
satu ketik-2 240839_2688492 3.93 2.0 0.25
satu lonceng-1 240839_2688492 18.95 1.1 0.2
# Ketikan laptop pelan (721033).
satu papan-1 721033_15630346 5.0 2.2 0.3
satu papan-2 721033_15630346 14.0 2.2 0.3
# Relay besar yang menyalakan lampu tungsten di soundstage Los Angeles (870770).
satu relay-1 870770_18412227 1.83 0.6 0.15
satu relay-2 870770_18412227 3.43 0.6 0.15
satu relay-3 870770_18412227 5.58 0.42 0.12
# Tirai ditarik (51140, kain digerakkan). 185044 terlalu pelan (puncak -26 dB), desisnya ikut naik.
satu tirai-1 51140_179538 0.0 1.6 0.4
# Segel ditekan (759526) dan stempel kantor (784653).
satu segel-1 759526_16331384 0.27 0.3 0.08
satu segel-2 784653_3151368 1.06 0.4 0.1
# Room tone studio TV dengan semua lampu mati (329550): lup 10 detik, 11,025 kHz (isinya dengung rendah).
lup ruang 329550_1442200 20 10 1.0 11025
