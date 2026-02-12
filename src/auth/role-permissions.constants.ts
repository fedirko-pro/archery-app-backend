import { Roles } from '../user/types';

/** Permission keys used in DB and API (short form, no i18n prefix). */
export const PERMISSION_KEYS = [
  'permCreateEditTournament',
  'permDeleteTournament',
  'permCreateEditUser',
  'permDeleteUser',
  'permViewApplications',
  'permEditApplications',
  'permPatrolsPdf',
  'permReferenceData',
  'permAccessControl',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

/** Default role-permission matrix (same as original hardcoded RBAC). */
export const DEFAULT_ROLE_PERMISSIONS_MATRIX: Array<{
  permissionKey: string;
  roles: string[];
}> = [
  {
    permissionKey: 'permCreateEditTournament',
    roles: [Roles.GeneralAdmin, Roles.ClubAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permDeleteTournament',
    roles: [Roles.GeneralAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permCreateEditUser',
    roles: [Roles.GeneralAdmin, Roles.ClubAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permDeleteUser',
    roles: [Roles.GeneralAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permViewApplications',
    roles: [Roles.GeneralAdmin, Roles.ClubAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permEditApplications',
    roles: [Roles.GeneralAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permPatrolsPdf',
    roles: [Roles.GeneralAdmin, Roles.FederationAdmin],
  },
  {
    permissionKey: 'permReferenceData',
    roles: [Roles.GeneralAdmin],
  },
  {
    permissionKey: 'permAccessControl',
    roles: [Roles.GeneralAdmin],
  },
];
