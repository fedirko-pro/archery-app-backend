import { Migration } from '@mikro-orm/migrations';

export class Migration20250212000000_RenameAdminRoleToGeneralAdmin extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `UPDATE "user" SET role = 'general_admin' WHERE role = 'admin';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `UPDATE "user" SET role = 'admin' WHERE role = 'general_admin';`,
    );
  }
}
