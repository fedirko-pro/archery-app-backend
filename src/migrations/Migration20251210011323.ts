import { Migration } from '@mikro-orm/migrations';

export class Migration20251210011323 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "categories" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "categories";`);
  }
}
