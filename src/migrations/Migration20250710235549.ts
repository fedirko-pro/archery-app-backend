import { Migration } from '@mikro-orm/migrations';

export class Migration20250710235549 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "tournament_application" ("id" varchar(255) not null, "tournament_id" varchar(255) not null, "applicant_id" varchar(255) not null, "status" varchar(255) not null default 'pending', "category" varchar(255) null, "division" varchar(255) null, "equipment" varchar(255) null, "notes" varchar(255) null, "rejection_reason" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "tournament_application_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_tournament_id_foreign" foreign key ("tournament_id") references "tournament" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_applicant_id_foreign" foreign key ("applicant_id") references "user" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tournament_application" cascade;`);
  }
}
