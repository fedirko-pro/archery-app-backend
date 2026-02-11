import { Migration } from '@mikro-orm/migrations';

export class Migration20251211120000_AddShortCodeToClub extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'alter table "club" add column "short_code" varchar(255) null;',
    );
  }

  override async down(): Promise<void> {
    this.addSql('alter table "club" drop column "short_code";');
  }
}
