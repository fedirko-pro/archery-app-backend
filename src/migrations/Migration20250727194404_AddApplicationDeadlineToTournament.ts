import { Migration } from '@mikro-orm/migrations';

export class Migration20250727194404_AddApplicationDeadlineToTournament extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "application_deadline" timestamptz null;`,
    );
    this.addSql(
      `alter table "tournament" alter column "end_date" type timestamptz using ("end_date"::timestamptz);`,
    );
    this.addSql(
      `alter table "tournament" alter column "end_date" drop not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tournament" drop column "application_deadline";`);

    this.addSql(
      `alter table "tournament" alter column "end_date" type timestamptz using ("end_date"::timestamptz);`,
    );
    this.addSql(
      `alter table "tournament" alter column "end_date" set not null;`,
    );
  }
}
