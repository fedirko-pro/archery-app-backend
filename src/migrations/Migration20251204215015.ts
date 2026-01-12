import { Migration } from '@mikro-orm/migrations';

export class Migration20251204215015 extends Migration {
  override async up(): Promise<void> {
    // This migration is now idempotent - Migration20251201190757 already creates the correct schema
    // This handles legacy databases that may have the old schema with "name" and "description" columns

    // Check if old column "name" exists (legacy schema)
    this.addSql(`
      DO $$
      BEGIN
        -- Only proceed if we have the old schema (column "name" exists)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'rule' AND column_name = 'name'
        ) THEN
          -- Clear existing data from related tables (test data only)
          DELETE FROM "bow_category";
          DELETE FROM "division";
          DELETE FROM "rule";

          -- Add new columns
          ALTER TABLE "rule" ADD COLUMN "rule_name" varchar(255) NOT NULL DEFAULT '';
          ALTER TABLE "rule" ADD COLUMN "description_en" text NULL;
          ALTER TABLE "rule" ADD COLUMN "description_pt" text NULL;
          ALTER TABLE "rule" ADD COLUMN "description_it" text NULL;
          ALTER TABLE "rule" ADD COLUMN "description_uk" text NULL;
          ALTER TABLE "rule" ADD COLUMN "description_es" text NULL;
          ALTER TABLE "rule" ADD COLUMN "link" varchar(255) NULL;
          ALTER TABLE "rule" ADD COLUMN "download_link" varchar(255) NULL;

          -- Rename columns
          ALTER TABLE "rule" RENAME COLUMN "name" TO "rule_code";
          ALTER TABLE "rule" RENAME COLUMN "description" TO "edition";

          -- Add unique constraint to rule_code if not exists
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'rule_rule_code_unique'
          ) THEN
            ALTER TABLE "rule" ADD CONSTRAINT "rule_rule_code_unique" UNIQUE ("rule_code");
          END IF;
        END IF;
      END $$;
    `);
  }

  override async down(): Promise<void> {
    // Reverse the changes - convert back to old schema
    this.addSql(`
      DO $$
      BEGIN
        -- Only proceed if we have the new schema (column "rule_code" exists)
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'rule' AND column_name = 'rule_code'
        ) THEN
          ALTER TABLE "rule" DROP CONSTRAINT IF EXISTS "rule_rule_code_unique";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "rule_name";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "description_en";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "description_pt";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "description_it";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "description_uk";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "description_es";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "link";
          ALTER TABLE "rule" DROP COLUMN IF EXISTS "download_link";

          ALTER TABLE "rule" RENAME COLUMN "rule_code" TO "name";
          ALTER TABLE "rule" RENAME COLUMN "edition" TO "description";
        END IF;
      END $$;
    `);
  }
}
