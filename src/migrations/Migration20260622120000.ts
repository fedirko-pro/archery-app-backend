import { Migration } from '@mikro-orm/migrations';

export class Migration20260622120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "tournament" add column "country" varchar(2) null;`,
    );
    this.addSql(`alter table "user" add column "country" varchar(2) null;`);
    this.addSql(
      `update "tournament" set "country" = 'PT' where "country" is null;`,
    );
    this.addSql(
      `update "user" set "country" = 'PT' where "country" is null and "nationality" = 'Portuguesa';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "tournament" drop column "country";`);
    this.addSql(`alter table "user" drop column "country";`);
  }
}
