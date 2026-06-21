import { Migration } from '@mikro-orm/migrations';

export class Migration20260621120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" alter column "sync_trainings_and_equipment" set default true;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" alter column "sync_trainings_and_equipment" set default false;`,
    );
  }
}
