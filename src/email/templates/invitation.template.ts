import {
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleLinkMuted,
} from './theme';

export interface InvitationContentParams {
  setPasswordUrl: string;
  recipientName?: string;
}

/**
 * Content for admin-invited user: set password link.
 * Wire in user service when implementing invite flow.
 */
export function getInvitationContent(params: InvitationContentParams): {
  html: string;
  text: string;
} {
  const { setPasswordUrl, recipientName = 'there' } = params;
  const greeting =
    recipientName === 'there' ? 'Hello,' : `Hello ${recipientName},`;
  const html = `
    <h2 style="${styleHeading()}">You're Invited to Archery App</h2>
    <p>${greeting}</p>
    <p>An administrator has created an account for you. Click the button below to set your password and get started:</p>
    <div style="${styleBlockCenter()}">
      <a href="${setPasswordUrl}"
         style="${styleButton()}">
        Set Password
      </a>
    </div>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="${styleLinkMuted()}">${setPasswordUrl}</p>
    <p>This link will expire in 1 hour for security reasons.</p>
  `;
  const text = `
You're Invited to Archery App

${greeting}

An administrator has created an account for you. Visit the link below to set your password and get started:

${setPasswordUrl}

This link will expire in 1 hour for security reasons.
`.trim();
  return { html, text };
}
