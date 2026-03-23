import { Migration } from '@mikro-orm/migrations';

export class Migration20260317123000 extends Migration {
  override async up(): Promise<void> {
    // Check for potential data integrity issues before migration
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM federation 
          GROUP BY code 
          HAVING COUNT(*) > 1
        ) THEN
          RAISE EXCEPTION 'Duplicate federation codes found. Please resolve data conflicts before migration.';
        END IF;
      END
      $$;
    `);

    // Expand federation fields to match updated entity (and migrate code -> short_code)
    this.addSql(
      `alter table "federation" add column "description" varchar(255) null;`,
    );
    this.addSql(
      `alter table "federation" add column "short_code" varchar(255) null;`,
    );
    this.addSql(
      `alter table "federation" add column "logo" varchar(255) null;`,
    );
    this.addSql(`alter table "federation" add column "url" varchar(255) null;`);

    // Backfill short_code from old code column when present
    this.addSql(
      `update "federation" set "short_code" = "code" where "short_code" is null;`,
    );

    // Make short_code required and unique
    this.addSql(
      `alter table "federation" alter column "short_code" set not null;`,
    );
    this.addSql(
      `alter table "federation" add constraint "federation_short_code_unique" unique ("short_code");`,
    );

    // Drop old unique constraint and old columns
    this.addSql(
      `alter table "federation" drop constraint if exists "federation_code_unique";`,
    );
    this.addSql(`alter table "federation" drop column "code";`);
    this.addSql(`alter table "federation" drop column "country_code";`);
  }

  override async down(): Promise<void> {
    // Recreate old columns
    this.addSql(
      `alter table "federation" add column "country_code" varchar(2) not null default 'PT';`,
    );
    this.addSql(
      `alter table "federation" add column "code" varchar(255) not null default 'FED';`,
    );
    this.addSql(
      `alter table "federation" add constraint "federation_code_unique" unique ("code");`,
    );

    // Best-effort: restore code from short_code
    this.addSql(
      `update "federation" set "code" = "short_code" where "code" is null;`,
    );

    this.addSql(
      `alter table "federation" drop constraint if exists "federation_short_code_unique";`,
    );
    this.addSql(`alter table "federation" drop column "description";`);
    this.addSql(`alter table "federation" drop column "short_code";`);
    this.addSql(`alter table "federation" drop column "logo";`);
    this.addSql(`alter table "federation" drop column "url";`);
  }
}
