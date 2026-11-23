import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }) {
  await db.execute(sql`
   CREATE TABLE "kode_bank" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nama" varchar NOT NULL,
  	"sidik" varchar,
  	"aktif" boolean DEFAULT true,
  	"kedaluwarsa" timestamp(3) with time zone,
  	"terakhir_masuk" timestamp(3) with time zone,
  	"catatan" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "kode_bank_id" integer;
  CREATE UNIQUE INDEX "kode_bank_sidik_idx" ON "kode_bank" USING btree ("sidik");
  CREATE INDEX "kode_bank_updated_at_idx" ON "kode_bank" USING btree ("updated_at");
  CREATE INDEX "kode_bank_created_at_idx" ON "kode_bank" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kode_bank_fk" FOREIGN KEY ("kode_bank_id") REFERENCES "public"."kode_bank"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_kode_bank_id_idx" ON "payload_locked_documents_rels" USING btree ("kode_bank_id");`)
}

export async function down({ db, payload, req }) {
  await db.execute(sql`
   ALTER TABLE "kode_bank" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "kode_bank" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_kode_bank_fk";
  
  DROP INDEX "payload_locked_documents_rels_kode_bank_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "kode_bank_id";`)
}
