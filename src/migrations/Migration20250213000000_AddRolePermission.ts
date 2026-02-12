import { Migration } from '@mikro-orm/migrations';
import { DEFAULT_ROLE_PERMISSIONS_MATRIX } from '../auth/role-permissions.constants';

export class Migration20250213000000_AddRolePermission extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "role_permission" ("role" varchar(255) not null, "permission_key" varchar(255) not null, constraint "role_permission_pkey" primary key ("role", "permission_key"));`,
    );

    for (const row of DEFAULT_ROLE_PERMISSIONS_MATRIX) {
      for (const role of row.roles) {
        this.addSql(
          `insert into "role_permission" ("role", "permission_key") values ('${role.replace(/'/g, "''")}', '${row.permissionKey.replace(/'/g, "''")}');`,
        );
      }
    }
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "role_permission";`);
  }
}
