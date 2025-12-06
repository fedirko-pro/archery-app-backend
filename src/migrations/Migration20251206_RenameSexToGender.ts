import { Migration } from '@mikro-orm/migrations';

export class Migration20251206_RenameSexToGender extends Migration {
  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "user" RENAME COLUMN "sex" TO "gender";`);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "user" RENAME COLUMN "gender" TO "sex";`);
  }
}
