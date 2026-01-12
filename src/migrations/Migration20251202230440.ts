import { Migration } from '@mikro-orm/migrations';

export class Migration20251202230440 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "target_count" int not null default 18;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tournament" drop column "target_count";`);
  }
}
