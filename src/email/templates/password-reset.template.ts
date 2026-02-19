import {
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleLinkMuted,
} from './theme';

export interface PasswordResetContentParams {
  resetUrl: string;
}

export function getPasswordResetContent(params: PasswordResetContentParams): {
  html: string;
  text: string;
} {
  const { resetUrl } = params;
  const html = `
    <h2 style="${styleHeading()}">Password Reset Request</h2>
    <p>Hello,</p>
    <p>You have requested to reset your password. Please click the button below to proceed:</p>
    <div style="${styleBlockCenter()}">
      <a href="${resetUrl}"
         style="${styleButton()}">
        Reset Password
      </a>
    </div>
    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="${styleLinkMuted()}">${resetUrl}</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
  `;
  const text = `
Password Reset Request

Hello,

You have requested to reset your password. Please visit the following link to proceed:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.
`.trim();
  return { html, text };
}
