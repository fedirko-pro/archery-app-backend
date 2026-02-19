import type { EmailI18n } from '../i18n';
import {
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleLinkMuted,
} from './theme';

export interface PasswordResetContentParams {
  resetUrl: string;
}

export function getPasswordResetContent(
  params: PasswordResetContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { resetUrl } = params;
  const s = t.passwordReset;

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${s.hello}</p>
    <p>${s.body}</p>
    <div style="${styleBlockCenter()}">
      <a href="${resetUrl}"
         style="${styleButton()}">
        ${s.ctaLabel}
      </a>
    </div>
    <p>${s.linkFallback}</p>
    <p style="${styleLinkMuted()}">${resetUrl}</p>
    <p>${s.expiry}</p>
    <p>${s.ignoreNote}</p>
  `;

  const text = `
${s.heading}

${s.hello}

${s.body}

${resetUrl}

${s.expiry}

${s.ignoreNote}
`.trim();

  return { html, text };
}
