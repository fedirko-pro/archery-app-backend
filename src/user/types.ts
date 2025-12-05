export const Roles = {
  User: 'user',
  Admin: 'admin',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

// Alias for backward compatibility
export const UserRoles = Roles;

export const AuthProviders = {
  Local: 'local',
  Google: 'google',
} as const;

export type AuthProvider = (typeof AuthProviders)[keyof typeof AuthProviders];
