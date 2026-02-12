import { Injectable, OnModuleInit } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { RolePermission } from './entity/role-permission.entity';
import { DEFAULT_ROLE_PERMISSIONS_MATRIX } from './role-permissions.constants';

export interface PermissionMatrixRow {
  permissionKey: string;
  roles: string[];
}

@Injectable()
export class RolePermissionsService implements OnModuleInit {
  private cache: PermissionMatrixRow[] | null = null;

  constructor(private readonly em: EntityManager) {}

  async onModuleInit(): Promise<void> {
    await this.loadCache();
  }

  private async loadCache(): Promise<void> {
    const fork = this.em.fork();
    const rows = await fork.find(RolePermission, {});
    if (rows.length === 0) {
      this.cache = [...DEFAULT_ROLE_PERMISSIONS_MATRIX];
      await this.seedDefaults(fork);
      return;
    }
    const byPermission = new Map<string, string[]>();
    for (const r of rows) {
      const list = byPermission.get(r.permissionKey) ?? [];
      list.push(r.role);
      byPermission.set(r.permissionKey, list);
    }
    this.cache = DEFAULT_ROLE_PERMISSIONS_MATRIX.map(({ permissionKey }) => ({
      permissionKey,
      roles: byPermission.get(permissionKey) ?? [],
    }));
  }

  getMatrix(): PermissionMatrixRow[] {
    if (!this.cache) {
      return [...DEFAULT_ROLE_PERMISSIONS_MATRIX];
    }
    return this.cache;
  }

  hasPermission(role: string, permissionKey: string): boolean {
    const matrix = this.getMatrix();
    const row = matrix.find((r) => r.permissionKey === permissionKey);
    return row ? row.roles.includes(role) : false;
  }

  async setPermission(
    role: string,
    permissionKey: string,
    enabled: boolean,
  ): Promise<void> {
    const fork = this.em.fork();
    const existing = await fork.findOne(RolePermission, {
      role,
      permissionKey,
    });
    if (enabled && !existing) {
      const entity = fork.create(RolePermission, { role, permissionKey });
      await fork.persistAndFlush(entity);
    } else if (!enabled && existing) {
      await fork.removeAndFlush(existing);
    }
    await this.loadCache();
  }

  async getMatrixAsync(): Promise<PermissionMatrixRow[]> {
    await this.loadCache();
    return this.getMatrix();
  }

  private async seedDefaults(fork: EntityManager): Promise<void> {
    for (const row of DEFAULT_ROLE_PERMISSIONS_MATRIX) {
      for (const role of row.roles) {
        const entity = fork.create(RolePermission, {
          role,
          permissionKey: row.permissionKey,
        });
        await fork.persist(entity);
      }
    }
    await fork.flush();
  }
}
