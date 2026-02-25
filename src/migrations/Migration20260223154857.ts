import { Migration } from '@mikro-orm/migrations';

export class Migration20260223154857 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "training_session" ("id" varchar(255) not null, "user_id" varchar(255) not null, "date" date not null, "shots_count" int null, "distance" varchar(255) null, "target_type" varchar(255) null, "equipment_set_id" varchar(255) null, "custom_fields" jsonb null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "training_session_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "equipment_set" ("id" varchar(255) not null, "user_id" varchar(255) not null, "name" varchar(255) not null, "bow_type" varchar(255) null, "manufacturer" varchar(255) null, "model" varchar(255) null, "draw_weight" varchar(255) null, "arrow_length" varchar(255) null, "arrow_weight" varchar(255) null, "arrow_material" varchar(255) null, "custom_fields" jsonb null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "equipment_set_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "training_session" add constraint "training_session_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "equipment_set" add constraint "equipment_set_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "user" add column "sync_trainings_and_equipment" boolean not null default false;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "training_session" cascade;`);

    this.addSql(`drop table if exists "equipment_set" cascade;`);

    this.addSql(
      `alter table "user" drop column "sync_trainings_and_equipment";`,
    );
  }
}
