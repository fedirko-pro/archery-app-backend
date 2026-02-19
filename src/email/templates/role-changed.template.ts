import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
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

export function getRoleChangedContent(
  params: RoleChangedContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { recipientName, adminName, oldRole, newRole, profileUrl } = params;
  const s = t.roleChanged;

  const getRoleLabel = (role: string) => s.roleLabels[role] ?? role;
  const getRolePermissions = (role: string): string[] =>
    s.rolePermissions[role] ?? [];

  const oldRoleLabel = getRoleLabel(oldRole);
  const newRoleLabel = getRoleLabel(newRole);
  const permissions = getRolePermissions(newRole);

  const greeting = interpolate(s.greeting, { name: recipientName });
  const body = interpolate(s.body, { adminName });
  const permissionsHeading = interpolate(s.permissionsHeading, {
    role: newRoleLabel,
  });

  const permissionsHtml = permissions
    .map(
      (p) =>
        `<li style="padding: 4px 0; color: ${theme.colors.text};">${p}</li>`,
    )
    .join('');

  const permissionsText = permissions.map((p) => `  • ${p}`).join('\n');

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
    <div style="${styleNeutralBox()} display: flex; gap: 8px; align-items: center;">
      <span style="color: ${theme.colors.textMuted}; text-decoration: line-through;">${oldRoleLabel}</span>
      <span style="color: ${theme.colors.textMuted}; margin: 0 6px;">→</span>
      <span style="font-weight: bold; color: ${theme.colors.primary};">${newRoleLabel}</span>
    </div>
    ${
      permissions.length > 0
        ? `
    <p style="margin-top: 20px;"><strong>${permissionsHeading}</strong></p>
    <ul style="padding-left: 20px; margin: 8px 0;">
      ${permissionsHtml}
    </ul>
    `
        : ''
    }
    <p style="margin-top: 16px;">${s.questionsNote}</p>
    <div style="${styleBlockCenter()}">
      <a href="${profileUrl}"
         style="${styleButton()}">
        ${s.ctaLabel}
      </a>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${body}

  ${oldRoleLabel} → ${newRoleLabel}

${permissions.length > 0 ? `${permissionsHeading}\n${permissionsText}` : ''}

${s.questionsNote}

${s.ctaLabel}: ${profileUrl}
`.trim();

  return { html, text };
}
