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

export function getInvitationContent(params: InvitationContentParams): {
  html: string;
  text: string;
} {
  const { recipientName, adminName, setPasswordUrl } = params;

  const html = `
    <h2 style="${styleHeading()}">You're Invited to Archery App</h2>
    <p>Hello ${recipientName},</p>
    <p>
      <strong>${adminName}</strong> has created an account for you on <strong>Archery App</strong>.
      Click the button below to set your password and get started:
    </p>
    <div style="${styleBlockCenter()}">
      <a href="${setPasswordUrl}"
         style="${styleButton()}">
        Set Your Password
      </a>
    </div>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="${styleLinkMuted()}">${setPasswordUrl}</p>
    <div style="${styleNeutralBox()}">
      <p style="margin: 0; color: ${theme.colors.text};">
        This link will expire in <strong>24 hours</strong>.
        If you were not expecting this invitation, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
You're Invited to Archery App

Hello ${recipientName},

${adminName} has created an account for you on Archery App.
Visit the link below to set your password and get started:

${setPasswordUrl}

This link will expire in 24 hours.
If you were not expecting this invitation, you can safely ignore this email.
`.trim();

  return { html, text };
}
