import { Entity, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';

@Entity({ tableName: 'role_permission' })
export class RolePermission {
  @PrimaryKey()
  role: string;

  @PrimaryKey()
  @Property({ fieldName: 'permission_key' })
  permissionKey: string;

  [PrimaryKeyProp]?: ['role', 'permissionKey'];
}
