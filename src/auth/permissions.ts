import {
  Roles,
  ROLES_CAN_DELETE,
  ROLES_CAN_MANAGE_APPLICATIONS_AND_PDFS,
  ROLES_CAN_MANAGE_REFERENCE_DATA,
  ROLES_CAN_CHANGE_ROLE,
  ADMIN_CAPABLE_ROLES,
} from '../user/types';

export interface RequestUser {
  sub: string;
  role: string;
}

export interface TournamentWithCreator {
  createdBy: { id: string };
}

/**
 * Can create tournaments (Club Admin, Federation Admin, General Admin).
 */
export function canCreateTournament(user: RequestUser): boolean {
  return (ADMIN_CAPABLE_ROLES as readonly string[]).includes(user.role);
}

/**
 * Can update this tournament (General Admin, Federation Admin, or Club Admin if owner).
 */
export function canUpdateTournament(
  user: RequestUser,
  tournament: TournamentWithCreator,
): boolean {
  if (user.role === Roles.GeneralAdmin || user.role === Roles.FederationAdmin) {
    return true;
  }
  if (user.role === Roles.ClubAdmin && tournament.createdBy.id === user.sub) {
    return true;
  }
  return false;
}

/**
 * Can delete tournaments (General Admin, Federation Admin).
 */
export function canDeleteTournament(user: RequestUser): boolean {
  return (ROLES_CAN_DELETE as readonly string[]).includes(user.role);
}

/**
 * Can access admin user list, view, and edit users (all admin-capable roles).
 * Role change and delete are separate.
 */
export function canManageUsers(user: RequestUser): boolean {
  return (ADMIN_CAPABLE_ROLES as readonly string[]).includes(user.role);
}

/**
 * Can delete users (General Admin, Federation Admin).
 */
export function canDeleteUser(user: RequestUser): boolean {
  return (ROLES_CAN_DELETE as readonly string[]).includes(user.role);
}

/**
 * Can change user roles (General Admin only).
 */
export function canChangeRole(user: RequestUser): boolean {
  return (ROLES_CAN_CHANGE_ROLE as readonly string[]).includes(user.role);
}

/**
 * Can view applications for this tournament (General Admin always; Club/Federation if owner).
 */
export function canViewTournamentApplications(
  user: RequestUser,
  tournament: TournamentWithCreator | null,
): boolean {
  if (!tournament) return false;
  if (user.role === Roles.GeneralAdmin) return true;
  if (
    (user.role === Roles.ClubAdmin || user.role === Roles.FederationAdmin) &&
    tournament.createdBy.id === user.sub
  ) {
    return true;
  }
  return false;
}

/**
 * Can edit/delete applications and generate PDFs (Federation Admin, General Admin).
 */
export function canManageApplicationsAndPdfs(user: RequestUser): boolean {
  return (ROLES_CAN_MANAGE_APPLICATIONS_AND_PDFS as readonly string[]).includes(
    user.role,
  );
}

/**
 * Can manage reference data (categories, clubs, divisions, rules). General Admin only.
 */
export function canManageReferenceData(user: RequestUser): boolean {
  return (ROLES_CAN_MANAGE_REFERENCE_DATA as readonly string[]).includes(
    user.role,
  );
}

/**
 * Can access Access Control page and change roles. General Admin only.
 */
export function canAccessControl(user: RequestUser): boolean {
  return canChangeRole(user);
}
