import { Migration } from '@mikro-orm/migrations';

export class Migration20260619120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "training_session" add column "status" varchar(255) null default 'finished';`,
    );
    this.addSql(
      `alter table "training_session" add column "arrows_per_set" int null;`,
    );
    this.addSql(
      `alter table "training_session" add column "score_total" int null;`,
    );
    this.addSql(
      `alter table "training_session" add column "notes" varchar(255) null;`,
    );
    this.addSql(
      `alter table "training_session" add column "mood" varchar(255) null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "training_session" drop column "status";`);
    this.addSql(`alter table "training_session" drop column "arrows_per_set";`);
    this.addSql(`alter table "training_session" drop column "score_total";`);
    this.addSql(`alter table "training_session" drop column "notes";`);
    this.addSql(`alter table "training_session" drop column "mood";`);
  }
}
