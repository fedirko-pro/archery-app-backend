export const Roles = {
  User: 'user',
  GeneralAdmin: 'general_admin',
  ClubAdmin: 'club_admin',
  FederationAdmin: 'federation_admin',
  /** @deprecated Use GeneralAdmin */
  Admin: 'general_admin',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

// Alias for backward compatibility
export const UserRoles = Roles;

/** Roles that can access admin-style features (tournaments, users, applications). */
export const ADMIN_CAPABLE_ROLES = [
  Roles.GeneralAdmin,
  Roles.ClubAdmin,
  Roles.FederationAdmin,
] as const;

/** Roles that can change user roles (Access Control). */
export const ROLES_CAN_CHANGE_ROLE = [Roles.GeneralAdmin] as const;

/** Roles that can delete users or tournaments. */
export const ROLES_CAN_DELETE = [
  Roles.GeneralAdmin,
  Roles.FederationAdmin,
] as const;

/** Roles that can edit/delete applications and generate PDFs. */
export const ROLES_CAN_MANAGE_APPLICATIONS_AND_PDFS = [
  Roles.GeneralAdmin,
  Roles.FederationAdmin,
] as const;

/** Roles that can manage reference data (categories, clubs, divisions, rules). */
export const ROLES_CAN_MANAGE_REFERENCE_DATA = [Roles.GeneralAdmin] as const;

export const VALID_ROLES = [
  'user',
  'general_admin',
  'club_admin',
  'federation_admin',
] as const;

export const AuthProviders = {
  Local: 'local',
  Google: 'google',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];
