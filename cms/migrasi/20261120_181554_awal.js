import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }) {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('id', 'en');
  CREATE TYPE "public"."enum_proyek_jenis" AS ENUM('kerja', 'studio', 'pribadi');
  CREATE TYPE "public"."enum_proyek_status" AS ENUM('dipakai', 'berjalan', 'pilot');
  CREATE TYPE "public"."enum_klien_jenis" AS ENUM('company-profile', 'erp', 'website', 'landing', 'operasional', 'keuangan', 'aplikasi-web', 'pwa', 'saas', 'enterprise', 'link-in-bio', 'dashboard', 'android', 'tools');
  CREATE TYPE "public"."enum_klien_kelompok" AS ENUM('coderoach', 'mitraplus', 'pribadi');
  CREATE TABLE "proyek" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"tampil" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"katalog" varchar,
  	"jenis" "enum_proyek_jenis",
  	"status" "enum_proyek_status",
  	"periode" varchar,
  	"warna" varchar,
  	"tautan_situs" varchar,
  	"tautan_repo" varchar,
  	"tautan_kasus" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "proyek_locales" (
  	"judul" varchar NOT NULL,
  	"ringkas" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "klien_jenis" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_klien_jenis",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "klien" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"tampil" boolean DEFAULT true,
  	"nama" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"kelompok" "enum_klien_kelompok" NOT NULL,
  	"induk" varchar,
  	"tahun" numeric,
  	"tautan" varchar,
  	"cakram" varchar NOT NULL,
  	"album" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "klien_locales" (
  	"industri" varchar NOT NULL,
  	"kerja" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"username" varchar,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"proyek_id" integer,
  	"klien_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "situs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"whatsapp" varchar,
  	"linkedin" varchar,
  	"github" varchar,
  	"cv" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_meta_locales" (
  	"site_name" varchar,
  	"title" varchar,
  	"description" varchar,
  	"keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_gerbang" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_gerbang_locales" (
  	"nama" varchar,
  	"peran" varchar,
  	"headline" varchar,
  	"lihat_proyek" varchar,
  	"hubungi" varchar,
  	"unduh_c_v" varchar,
  	"headline_a" varchar,
  	"headline_b" varchar,
  	"sorot" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_mode" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_mode_locales" (
  	"label" varchar,
  	"imersif" varchar,
  	"ringan" varchar,
  	"imersif_info" varchar,
  	"ringan_info" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_rak" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_rak_locales" (
  	"judul" varchar,
  	"sebelumnya" varchar,
  	"berikutnya" varchar,
  	"buka" varchar,
  	"jenis_kerja" varchar,
  	"jenis_studio" varchar,
  	"jenis_pribadi" varchar,
  	"status_dipakai" varchar,
  	"status_berjalan" varchar,
  	"status_pilot" varchar,
  	"petunjuk_gulir" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_album" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_album_locales" (
  	"tutup" varchar,
  	"buklet" varchar,
  	"putar" varchar,
  	"kembali" varchar,
  	"buka_situs" varchar,
  	"lihat_repo" varchar,
  	"case_study" varchar,
  	"halaman_overview" varchar,
  	"halaman_challenge" varchar,
  	"halaman_decisions" varchar,
  	"halaman_solution" varchar,
  	"halaman_delivery" varchar,
  	"halaman_outcome" varchar,
  	"halaman_architecture" varchar,
  	"periode" varchar,
  	"jenis" varchar,
  	"status" varchar,
  	"tutup_buklet" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_kontak" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_kontak_locales" (
  	"judul" varchar,
  	"teks" varchar,
  	"email" varchar,
  	"whatsapp" varchar,
  	"linkedin" varchar,
  	"github" varchar,
  	"form_judul" varchar,
  	"nama" varchar,
  	"email_anda" varchar,
  	"subjek" varchar,
  	"subjek_isi" varchar,
  	"pesan" varchar,
  	"pesan_isi" varchar,
  	"kirim_email" varchar,
  	"kirim_wa" varchar,
  	"galat_judul" varchar,
  	"galat_kirim" varchar,
  	"terkirim" varchar,
  	"sapa_pagi" varchar,
  	"sapa_siang" varchar,
  	"sapa_sore" varchar,
  	"sapa_malam" varchar,
  	"bantu" varchar,
  	"brief_judul" varchar,
  	"kebutuhan_judul" varchar,
  	"kebutuhan_android" varchar,
  	"kebutuhan_kantor" varchar,
  	"kebutuhan_iklan" varchar,
  	"kebutuhan_konten" varchar,
  	"kebutuhan_belum" varchar,
  	"pemakai_judul" varchar,
  	"pemakai_sendiri" varchar,
  	"pemakai_tim" varchar,
  	"pemakai_perusahaan" varchar,
  	"waktu_judul" varchar,
  	"waktu_bulan_ini" varchar,
  	"waktu_tiga_bulan" varchar,
  	"waktu_menjajaki" varchar,
  	"anggaran_judul" varchar,
  	"anggaran_belum" varchar,
  	"anggaran_bawah" varchar,
  	"anggaran_antara" varchar,
  	"anggaran_atas" varchar,
  	"brief_pesan" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_pemutar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_pemutar_locales" (
  	"putar" varchar,
  	"jeda" varchar,
  	"sembunyi" varchar,
  	"tampil" varchar,
  	"sedang_diputar" varchar,
  	"siap" varchar,
  	"berikutnya" varchar,
  	"domain_publik" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_umum" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_umum_locales" (
  	"bahasa" varchar,
  	"tema_terang" varchar,
  	"tema_gelap" varchar,
  	"lewati" varchar,
  	"suara" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_panggung" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_panggung_locales" (
  	"tentang" varchar,
  	"kontak" varchar,
  	"tutup" varchar,
  	"keluarkan" varchar,
  	"buklet" varchar,
  	"putar_cakram" varchar,
  	"buka_tab" varchar,
  	"case_study" varchar,
  	"memuat" varchar,
  	"pemutar" varchar,
  	"putar" varchar,
  	"jeda" varchar,
  	"sebelumnya" varchar,
  	"berikutnya" varchar,
  	"halaman_sebelumnya" varchar,
  	"halaman_berikutnya" varchar,
  	"keadaan_rak" varchar,
  	"keadaan_buka" varchar,
  	"keadaan_buklet" varchar,
  	"keadaan_putar" varchar,
  	"layar_desktop" varchar,
  	"layar_hp" varchar,
  	"layar_sinarx" varchar,
  	"layar_tampilan" varchar,
  	"layar_sedang_disiapkan" varchar,
  	"layar_buka_tab" varchar,
  	"layar_case_study" varchar,
  	"layar_perbesar" varchar,
  	"layar_perkecil" varchar,
  	"layar_memuat" varchar,
  	"layar_dijeda" varchar,
  	"layar_lanjutkan" varchar,
  	"layar_bisukan" varchar,
  	"layar_bunyikan" varchar,
  	"layar_situs_langsung" varchar,
  	"senter" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_arsitektur" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_arsitektur_locales" (
  	"dipakai" varchar,
  	"kelompok_fitur" varchar,
  	"kelompok_stack" varchar,
  	"kelompok_infrastruktur" varchar,
  	"lihat_diagram" varchar,
  	"judul_halaman" varchar,
  	"kembali" varchar,
  	"diagram" varchar,
  	"teknologi" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_cerita" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_cerita_locales" (
  	"judul" varchar,
  	"lewati" varchar,
  	"bukti" varchar,
  	"ke_rak" varchar,
  	"bab" varchar,
  	"rel" varchar,
  	"ke_bab" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_dunia" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_dunia_locales" (
  	"memuat" varchar,
  	"lonceng" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "teks_klien" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "teks_klien_locales" (
  	"label" varchar,
  	"judul" varchar,
  	"pengantar" varchar,
  	"tab_coderoach" varchar,
  	"tab_mitraplus" varchar,
  	"tab_pribadi" varchar,
  	"set" varchar,
  	"buka" varchar,
  	"tutup" varchar,
  	"kasus" varchar,
  	"sebelumnya" varchar,
  	"berikutnya" varchar,
  	"jenis_company_profile" varchar,
  	"jenis_erp" varchar,
  	"jenis_website" varchar,
  	"jenis_landing" varchar,
  	"jenis_operasional" varchar,
  	"jenis_keuangan" varchar,
  	"jenis_aplikasi_web" varchar,
  	"jenis_pwa" varchar,
  	"jenis_saas" varchar,
  	"jenis_enterprise" varchar,
  	"jenis_link_in_bio" varchar,
  	"jenis_dashboard" varchar,
  	"jenis_android" varchar,
  	"jenis_tools" varchar,
  	"detail" varchar,
  	"buka_album" varchar,
  	"petunjuk_geser" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "proyek_locales" ADD CONSTRAINT "proyek_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."proyek"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "klien_jenis" ADD CONSTRAINT "klien_jenis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."klien"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "klien_locales" ADD CONSTRAINT "klien_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."klien"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proyek_fk" FOREIGN KEY ("proyek_id") REFERENCES "public"."proyek"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_klien_fk" FOREIGN KEY ("klien_id") REFERENCES "public"."klien"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_meta_locales" ADD CONSTRAINT "teks_meta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_meta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_gerbang_locales" ADD CONSTRAINT "teks_gerbang_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_gerbang"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_mode_locales" ADD CONSTRAINT "teks_mode_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_mode"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_rak_locales" ADD CONSTRAINT "teks_rak_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_rak"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_album_locales" ADD CONSTRAINT "teks_album_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_album"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_kontak_locales" ADD CONSTRAINT "teks_kontak_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_kontak"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_pemutar_locales" ADD CONSTRAINT "teks_pemutar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_pemutar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_umum_locales" ADD CONSTRAINT "teks_umum_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_umum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_panggung_locales" ADD CONSTRAINT "teks_panggung_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_panggung"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_arsitektur_locales" ADD CONSTRAINT "teks_arsitektur_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_arsitektur"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_cerita_locales" ADD CONSTRAINT "teks_cerita_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_cerita"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_dunia_locales" ADD CONSTRAINT "teks_dunia_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_dunia"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teks_klien_locales" ADD CONSTRAINT "teks_klien_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teks_klien"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "proyek__order_idx" ON "proyek" USING btree ("_order");
  CREATE UNIQUE INDEX "proyek_slug_idx" ON "proyek" USING btree ("slug");
  CREATE INDEX "proyek_updated_at_idx" ON "proyek" USING btree ("updated_at");
  CREATE INDEX "proyek_created_at_idx" ON "proyek" USING btree ("created_at");
  CREATE UNIQUE INDEX "proyek_locales_locale_parent_id_unique" ON "proyek_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "proyek_locales_parent_id_idx" ON "proyek_locales" USING btree ("_parent_id");
  CREATE INDEX "klien_jenis_order_idx" ON "klien_jenis" USING btree ("order");
  CREATE INDEX "klien_jenis_parent_idx" ON "klien_jenis" USING btree ("parent_id");
  CREATE INDEX "klien__order_idx" ON "klien" USING btree ("_order");
  CREATE UNIQUE INDEX "klien_slug_idx" ON "klien" USING btree ("slug");
  CREATE INDEX "klien_updated_at_idx" ON "klien" USING btree ("updated_at");
  CREATE INDEX "klien_created_at_idx" ON "klien" USING btree ("created_at");
  CREATE UNIQUE INDEX "klien_locales_locale_parent_id_unique" ON "klien_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "klien_locales_parent_id_idx" ON "klien_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_proyek_id_idx" ON "payload_locked_documents_rels" USING btree ("proyek_id");
  CREATE INDEX "payload_locked_documents_rels_klien_id_idx" ON "payload_locked_documents_rels" USING btree ("klien_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "teks_meta_locales_locale_parent_id_unique" ON "teks_meta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_meta_locales_parent_id_idx" ON "teks_meta_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_gerbang_locales_locale_parent_id_unique" ON "teks_gerbang_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_gerbang_locales_parent_id_idx" ON "teks_gerbang_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_mode_locales_locale_parent_id_unique" ON "teks_mode_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_mode_locales_parent_id_idx" ON "teks_mode_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_rak_locales_locale_parent_id_unique" ON "teks_rak_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_rak_locales_parent_id_idx" ON "teks_rak_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_album_locales_locale_parent_id_unique" ON "teks_album_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_album_locales_parent_id_idx" ON "teks_album_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_kontak_locales_locale_parent_id_unique" ON "teks_kontak_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_kontak_locales_parent_id_idx" ON "teks_kontak_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_pemutar_locales_locale_parent_id_unique" ON "teks_pemutar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_pemutar_locales_parent_id_idx" ON "teks_pemutar_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_umum_locales_locale_parent_id_unique" ON "teks_umum_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_umum_locales_parent_id_idx" ON "teks_umum_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_panggung_locales_locale_parent_id_unique" ON "teks_panggung_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_panggung_locales_parent_id_idx" ON "teks_panggung_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_arsitektur_locales_locale_parent_id_unique" ON "teks_arsitektur_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_arsitektur_locales_parent_id_idx" ON "teks_arsitektur_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_cerita_locales_locale_parent_id_unique" ON "teks_cerita_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_cerita_locales_parent_id_idx" ON "teks_cerita_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_dunia_locales_locale_parent_id_unique" ON "teks_dunia_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_dunia_locales_parent_id_idx" ON "teks_dunia_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "teks_klien_locales_locale_parent_id_unique" ON "teks_klien_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "teks_klien_locales_parent_id_idx" ON "teks_klien_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }) {
  await db.execute(sql`
   DROP TABLE "proyek" CASCADE;
  DROP TABLE "proyek_locales" CASCADE;
  DROP TABLE "klien_jenis" CASCADE;
  DROP TABLE "klien" CASCADE;
  DROP TABLE "klien_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "situs" CASCADE;
  DROP TABLE "teks_meta" CASCADE;
  DROP TABLE "teks_meta_locales" CASCADE;
  DROP TABLE "teks_gerbang" CASCADE;
  DROP TABLE "teks_gerbang_locales" CASCADE;
  DROP TABLE "teks_mode" CASCADE;
  DROP TABLE "teks_mode_locales" CASCADE;
  DROP TABLE "teks_rak" CASCADE;
  DROP TABLE "teks_rak_locales" CASCADE;
  DROP TABLE "teks_album" CASCADE;
  DROP TABLE "teks_album_locales" CASCADE;
  DROP TABLE "teks_kontak" CASCADE;
  DROP TABLE "teks_kontak_locales" CASCADE;
  DROP TABLE "teks_pemutar" CASCADE;
  DROP TABLE "teks_pemutar_locales" CASCADE;
  DROP TABLE "teks_umum" CASCADE;
  DROP TABLE "teks_umum_locales" CASCADE;
  DROP TABLE "teks_panggung" CASCADE;
  DROP TABLE "teks_panggung_locales" CASCADE;
  DROP TABLE "teks_arsitektur" CASCADE;
  DROP TABLE "teks_arsitektur_locales" CASCADE;
  DROP TABLE "teks_cerita" CASCADE;
  DROP TABLE "teks_cerita_locales" CASCADE;
  DROP TABLE "teks_dunia" CASCADE;
  DROP TABLE "teks_dunia_locales" CASCADE;
  DROP TABLE "teks_klien" CASCADE;
  DROP TABLE "teks_klien_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_proyek_jenis";
  DROP TYPE "public"."enum_proyek_status";
  DROP TYPE "public"."enum_klien_jenis";
  DROP TYPE "public"."enum_klien_kelompok";`)
}
