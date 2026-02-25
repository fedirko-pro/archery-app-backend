import { Migration } from '@mikro-orm/migrations';

export class Migration20260223170403 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" alter column "sync_trainings_and_equipment" type boolean using ("sync_trainings_and_equipment"::boolean);`,
    );
    this.addSql(
      `alter table "user" alter column "sync_trainings_and_equipment" drop not null;`,
    );

    this.addSql(
      `alter table "equipment_set" add column "arrow_spine" varchar(255) null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" alter column "sync_trainings_and_equipment" type boolean using ("sync_trainings_and_equipment"::boolean);`,
    );
    this.addSql(
      `alter table "user" alter column "sync_trainings_and_equipment" set not null;`,
    );

    this.addSql(`alter table "equipment_set" drop column "arrow_spine";`);
  }
}
