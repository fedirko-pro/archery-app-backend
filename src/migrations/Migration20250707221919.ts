import { Migration } from '@mikro-orm/migrations';

export class Migration20250707221919 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "tournament" ("id" varchar(255) not null, "title" varchar(255) not null, "description" varchar(255) null, "address" varchar(255) null, "location_coords" jsonb null, "start_date" timestamptz not null, "end_date" timestamptz not null, "created_by_id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "tournament_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "tournament" add constraint "tournament_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tournament" cascade;`);
  }
}
