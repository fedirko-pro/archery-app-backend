import { Migration } from '@mikro-orm/migrations';

export class Migration20260317124500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "country" ("code" varchar(2) not null, "name" varchar(255) not null, "flag_emoji" varchar(255) null, "enabled" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz null, constraint "country_pkey" primary key ("code"));`,
    );

    // Seed Portugal
    this.addSql(
      `insert into "country" ("code", "name", "flag_emoji", "enabled", "created_at") values ('PT', 'Portugal', '🇵🇹', true, now()) on conflict ("code") do nothing;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "country" cascade;`);
  }
}
