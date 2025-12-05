import { Migration } from '@mikro-orm/migrations';

export class Migration20251204230700 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "bow_category" add column "description_en" text null, add column "description_pt" text null, add column "description_it" text null, add column "description_uk" text null, add column "description_es" text null, add column "rule_citation" varchar(255) null;`,
    );
    this.addSql(
      `alter table "bow_category" alter column "code" type varchar(255) using ("code"::varchar(255));`,
    );
    this.addSql(`alter table "bow_category" alter column "code" set not null;`);
    this.addSql(
      `alter table "bow_category" rename column "description" to "rule_reference";`,
    );
    this.addSql(
      `alter table "bow_category" add constraint "bow_category_code_unique" unique ("code");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "bow_category" drop constraint "bow_category_code_unique";`,
    );
    this.addSql(
      `alter table "bow_category" drop column "description_en", drop column "description_pt", drop column "description_it", drop column "description_uk", drop column "description_es", drop column "rule_citation";`,
    );

    this.addSql(
      `alter table "bow_category" alter column "code" type varchar(255) using ("code"::varchar(255));`,
    );
    this.addSql(
      `alter table "bow_category" alter column "code" drop not null;`,
    );
    this.addSql(
      `alter table "bow_category" rename column "rule_reference" to "description";`,
    );
  }
}
