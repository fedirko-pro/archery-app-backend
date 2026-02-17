import { Migration } from '@mikro-orm/migrations';

export class Migration20260217144407 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "club" ("id" varchar(255) not null, "name" varchar(255) not null, "short_code" varchar(255) null, "description" varchar(255) null, "location" varchar(255) null, "club_logo" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "club_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "role_permission" ("role" varchar(255) not null, "permission_key" varchar(255) not null, constraint "role_permission_pkey" primary key ("role", "permission_key"));`,
    );

    this.addSql(
      `create table "rule" ("id" varchar(255) not null, "rule_code" varchar(255) not null, "rule_name" varchar(255) not null, "edition" varchar(255) null, "description_en" text null, "description_pt" text null, "description_it" text null, "description_uk" text null, "description_es" text null, "link" varchar(255) null, "download_link" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "rule_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "rule" add constraint "rule_rule_code_unique" unique ("rule_code");`,
    );

    this.addSql(
      `create table "division" ("id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "rule_id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "division_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "bow_category" ("id" varchar(255) not null, "code" varchar(255) not null, "name" varchar(255) not null, "description_en" text null, "description_pt" text null, "description_it" text null, "description_uk" text null, "description_es" text null, "rule_reference" varchar(255) null, "rule_citation" varchar(255) null, "rule_id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "bow_category_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "bow_category" add constraint "bow_category_code_unique" unique ("code");`,
    );

    this.addSql(
      `create table "user" ("id" varchar(255) not null, "role" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) null, "auth_provider" varchar(255) not null default 'local', "first_name" varchar(255) null, "last_name" varchar(255) null, "picture" varchar(255) null, "bio" varchar(255) null, "location" varchar(255) null, "app_language" varchar(255) null, "reset_password_token" varchar(255) null, "reset_password_expires" timestamptz null, "federation_number" varchar(255) null, "nationality" varchar(255) null, "gender" varchar(255) null, "categories" jsonb null, "club_id" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "user_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "tournament" ("id" varchar(255) not null, "title" varchar(255) not null, "description" varchar(255) null, "address" varchar(255) null, "location_coords" jsonb null, "start_date" timestamptz not null, "end_date" timestamptz null, "application_deadline" timestamptz null, "allow_multiple_applications" boolean not null default true, "target_count" int not null default 18, "banner" varchar(255) null, "attachments" jsonb null, "created_by_id" varchar(255) not null, "rule_id" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "tournament_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "tournament_application" ("id" varchar(255) not null, "tournament_id" varchar(255) not null, "applicant_id" varchar(255) not null, "status" varchar(255) not null default 'pending', "division_id" varchar(255) null, "bow_category_id" varchar(255) null, "notes" varchar(255) null, "rejection_reason" varchar(255) null, "processed_by_id" varchar(255) null, "processed_at" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "tournament_application_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "patrol" ("id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "tournament_id" varchar(255) not null, "leader_id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "patrol_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "patrol_member" ("id" varchar(255) not null, "patrol_id" varchar(255) not null, "user_id" varchar(255) not null, "role" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "patrol_member_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "division" add constraint "division_rule_id_foreign" foreign key ("rule_id") references "rule" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "bow_category" add constraint "bow_category_rule_id_foreign" foreign key ("rule_id") references "rule" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "user" add constraint "user_club_id_foreign" foreign key ("club_id") references "club" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "tournament" add constraint "tournament_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "tournament" add constraint "tournament_rule_id_foreign" foreign key ("rule_id") references "rule" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_tournament_id_foreign" foreign key ("tournament_id") references "tournament" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_applicant_id_foreign" foreign key ("applicant_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_division_id_foreign" foreign key ("division_id") references "division" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_bow_category_id_foreign" foreign key ("bow_category_id") references "bow_category" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "tournament_application" add constraint "tournament_application_processed_by_id_foreign" foreign key ("processed_by_id") references "user" ("id") on update cascade on delete set null;`,
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
}
