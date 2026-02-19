import {
  theme,
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleNeutralBox,
} from './theme';

export interface RoleChangedContentParams {
  recipientName: string;
  adminName: string;
  oldRole: string;
  newRole: string;
  profileUrl: string;
}

/** Human-readable label for each role value. */
const ROLE_LABELS: Record<string, string> = {
  user: 'User',
  club_admin: 'Club Admin',
  federation_admin: 'Federation Admin',
  general_admin: 'General Admin',
};

/** Human-readable permission descriptions per role. */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  user: [
    'Browse and view tournaments',
    'Submit applications to tournaments',
    'View and manage your own applications',
    'Edit your profile',
  ],
  club_admin: [
    'Create and edit tournaments',
    'View and manage tournament applications',
    'Apply other users to tournaments',
    'Create and edit users',
  ],
  federation_admin: [
    'Create and edit tournaments',
    'Delete tournaments',
    'View and manage tournament applications',
    'Edit and delete applications, generate PDFs',
    'Apply other users to tournaments',
    'Create, edit and delete users',
  ],
  general_admin: [
    'Full access to all tournaments and applications',
    'Create, edit and delete users',
    'Manage reference data (categories, clubs, divisions, rules)',
    'Manage role permissions (Access Control)',
    'All other admin capabilities',
  ],
};

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

function getRolePermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getRoleChangedContent(params: RoleChangedContentParams): {
  html: string;
  text: string;
} {
  const { recipientName, adminName, oldRole, newRole, profileUrl } = params;

  const oldRoleLabel = getRoleLabel(oldRole);
  const newRoleLabel = getRoleLabel(newRole);
  const permissions = getRolePermissions(newRole);

  const permissionsHtml = permissions
    .map(
      (p) =>
        `<li style="padding: 4px 0; color: ${theme.colors.text};">${p}</li>`,
    )
    .join('');

  const permissionsText = permissions.map((p) => `  • ${p}`).join('\n');

  const html = `
    <h2 style="${styleHeading()}">Your Role Has Been Updated</h2>
    <p>Hello ${recipientName},</p>
    <p>
      <strong>${adminName}</strong> has updated your role in <strong>Archery App</strong>:
    </p>
    <div style="${styleNeutralBox()} display: flex; gap: 8px; align-items: center;">
      <span style="color: ${theme.colors.textMuted}; text-decoration: line-through;">${oldRoleLabel}</span>
      <span style="color: ${theme.colors.textMuted}; margin: 0 6px;">→</span>
      <span style="font-weight: bold; color: ${theme.colors.primary};">${newRoleLabel}</span>
    </div>
    ${
      permissions.length > 0
        ? `
    <p style="margin-top: 20px;"><strong>With the <em>${newRoleLabel}</em> role you can:</strong></p>
    <ul style="padding-left: 20px; margin: 8px 0;">
      ${permissionsHtml}
    </ul>
    `
        : ''
    }
    <p style="margin-top: 16px;">If you have any questions about your new permissions, please contact your administrator.</p>
    <div style="${styleBlockCenter()}">
      <a href="${profileUrl}"
         style="${styleButton()}">
        View My Profile
      </a>
    </div>
  `;

  const text = `
Your Role Has Been Updated

Hello ${recipientName},

${adminName} has updated your role in Archery App:

  ${oldRoleLabel} → ${newRoleLabel}

${
  permissions.length > 0
    ? `With the "${newRoleLabel}" role you can:\n${permissionsText}`
    : ''
}

If you have any questions about your new permissions, please contact your administrator.

View your profile: ${profileUrl}
`.trim();

  return { html, text };
}
