import { Migration } from '@mikro-orm/migrations';

export class Migration20250211000000_AddApplyOtherUsersPermission extends Migration {
  async up(): Promise<void> {
    // Add the new permission for all admin roles
    this.addSql(
      `insert into "role_permission" ("role", "permission_key") values ('general_admin', 'permApplyOtherUsers') on conflict do nothing;`,
    );
    this.addSql(
      `insert into "role_permission" ("role", "permission_key") values ('club_admin', 'permApplyOtherUsers') on conflict do nothing;`,
    );
    this.addSql(
      `insert into "role_permission" ("role", "permission_key") values ('federation_admin', 'permApplyOtherUsers') on conflict do nothing;`,
    );
  }

  async down(): Promise<void> {
    this.addSql(
      `delete from "role_permission" where "permission_key" = 'permApplyOtherUsers';`,
    );
  }
}
