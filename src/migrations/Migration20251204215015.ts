import { Migration } from '@mikro-orm/migrations';

export class Migration20251204215015 extends Migration {
  override async up(): Promise<void> {
    // Clear existing data from related tables (test data only)
    this.addSql(`DELETE FROM "bow_category";`);
    this.addSql(`DELETE FROM "division";`);
    this.addSql(`DELETE FROM "rule";`);

    // Add new columns (rule_name as NOT NULL from the start since we cleared the data)
    this.addSql(
      `alter table "rule" add column "rule_name" varchar(255) not null, add column "description_en" text null, add column "description_pt" text null, add column "description_it" text null, add column "description_uk" text null, add column "description_es" text null, add column "link" varchar(255) null, add column "download_link" varchar(255) null;`,
    );

    // Rename columns
    this.addSql(`alter table "rule" rename column "name" to "rule_code";`);
    this.addSql(`alter table "rule" rename column "description" to "edition";`);

    // Add unique constraint to rule_code
    this.addSql(
      `alter table "rule" add constraint "rule_rule_code_unique" unique ("rule_code");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "rule" drop constraint "rule_rule_code_unique";`);
    this.addSql(
      `alter table "rule" drop column "rule_name", drop column "description_en", drop column "description_pt", drop column "description_it", drop column "description_uk", drop column "description_es", drop column "link", drop column "download_link";`,
    );

    this.addSql(`alter table "rule" rename column "rule_code" to "name";`);
    this.addSql(`alter table "rule" rename column "edition" to "description";`);
  }
}
