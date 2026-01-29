import { Migration } from '@mikro-orm/migrations';

export class Migration20250708132821 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "federation_number" varchar(255) null, add column "categories" text[] null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" drop column "federation_number", drop column "categories";`,
    );
  }
}
