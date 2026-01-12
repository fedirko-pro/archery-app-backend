import { Migration } from '@mikro-orm/migrations';

export class Migration20251130231219 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament_application" add column "processed_by_id" varchar(255) null, add column "processed_at" timestamptz null;`,
    );
    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_processed_by_id_foreign" foreign key ("processed_by_id") references "user" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament_application" drop constraint "tournament_application_processed_by_id_foreign";`,
    );

    this.addSql(
      `alter table "tournament_application" drop column "processed_by_id", drop column "processed_at";`,
    );
  }
}
