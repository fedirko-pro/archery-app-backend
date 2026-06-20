import { Migration } from '@mikro-orm/migrations';

export class Migration20260620120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "share_progress_enabled" boolean not null default false;`,
    );
    this.addSql(
      `alter table "user" add column "onboarding_completed_at" timestamptz null;`,
    );
    this.addSql(
      `update "user" set "onboarding_completed_at" = "created_at" where "onboarding_completed_at" is null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "user" drop column "onboarding_completed_at";`);
    this.addSql(`alter table "user" drop column "share_progress_enabled";`);
  }
}
