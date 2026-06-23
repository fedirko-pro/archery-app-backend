import { Migration } from '@mikro-orm/migrations';

export class Migration20260623120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "collect_feedback" boolean not null default false;`,
    );

    this.addSql(
      `create table "tournament_feedback" ("id" varchar(255) not null, "tournament_id" varchar(255) not null, "user_id" varchar(255) not null, "rating" smallint not null, "comment" varchar(2000) null, "created_at" timestamptz not null, constraint "tournament_feedback_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_tournament_id_foreign" foreign key ("tournament_id") references "tournament" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "tournament_feedback" add constraint "tournament_feedback_tournament_id_user_id_unique" unique ("tournament_id", "user_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tournament_feedback" cascade;`);
    this.addSql(`alter table "tournament" drop column "collect_feedback";`);
  }
}
