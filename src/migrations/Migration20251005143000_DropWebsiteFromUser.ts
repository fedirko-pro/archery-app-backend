import { Migration } from '@mikro-orm/migrations';

export class Migration20251005143000_DropWebsiteFromUser extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "user" drop column "website";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" add column "website" varchar(255) null;`);
  }
}
