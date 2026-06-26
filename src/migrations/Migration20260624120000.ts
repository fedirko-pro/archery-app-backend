import { Migration } from '@mikro-orm/migrations';

export class Migration20260624120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "profile_visibility" text not null default 'personal';`,
    );
    this.addSql(
      `update "user" set "profile_visibility" = 'public' where "share_progress_enabled" = true;`,
    );
    this.addSql(`alter table "user" drop column "share_progress_enabled";`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" add column "share_progress_enabled" boolean not null default false;`,
    );
    this.addSql(
      `update "user" set "share_progress_enabled" = true where "profile_visibility" in ('public', 'limited');`,
    );
    this.addSql(`alter table "user" drop column "profile_visibility";`);
  }
}
