# Situs belajar interaktif sejenis designed-to-scale

20 Nov 2026. Permintaan Farrez: daftar situs seperti [designed-to-scale](https://designed-to-scale.vercel.app/#/request-lifecycle/5)
untuk cloud (AWS dan lainnya) dan keamanan siber. Dipakai juga sebagai rujukan isi layar kokpit dan
tablet prosedur, supaya pengunjung merasa sedang berada di dalam simulasi (game di dalam game).

**V** = dibuka hari ini, **I** = hanya dari cuplikan atau listing, **U** = gagal dibuka.
Jenis: **visual** (penjelasan visual interaktif), **lab** (lab praktik), **kursus**.

## Cloud

| Situs | Isi | Jenis | Biaya | Mirip | Label |
|---|---|---|---|---|---|
| [Interactive Kubernetes, explained](https://kubernetes-explained.vercel.app/) | pod, scheduler, Service, kube-proxy, jalur request lewat ingress; tombol play, pause, step | visual | tidak disebut | sangat | V |
| [Toolkit, Guides](https://toolkit-1m9.pages.dev/how-it-works) | 38 panduan: VPC, jaringan Kubernetes, autoscaling, API gateway, NAT, BGP | visual | tidak disebut | sangat | V |
| [Cloud DevOps Explorer](https://krrish20.github.io/Cloud-DevOps-Explorer/) | 30+ konsep dari cloud sampai Kubernetes, Terraform, CI/CD; diagram animasi dan kuis | visual | gratis | tinggi | V |
| [LearnKube: jalur paket di Kubernetes](https://learnkube.com/kubernetes-network-packets) | paket dari container sampai Service, diagram bertahap | visual | gratis | tinggi | V |
| [CIDR.xyz](https://cidr.xyz) | kalkulator subnet dengan peta bit | visual (alat) | gratis | sedang | V |
| [Mess With DNS](https://messwithdns.net) | subdomain sungguhan, log query langsung | lab | perlu login | sedang | V |
| [iximiuz Labs](https://labs.iximiuz.com) | playground Kubernetes, Docker, Linux, challenge | lab | akun gratis, premium | rendah | V |
| [Killercoda](https://killercoda.com) | skenario Kubernetes, Linux, Helm, persiapan CKA | lab | ada tier berbayar | rendah | V |
| [SadServers](https://sadservers.com) | troubleshooting server rusak | lab | bisa tanpa daftar | rendah | V |
| [AWS Cloud Quest dan Skill Builder](https://aws.amazon.com/training/digital/aws-cloud-quest/) | game peran dan lab console AWS | lab | akun gratis terbatas | rendah | V |
| [Google Skills](https://www.skills.google/) | lab di console Google Cloud (dulu Cloud Skills Boost) | lab | perlu akun | rendah | V |
| [Microsoft Learn](https://learn.microsoft.com/en-us/training/) | modul Azure | kursus | tidak disebut | rendah | V |
| [Cloud Resume Challenge](https://cloudresumechallenge.dev) | proyek 16 langkah di akun cloud sendiri | kursus | tidak tertulis | rendah | V |
| [Cascode](https://www.producthunt.com/products/cascode) | kanvas layanan AWS, injeksi kegagalan, tanpa akun AWS | visual (simulator) | tidak diketahui | tinggi | I |
| Play with Kubernetes | dihentikan sejak 1 Maret 2026 | lab | | | V |

## Keamanan siber

| Situs | Isi | Jenis | Biaya | Mirip | Label |
|---|---|---|---|---|---|
| [Cyber Security Visual Learning Lab](https://kishoresweety.github.io/CyberSecurity/) | simulasi animasi DNS, HTTPS, firewall sampai MITM, SQLi, XSS, DDoS | visual | tidak disebut | sangat (isi belum dinilai) | V |
| [The Illustrated TLS 1.3 Connection](https://tls13.xargs.org) | sesi TLS byte demi byte; juga versi QUIC, DTLS, TLS 1.2 | visual | gratis | tinggi | V |
| [Hacksplaining](https://www.hacksplaining.com) | OWASP Top 10 dan prompt injection, pelajaran 15 sampai 30 menit | visual | gratis pribadi | tinggi | V |
| [How HTTPS works (komik)](https://dnsimple.com/comics/how-https-works/) | kunci, handshake, Certificate Authority | visual (komik) | gratis | sedang | V |
| [CyberChef](https://gchq.github.io/CyberChef/) | resep encode, decode, kripto di browser | alat | gratis | sedang | V |
| [PortSwigger Web Security Academy](https://portswigger.net/web-security) | lab web rentan (SQLi, XSS, SSRF, JWT, LLM) | lab | gratis | rendah sampai sedang | V |
| [XSS game](https://xss-game.appspot.com) | level game XSS | lab | tidak disebut | rendah sampai sedang | V |
| [TryHackMe](https://tryhackme.com) | 1.400+ lab, mesin di browser | lab, kursus | akun gratis, premium | rendah sampai sedang | V |
| [Hack The Box Academy](https://academy.hackthebox.com) | modul bertingkat, Pwnbox | kursus, lab | akun, berbayar | rendah | V |
| [CryptoHack](https://cryptohack.org) | puzzle kriptografi modern | lab | gratis | rendah | V |
| [OverTheWire](https://overthewire.org/wargames/) | wargame lewat SSH, mulai dari Bandit | lab | tidak disebut | rendah | V |
| [pwn.college](https://pwn.college) | dojo dan challenge di browser | lab | gratis | rendah | V |
| [picoCTF, kini CyLab Security Academy](https://picoctf.org) | CTF CMU | lab | gratis | rendah | V |
| [Pwned Labs](https://pwnedlabs.io) | lab keamanan cloud AWS, Azure, GCP | lab | ada tier gratis | rendah | V |
| [Wiz Cloud Security Championship](https://www.cloudsecuritychampionship.com) | CTF keamanan cloud bulanan | lab | akun | rendah | V |
| [CloudGoat](https://github.com/RhinoSecurityLabs/cloudgoat) | skenario AWS rentan di akun sendiri (biaya AWS sendiri) | lab | gratis | rendah | V |
| [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) | aplikasi rentan dipasang sendiri | lab | gratis | rendah | V |
| [Cryptopals](https://cryptopals.com) | delapan set latihan koding kripto | lab | terbuka | rendah | V |
| flAWS.cloud | gagal dibuka hari ini | lab | | | U |

## Desain sistem (pembanding)

| Situs | Isi | Jenis | Mirip | Label |
|---|---|---|---|---|
| [Reqflow](https://getreqflow.com) | 31 sistem dengan request trace per langkah dan kuis | visual | sangat | V |
| [200 Milliseconds](https://200ms.thenodebook.com) | satu HTTP request dari DNS sampai Postgres dan kembali | visual | sangat | V |
| [Toolkit, Guides dan Simulators](https://toolkit-1m9.pages.dev/) | Kafka, caching, CAP, Raft, 34 simulator | visual | sangat | V |
| [Full Stack Observatory](https://markusisaksson1982.github.io/layers/networking) | TCP handshake dengan play, step, kecepatan | visual | sangat | V |
| [Encore Queueing](https://encore.dev/blog/queueing), [samwho.dev](https://samwho.dev) | esai visual interaktif (antrean, load balancing, hashing) | visual | sangat, tinggi | V |
| [Breakscale](https://breakscale.tech) | sandbox: susun LB, cache, DB, naikkan traffic sampai gagal | visual (simulator) | tinggi | V |
| [Raft](https://raft.github.io), [The Secret Lives of Data](https://thesecretlivesofdata.com/raft/) | konsensus Raft di browser | visual | tinggi | V |
| [VisuAlgo](https://visualgo.net/en) | animasi struktur data, ada bahasa Indonesia | visual | tinggi | V |
| [Learn Git Branching](https://learngitbranching.js.org) | graf Git visual | visual | sedang | V |

Yang tidak ditemukan: penjelasan visual interaktif khusus IAM, serverless, atau Terraform yang
setara designed-to-scale.
