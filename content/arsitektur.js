// Cerita arsitektur per proyek: satu permintaan pengguna dari awal sampai akhir.
// Fakta dicek dari repo masing-masing (5 Nov 2026). Aturan keterbukaan publik ada di
// docs/decisions/0008-safe-public-architecture.md: tidak ada host, endpoint, versi,
// skema, detail login, region, atau nama klien. Teknologi dirujuk lewat kunci katalog
// di components/arsitektur/teknologi.js.

const l = (judul, rincian, teknologi) => ({ judul, rincian, teknologi });

export const ARSITEKTUR = {
  "erp-software-house": {
    alur: [
      l(
        { id: "Staf membuka layar transaksi", en: "Staff open a transaction screen" },
        { id: "Staf di kantor klien bekerja di aplikasi web, dari order sampai laporan.", en: "Staff at the client's office work in the web app, from orders to reports." },
        ["react"],
      ),
      l(
        { id: "API meneruskan permintaan", en: "The API passes the request on" },
        { id: "Layanan API menerima permintaan dari layar lalu memanggil database.", en: "The API service takes the request from the screen and calls the database." },
        ["express", "bun"],
      ),
      l(
        { id: "Aturan bisnis jalan di database", en: "Business rules run in the database" },
        { id: "Logika yang berat ditulis sebagai stored procedure di SQL Server.", en: "The heavy logic lives in SQL Server stored procedures." },
        ["sqlserver"],
      ),
      l(
        { id: "Hasilnya kembali ke layar", en: "The result comes back to the screen" },
        { id: "Data yang sudah diolah tampil lagi di layar staf.", en: "The processed data shows up on the staff's screen." },
        ["react"],
      ),
      l(
        { id: "Perubahan naik lewat GitOps", en: "Changes ship through GitOps" },
        { id: "Setiap perubahan dikemas jadi image Docker dan naik lewat alur GitOps.", en: "Every change is packed into a Docker image and released through a GitOps flow." },
        ["docker"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Distribusi dan servis", en: "Distribution and service" },
        { id: "Asuransi kesehatan", en: "Health insurance" },
        { id: "Payroll perkebunan", en: "Plantation payroll" },
      ],
      stack: ["react", "express", "bun", "sqlserver"],
      infrastruktur: ["docker"],
    },
  },

  "coderoach-os": {
    alur: [
      l(
        { id: "Pull request dibuka atau digabung", en: "A pull request is opened or merged" },
        { id: "GitHub mengirim kabar ke aplikasi studio lewat webhook.", en: "GitHub notifies the studio app through a webhook." },
        ["github"],
      ),
      l(
        { id: "Kiriman diperiksa dan dicatat", en: "The event is checked and logged" },
        { id: "Aplikasi memastikan kirimannya asli, menyimpannya, lalu langsung menjawab. Sisanya diproses di belakang.", en: "The app makes sure the event is genuine, stores it and answers right away. The rest runs in the background." },
        ["nextjs"],
      ),
      l(
        { id: "Status story bergerak sendiri", en: "The story status moves on its own" },
        { id: "Pull request dikaitkan ke story-nya, status pengembangan dihitung ulang, dan perubahannya masuk jejak audit.", en: "The pull request is linked to its story, the development status is recalculated, and the change goes into the audit trail." },
        ["postgresql"],
      ),
      l(
        { id: "Merge ke main jadi rilis", en: "A merge to main becomes a release" },
        { id: "Begitu digabung ke cabang utama, pekerjaan itu tercatat sudah rilis.", en: "Once merged into the main branch, the work is recorded as released." },
        ["postgresql"],
      ),
      l(
        { id: "Agen AI ikut membaca papan", en: "AI agents read the board too" },
        { id: "Agen AI melihat dan memperbarui story dan tugas lewat server MCP.", en: "AI agents list and update stories and tasks through an MCP server." },
        ["mcp"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Proyek dan jam kerja", en: "Projects and timesheets" },
        { id: "Invoice dan kas", en: "Invoices and cash" },
        { id: "Pembukuan", en: "Bookkeeping" },
      ],
      stack: ["nextjs", "typescript", "postgresql", "drizzle", "mcp"],
      infrastruktur: ["vercel", "githubactions", "github"],
    },
  },

  fifofun: {
    alur: [
      l(
        { id: "Unggah e-Statement", en: "Upload the e-Statement" },
        { id: "Pengguna mengunggah mutasi bank berbentuk .xlsx dari halaman impor.", en: "The user uploads the bank's .xlsx statement on the import page." },
        ["excel"],
      ),
      l(
        { id: "Kiriman diperiksa dulu", en: "The upload is checked first" },
        { id: "Server memastikan kiriman datang dari situs sendiri dan ukurannya wajar sebelum dibaca.", en: "The server makes sure the upload comes from its own site and has a sane size before reading it." },
        ["nextjs"],
      ),
      l(
        { id: "Berkas dibaca", en: "The file is read" },
        { id: "Pembaca .xlsx buatan sendiri membuka berkasnya, termasuk yang dikunci sandi.", en: "A small in-house .xlsx reader opens the file, including password-locked ones." },
        ["excel"],
      ),
      l(
        { id: "Dicocokkan dengan saldo bank", en: "Matched against the bank balance" },
        { id: "Tiap baris dicocokkan dengan saldo dari bank. Kalau tidak cocok, tidak ada yang disimpan.", en: "Every line is matched against the bank's balance. If it doesn't add up, nothing is saved." },
        ["nextjs"],
      ),
      l(
        { id: "Disimpan per rumah tangga", en: "Saved per household" },
        { id: "Data tiap rumah tangga dipisah sampai ke level baris database.", en: "Each household's data is kept apart down to the database row." },
        ["postgresql", "drizzle"],
      ),
      l(
        { id: "Ringkasan jadi PDF", en: "The summary becomes a PDF" },
        { id: "Ringkasan tiga bulan dirender di server jadi PDF ukuran A4.", en: "A three-month summary is rendered on the server as an A4 PDF." },
        ["pdf"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Impor e-Statement", en: "e-Statement import" },
        { id: "Rekonsiliasi saldo", en: "Balance reconciliation" },
        { id: "Ringkasan PDF", en: "PDF summary" },
      ],
      stack: ["nextjs", "typescript", "postgresql", "drizzle", "pdf"],
      infrastruktur: ["vercel", "githubactions"],
    },
  },

  "nds-etl": {
    alur: [
      l(
        { id: "Jam berdetak tiap jam", en: "A clock ticks every hour" },
        { id: "Worker Cloudflare membangunkan dashboard sekali sejam. Hanya itu tugasnya.", en: "A Cloudflare Worker wakes the dashboard once an hour. That is its only job." },
        ["cloudflare", "jadwal"],
      ),
      l(
        { id: "Dashboard menentukan giliran", en: "The dashboard picks who is due" },
        { id: "Dashboard menghitung akun mana yang sudah waktunya, lalu memicu job pengambilan data.", en: "The dashboard works out which accounts are due and starts a data job for each." },
        ["nextjs", "githubactions"],
      ),
      l(
        { id: "Data portal diambil", en: "Portal data is collected" },
        { id: "Peramban tanpa layar masuk ke portal distributor dan mengambil datanya.", en: "A headless browser signs in to the distributor portal and collects the data." },
        ["playwright"],
      ),
      l(
        { id: "Rencana repeat order disusun", en: "The repeat order plan is built" },
        { id: "Mesin strategi menyusun rencana mingguan dan menyimpan potretnya.", en: "The strategy engine builds the weekly plan and saves a snapshot." },
        ["mesin", "postgresql"],
      ),
      l(
        { id: "Distributor dikabari", en: "Distributors get a heads-up" },
        { id: "Pengingat harian dikirim lewat email dan notifikasi push. Rinciannya dibaca di dashboard dari HP.", en: "A daily reminder goes out by email and push notification. The details are read on the dashboard, on a phone." },
        ["email", "push"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Rencana repeat order", en: "Repeat order plan" },
        { id: "Pengingat harian", en: "Daily reminders" },
        { id: "Dashboard ramah HP", en: "Phone-friendly dashboard" },
      ],
      stack: ["nextjs", "typescript", "postgresql", "drizzle", "playwright", "email", "push"],
      infrastruktur: ["vercel", "cloudflare", "githubactions"],
    },
  },

  akarkita: {
    alur: [
      l(
        { id: "Foto dikecilkan di peramban", en: "The photo is shrunk in the browser" },
        { id: "Sebelum dikirim, foto dikompres jadi WebP di perangkat pengguna.", en: "Before it is sent, the photo is compressed to WebP on the user's device." },
        ["peramban"],
      ),
      l(
        { id: "Pengunggah diperiksa", en: "The uploader is checked" },
        { id: "Server memastikan pengguna sudah masuk dan perannya boleh mengubah pohon.", en: "The server makes sure the user is signed in and their role may edit the tree." },
        ["nextjs"],
      ),
      l(
        { id: "Berkasnya diperiksa ulang", en: "The file is checked again" },
        { id: "Ukuran dan jenis berkas dicek lagi dari isinya, bukan dari namanya.", en: "Size and file type are checked again from the content, not the file name." },
        ["nextjs"],
      ),
      l(
        { id: "Foto disimpan privat", en: "The photo is stored privately" },
        { id: "Foto masuk penyimpanan privat yang tidak bisa dibuka langsung dari luar.", en: "The photo goes into private storage that can't be opened directly from outside." },
        ["foto"],
      ),
      l(
        { id: "Pohon diperbarui", en: "The tree is updated" },
        { id: "Data foto dan orangnya diperbarui, lengkap dengan catatan audit.", en: "The photo and the person's record are updated, with an audit entry." },
        ["postgresql", "drizzle"],
      ),
      l(
        { id: "Hanya keluarga yang melihat", en: "Only family can see it" },
        { id: "Foto ditampilkan lewat aplikasi, hanya untuk anggota yang sudah masuk.", en: "The photo is served through the app, only to signed-in members." },
        ["nextjs"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Sebutan kerabat Sunda", en: "Sundanese kinship terms" },
        { id: "Garis suku Minang", en: "Minang clan lines" },
        { id: "Hanya lewat undangan", en: "Invite only" },
        { id: "Pengingat ulang tahun", en: "Birthday reminders" },
      ],
      stack: ["nextjs", "typescript", "postgresql", "drizzle", "pwa", "push"],
      infrastruktur: ["vercel", "foto", "githubactions"],
    },
  },

  "pilot-iklan": {
    alur: [
      l(
        { id: "Draf iklan ditulis", en: "Ad drafts are written" },
        { id: "Draf iklan dan teks landing page disimpan sebagai berkas.", en: "Ad drafts and landing page copy are kept as files." },
        ["meta"],
      ),
      l(
        { id: "Dicek terhadap aturan", en: "Checked against the rules" },
        { id: "Pemeriksa otomatis mencocokkan tiap draf dengan aturan iklan produk kesehatan.", en: "An automatic checker matches every draft against health-product ad rules." },
        ["cekAturan"],
      ),
      l(
        { id: "Yang melanggar tertahan", en: "Anything that breaks a rule is held" },
        { id: "Satu pelanggaran berat saja membuat pemeriksaan gagal, dan draf itu tidak boleh tayang.", en: "One serious violation fails the check, and that draft can't go live." },
        ["cekAturan"],
      ),
      l(
        { id: "Kampanye dibuat dalam jeda", en: "Campaigns start paused" },
        { id: "Kampanye dibuat dalam keadaan jeda dan baru jalan setelah disetujui manual.", en: "Campaigns are created paused and only run after a manual approval." },
        ["meta"],
      ),
      l(
        { id: "Lanjut ngobrol di WhatsApp", en: "On to a WhatsApp chat" },
        { id: "Rencananya, pengunjung landing page lanjut mengobrol lewat WhatsApp.", en: "The plan is for landing page visitors to carry on in a WhatsApp chat." },
        ["whatsapp"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Gerbang aturan iklan", en: "Ad policy gate" },
        { id: "Landing page", en: "Landing page" },
        { id: "Obrolan WhatsApp", en: "WhatsApp chat" },
      ],
      stack: ["typescript", "astro", "cekAturan"],
      infrastruktur: ["cloudflare"],
    },
  },

  jeda: {
    alur: [
      l(
        { id: "Menulis tanpa sinyal", en: "Writing with no signal" },
        { id: "Catatan pikiran tersimpan dulu di HP dan ditandai belum terkirim.", en: "The thought record is saved on the phone first and marked as not yet synced." },
        ["penyimpananHp", "pwa"],
      ),
      l(
        { id: "Sinkron saat online", en: "Syncing once online" },
        { id: "Begitu ada sinyal, catatan yang belum terkirim dikirim ke server, yang memeriksa sesi pengguna.", en: "Once there is signal, unsynced notes go to the server, which checks the user's session." },
        ["nextjs"],
      ),
      l(
        { id: "Digabung di database", en: "Merged in the database" },
        { id: "Semua baris digabung dalam satu transaksi, lalu versi server dikirim balik ke HP.", en: "All rows are merged in one transaction, and the server's version goes back to the phone." },
        ["postgresql", "prisma"],
      ),
      l(
        { id: "Klien membagikan tautan", en: "The client shares a link" },
        { id: "Klien membuat tautan berbatas waktu, bisa ditambah PIN.", en: "The client makes a time-limited link, with an optional PIN." },
        ["tautan"],
      ),
      l(
        { id: "Psikolog membaca", en: "The psychologist reads" },
        { id: "Psikolog membuka tautan itu dan hanya bisa membaca, tidak mengubah.", en: "The psychologist opens the link and can read, not edit." },
        ["peramban"],
      ),
      l(
        { id: "Bisa dibawa sebagai PDF", en: "Available as a PDF" },
        { id: "Catatan yang sama bisa diunduh sebagai PDF.", en: "The same notes can be downloaded as a PDF." },
        ["pdf"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Jalan tanpa sinyal", en: "Works offline" },
        { id: "Tautan untuk psikolog", en: "Link for the psychologist" },
        { id: "Pengingat harian", en: "Daily reminder" },
      ],
      stack: ["nextjs", "typescript", "pwa", "penyimpananHp", "postgresql", "prisma", "pdf", "push"],
      infrastruktur: ["vercel"],
    },
  },

  yiheecam: {
    alur: [
      l(
        { id: "Tersambung ke WiFi kamera", en: "Joining the camera's WiFi" },
        { id: "Aplikasi meminta Android memakai WiFi kamera untuk seluruh aplikasi, tanpa internet.", en: "The app asks Android to route the whole app through the camera's WiFi, with no internet." },
        ["android", "wifi"],
      ),
      l(
        { id: "Sesi dibuka", en: "A session opens" },
        { id: "Aplikasi membuka sesi dengan kamera lewat perintah JSON, dan kamera menjawab.", en: "The app opens a session with the camera using JSON commands, and the camera replies." },
        ["kamera"],
      ),
      l(
        { id: "Alamat siaran diterima", en: "The stream address arrives" },
        { id: "Balasan kamera membawa alamat siaran live view.", en: "The camera's reply carries the live view stream address." },
        ["kamera"],
      ),
      l(
        { id: "Live view tampil", en: "Live view plays" },
        { id: "Gambar dari kamera diputar langsung di layar HP lewat RTSP.", en: "The camera's picture plays live on the phone over RTSP." },
        ["hp"],
      ),
      l(
        { id: "Rekam dari HP", en: "Recording from the phone" },
        { id: "Tombol rana mengirim perintah rekam. Kalau kamera menolak, alasannya ditampilkan.", en: "The shutter button sends the record command. If the camera refuses, the reason is shown." },
        ["kamera"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Live view", en: "Live view" },
        { id: "Rekam dan setting", en: "Recording and settings" },
        { id: "Baterai dan kartu SD", en: "Battery and SD card" },
      ],
      stack: ["kotlin", "jetpackcompose", "android"],
      infrastruktur: [],
    },
  },

  "d-day": {
    alur: [
      l(
        { id: "Timer tiap candle 4 jam", en: "A timer at every 4-hour candle" },
        { id: "Begitu candle 4 jam ditutup, timer menjalankan satu putaran.", en: "When a 4-hour candle closes, a timer starts one run." },
        ["jadwal"],
      ),
      l(
        { id: "Rem darurat dicek", en: "The kill switches are checked" },
        { id: "Mesin mencatat putarannya dan memeriksa saklar henti sebelum apa pun.", en: "The engine logs the run and checks the halt switches before anything else." },
        ["mesin"],
      ),
      l(
        { id: "Candle ditarik", en: "Candles are pulled in" },
        { id: "Candle yang sudah tutup ditarik dari bursa ke database.", en: "Closed candles are pulled from the exchange into the database." },
        ["bursa", "postgresql"],
      ),
      l(
        { id: "Sinyal dievaluasi", en: "Signals are evaluated" },
        { id: "Sinyal yang tertunda dieksekusi di testnet atau simulator, tidak pernah dengan uang sungguhan.", en: "Pending signals run on the testnet or a simulator, never with real money." },
        ["mesin", "bursa"],
      ),
      l(
        { id: "Dipantau dari dashboard", en: "Watched from the dashboard" },
        { id: "Status, sinyal, dan transaksi disimpan. Operator memantau di dashboard dan bisa menghentikan semuanya.", en: "State, signals and deals are saved. The operator watches the dashboard and can halt everything." },
        ["nextjs", "postgresql"],
      ),
    ],
    teknologi: {
      fitur: [
        { id: "Gerbang testnet", en: "Testnet gate" },
        { id: "Saklar henti", en: "Halt switch" },
        { id: "Grafik candle", en: "Candle charts" },
      ],
      stack: ["typescript", "nextjs", "postgresql", "mesin"],
      infrastruktur: [],
    },
  },
};
