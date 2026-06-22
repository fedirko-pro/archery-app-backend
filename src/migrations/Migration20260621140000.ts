import { Migration } from '@mikro-orm/migrations';

export class Migration20260621140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "division_id" varchar(255) null;`,
    );
    this.addSql(
      `alter table "user" add constraint "user_division_id_foreign" foreign key ("division_id") references "division" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" drop constraint "user_division_id_foreign";`,
    );
    this.addSql(`alter table "user" drop column "division_id";`);
  }
}
