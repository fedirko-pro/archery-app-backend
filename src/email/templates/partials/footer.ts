import { styleHr, styleFooter } from '../theme';

/**
 * Shared email footer (HTML and plain text). Used inside layout wrapper.
 */
export const EMAIL_FOOTER_HTML = `
    <hr style="${styleHr()}">
    <p style="${styleFooter()}">
      This is an automated email. Please do not reply to this message.
    </p>
  </div>
`;

export const EMAIL_FOOTER_TEXT = `

────────────────────────────────────
This is an automated email. Please do not reply to this message.`;
