import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import {
  theme,
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleLinkMuted,
  styleNeutralBox,
} from './theme';

export interface InvitationContentParams {
  recipientName: string;
  adminName: string;
  setPasswordUrl: string;
}

export function getInvitationContent(
  params: InvitationContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { recipientName, adminName, setPasswordUrl } = params;
  const s = t.invitation;

  const greeting = interpolate(t.welcome.greeting, { name: recipientName });
  const body = interpolate(s.body, { adminName });

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${body}</p>
    <div style="${styleBlockCenter()}">
      <a href="${setPasswordUrl}"
         style="${styleButton()}">
        ${s.ctaLabel}
      </a>
    </div>
    <p>${s.linkFallback}</p>
    <p style="${styleLinkMuted()}">${setPasswordUrl}</p>
    <div style="${styleNeutralBox()}">
      <p style="margin: 0; color: ${theme.colors.text};">
        ${s.expiry} ${s.ignoreNote}
      </p>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${body}

${setPasswordUrl}

${s.expiry}
${s.ignoreNote}
`.trim();

  return { html, text };
}
