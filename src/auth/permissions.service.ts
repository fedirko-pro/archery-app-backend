import { Injectable } from '@nestjs/common';
import { Roles } from '../user/types';
import { RolePermissionsService } from './role-permissions.service';
import type { RequestUser, TournamentWithCreator } from './permissions';

@Injectable()
export class PermissionsService {
  constructor(private readonly rolePermissions: RolePermissionsService) {}

  hasPermission(role: string, permissionKey: string): boolean {
    return this.rolePermissions.hasPermission(role, permissionKey);
  }

  canCreateTournament(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permCreateEditTournament');
  }

  canUpdateTournament(
    user: RequestUser,
    tournament: TournamentWithCreator,
  ): boolean {
    if (!this.hasPermission(user.role, 'permCreateEditTournament')) {
      return false;
    }
    if (
      user.role === Roles.GeneralAdmin ||
      user.role === Roles.FederationAdmin
    ) {
      return true;
    }
    if (user.role === Roles.ClubAdmin && tournament.createdBy.id === user.sub) {
      return true;
    }
    return false;
  }

  canDeleteTournament(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permDeleteTournament');
  }

  canManageUsers(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permCreateEditUser');
  }

  canDeleteUser(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permDeleteUser');
  }

  canChangeRole(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permAccessControl');
  }

  canViewTournamentApplications(
    user: RequestUser,
    tournament: TournamentWithCreator | null,
  ): boolean {
    if (!tournament) return false;
    if (!this.hasPermission(user.role, 'permViewApplications')) return false;
    if (user.role === Roles.GeneralAdmin) return true;
    if (
      (user.role === Roles.ClubAdmin || user.role === Roles.FederationAdmin) &&
      tournament.createdBy.id === user.sub
    ) {
      return true;
    }
    return false;
  }

  canManageApplicationsAndPdfs(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permEditApplications');
  }

  canManageReferenceData(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permReferenceData');
  }

  canAccessControl(user: RequestUser): boolean {
    return this.hasPermission(user.role, 'permAccessControl');
  }
}
