import { styleHeading } from './theme';

export interface WelcomeContentParams {
  firstName: string;
}

export function getWelcomeContent(params: WelcomeContentParams): {
  html: string;
  text: string;
} {
  const { firstName } = params;
  const html = `
    <h2 style="${styleHeading()}">Welcome to Archery App!</h2>
    <p>Hello ${firstName},</p>
    <p>Thank you for joining our archery community! We're excited to have you on board.</p>
    <p>You can now:</p>
    <ul>
      <li>Complete your profile</li>
      <li>Join competitions</li>
      <li>Track your progress</li>
      <li>Connect with other archers</li>
    </ul>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;
  const text = `
Welcome to Archery App!

Hello ${firstName},

Thank you for joining our archery community! We're excited to have you on board.

You can now:
- Complete your profile
- Join competitions
- Track your progress
- Connect with other archers

If you have any questions, feel free to reach out to our support team.
`.trim();
  return { html, text };
}
