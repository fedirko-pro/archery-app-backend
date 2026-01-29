import { Migration } from '@mikro-orm/migrations';

export class Migration20250727211853_AddAllowMultipleApplicationsToTournament extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "allow_multiple_applications" boolean not null default true;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament" drop column "allow_multiple_applications";`,
    );
  }
}
