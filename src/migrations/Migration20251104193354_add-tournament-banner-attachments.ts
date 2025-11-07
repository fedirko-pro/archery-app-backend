import { Migration } from '@mikro-orm/migrations';

export class Migration20251104193354_addTournamentBannerAttachments extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "banner" varchar(255) null, add column "attachments" jsonb null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament" drop column "banner", drop column "attachments";`,
    );
  }
}
