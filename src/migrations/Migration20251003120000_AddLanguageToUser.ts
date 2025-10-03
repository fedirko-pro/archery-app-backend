import { Migration } from '@mikro-orm/migrations';

export class Migration20251003120000_AddLanguageToUser extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "user" add column "language" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "language";`);
  }
}
