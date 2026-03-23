import { Migration } from '@mikro-orm/migrations';

export class Migration20260317120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "federation" ("id" varchar(255) not null, "name" varchar(255) not null, "code" varchar(255) not null, "country_code" varchar(2) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "federation_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "federation" add constraint "federation_code_unique" unique ("code");`,
    );

    this.addSql(
      `alter table "club" add column "federation_id" varchar(255) null;`,
    );
    this.addSql(
      `alter table "club" add constraint "club_federation_id_foreign" foreign key ("federation_id") references "federation" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "tournament" add column "country_code" varchar(2) null, add column "federation_id" varchar(255) null, add column "is_open_to_other_federations" boolean not null default false, add column "is_open_to_other_countries" boolean not null default false;`,
    );
    this.addSql(
      `alter table "tournament" add constraint "tournament_federation_id_foreign" foreign key ("federation_id") references "federation" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "tournament" drop constraint "tournament_federation_id_foreign";`,
    );
    this.addSql(
      `alter table "tournament" drop column "country_code", drop column "federation_id", drop column "is_open_to_other_federations", drop column "is_open_to_other_countries";`,
    );

    this.addSql(
      `alter table "club" drop constraint "club_federation_id_foreign";`,
    );
    this.addSql(`alter table "club" drop column "federation_id";`);

    this.addSql(`drop table if exists "federation" cascade;`);
  }
}
