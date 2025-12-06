import { Migration } from '@mikro-orm/migrations';

export class Migration20251201190757 extends Migration {
  override async up(): Promise<void> {
    // Create Club table
    this.addSql(`
      create table "club" (
        "id" varchar(255) not null,
        "name" varchar(255) not null,
        "description" varchar(255) null,
        "location" varchar(255) null,
        "club_logo" varchar(255) null,
        "created_at" timestamptz null,
        "updated_at" timestamptz null,
        constraint "club_pkey" primary key ("id")
      );
    `);

    // Create Rule table with correct schema
    this.addSql(`
      create table "rule" (
        "id" varchar(255) not null,
        "rule_code" varchar(255) not null,
        "rule_name" varchar(255) not null,
        "edition" varchar(255) null,
        "description_en" text null,
        "description_pt" text null,
        "description_it" text null,
        "description_uk" text null,
        "description_es" text null,
        "link" varchar(255) null,
        "download_link" varchar(255) null,
        "created_at" timestamptz null,
        "updated_at" timestamptz null,
        constraint "rule_pkey" primary key ("id"),
        constraint "rule_rule_code_unique" unique ("rule_code")
      );
    `);

    // Create Division table
    this.addSql(`
      create table "division" (
        "id" varchar(255) not null,
        "name" varchar(255) not null,
        "description" varchar(255) null,
        "rule_id" varchar(255) not null,
        "created_at" timestamptz null,
        "updated_at" timestamptz null,
        constraint "division_pkey" primary key ("id")
      );
    `);

    this.addSql(`
      alter table "division"
        add constraint "division_rule_id_foreign"
        foreign key ("rule_id")
        references "rule" ("id")
        on update cascade;
    `);

    this.addSql(
      `create index "division_rule_id_index" on "division" ("rule_id");`,
    );

    // Create BowCategory table
    this.addSql(`
      create table "bow_category" (
        "id" varchar(255) not null,
        "name" varchar(255) not null,
        "code" varchar(255) null,
        "description" varchar(255) null,
        "rule_id" varchar(255) not null,
        "created_at" timestamptz null,
        "updated_at" timestamptz null,
        constraint "bow_category_pkey" primary key ("id")
      );
    `);

    this.addSql(`
      alter table "bow_category"
        add constraint "bow_category_rule_id_foreign"
        foreign key ("rule_id")
        references "rule" ("id")
        on update cascade;
    `);

    this.addSql(
      `create index "bow_category_rule_id_index" on "bow_category" ("rule_id");`,
    );

    // Update User table - add new fields
    this.addSql(`alter table "user" add column "fabp_id" varchar(255) null;`);
    this.addSql(
      `alter table "user" add column "nationality" varchar(255) null;`,
    );
    this.addSql(`alter table "user" add column "sex" varchar(255) null;`);
    this.addSql(`alter table "user" add column "club_id" varchar(255) null;`);

    this.addSql(`
      alter table "user"
        add constraint "user_club_id_foreign"
        foreign key ("club_id")
        references "club" ("id")
        on update cascade
        on delete set null;
    `);

    this.addSql(`create index "user_club_id_index" on "user" ("club_id");`);

    // Update User table - remove old field (categories array)
    this.addSql(`alter table "user" drop column if exists "categories";`);
    this.addSql(
      `alter table "user" drop column if exists "federation_number";`,
    );

    // Update Tournament table - add rule_id
    this.addSql(
      `alter table "tournament" add column "rule_id" varchar(255) null;`,
    );

    this.addSql(`
      alter table "tournament"
        add constraint "tournament_rule_id_foreign"
        foreign key ("rule_id")
        references "rule" ("id")
        on update cascade
        on delete set null;
    `);

    this.addSql(
      `create index "tournament_rule_id_index" on "tournament" ("rule_id");`,
    );

    // Update TournamentApplication table
    // First, add new columns
    this.addSql(
      `alter table "tournament_application" add column "division_id" varchar(255) null;`,
    );
    this.addSql(
      `alter table "tournament_application" add column "bow_category_id" varchar(255) null;`,
    );

    this.addSql(`
      alter table "tournament_application"
        add constraint "tournament_application_division_id_foreign"
        foreign key ("division_id")
        references "division" ("id")
        on update cascade
        on delete set null;
    `);

    this.addSql(
      `create index "tournament_application_division_id_index" on "tournament_application" ("division_id");`,
    );

    this.addSql(`
      alter table "tournament_application"
        add constraint "tournament_application_bow_category_id_foreign"
        foreign key ("bow_category_id")
        references "bow_category" ("id")
        on update cascade
        on delete set null;
    `);

    this.addSql(
      `create index "tournament_application_bow_category_id_index" on "tournament_application" ("bow_category_id");`,
    );

    // Remove old columns
    this.addSql(
      `alter table "tournament_application" drop column if exists "category";`,
    );
    this.addSql(
      `alter table "tournament_application" drop column if exists "division";`,
    );
    this.addSql(
      `alter table "tournament_application" drop column if exists "equipment";`,
    );
  }

  override async down(): Promise<void> {
    // Revert TournamentApplication changes
    this.addSql(
      `alter table "tournament_application" drop constraint if exists "tournament_application_bow_category_id_foreign";`,
    );
    this.addSql(
      `alter table "tournament_application" drop constraint if exists "tournament_application_division_id_foreign";`,
    );
    this.addSql(
      `drop index if exists "tournament_application_bow_category_id_index";`,
    );
    this.addSql(
      `drop index if exists "tournament_application_division_id_index";`,
    );
    this.addSql(
      `alter table "tournament_application" drop column if exists "bow_category_id";`,
    );
    this.addSql(
      `alter table "tournament_application" drop column if exists "division_id";`,
    );
    this.addSql(
      `alter table "tournament_application" add column "category" varchar(255) null;`,
    );
    this.addSql(
      `alter table "tournament_application" add column "division" varchar(255) null;`,
    );
    this.addSql(
      `alter table "tournament_application" add column "equipment" varchar(255) null;`,
    );

    // Revert Tournament changes
    this.addSql(
      `alter table "tournament" drop constraint if exists "tournament_rule_id_foreign";`,
    );
    this.addSql(`drop index if exists "tournament_rule_id_index";`);
    this.addSql(`alter table "tournament" drop column if exists "rule_id";`);

    // Revert User changes
    this.addSql(
      `alter table "user" drop constraint if exists "user_club_id_foreign";`,
    );
    this.addSql(`drop index if exists "user_club_id_index";`);
    this.addSql(`alter table "user" drop column if exists "club_id";`);
    this.addSql(`alter table "user" drop column if exists "sex";`);
    this.addSql(`alter table "user" drop column if exists "nationality";`);
    this.addSql(`alter table "user" drop column if exists "fabp_id";`);
    this.addSql(
      `alter table "user" add column "federation_number" varchar(255) null;`,
    );
    this.addSql(`alter table "user" add column "categories" text[] null;`);

    // Drop new tables (in reverse order due to foreign keys)
    this.addSql(
      `alter table "bow_category" drop constraint if exists "bow_category_rule_id_foreign";`,
    );
    this.addSql(`drop index if exists "bow_category_rule_id_index";`);
    this.addSql(`drop table if exists "bow_category" cascade;`);

    this.addSql(
      `alter table "division" drop constraint if exists "division_rule_id_foreign";`,
    );
    this.addSql(`drop index if exists "division_rule_id_index";`);
    this.addSql(`drop table if exists "division" cascade;`);

    this.addSql(`drop table if exists "rule" cascade;`);
    this.addSql(`drop table if exists "club" cascade;`);
  }
}
