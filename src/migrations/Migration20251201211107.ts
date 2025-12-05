import { Migration } from '@mikro-orm/migrations';

export class Migration20251201211107 extends Migration {
  override async up(): Promise<void> {
    // Remove fabp_id if exists (from previous migration)
    this.addSql(`alter table "user" drop column if exists "fabp_id";`);

    // Add federation_number if it doesn't exist (keeping it from original schema)
    this.addSql(`
      do $$
      begin
        if not exists (
          select 1 from information_schema.columns
          where table_name = 'user' and column_name = 'federation_number'
        ) then
          alter table "user" add column "federation_number" varchar(255) null;
        end if;
      end $$;
    `);
  }

  override async down(): Promise<void> {
    // Revert: remove federation_number and add back fabp_id
    this.addSql(
      `alter table "user" drop column if exists "federation_number";`,
    );
    this.addSql(`alter table "user" add column "fabp_id" varchar(255) null;`);
  }
}
