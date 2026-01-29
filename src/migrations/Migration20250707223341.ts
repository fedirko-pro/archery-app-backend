import { Migration } from '@mikro-orm/migrations';

export class Migration20250707223341 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "patrol" ("id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "tournament_id" varchar(255) not null, "leader_id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "patrol_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "patrol_member" ("id" varchar(255) not null, "patrol_id" varchar(255) not null, "user_id" varchar(255) not null, "role" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "patrol_member_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "patrol" add constraint "patrol_tournament_id_foreign" foreign key ("tournament_id") references "tournament" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "patrol" add constraint "patrol_leader_id_foreign" foreign key ("leader_id") references "user" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "patrol_member" add constraint "patrol_member_patrol_id_foreign" foreign key ("patrol_id") references "patrol" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "patrol_member" add constraint "patrol_member_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "patrol_member" drop constraint "patrol_member_patrol_id_foreign";`,
    );

    this.addSql(`drop table if exists "patrol" cascade;`);

    this.addSql(`drop table if exists "patrol_member" cascade;`);
  }
}
