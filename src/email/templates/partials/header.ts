import { styleContainer, styleHeaderBrand, styleHeaderTitle } from '../theme';

/**
 * Shared email header (HTML). Used inside layout wrapper.
 */
export const EMAIL_HEADER_HTML = `
  <div style="${styleContainer()}">
    <div style="${styleHeaderBrand()}">
      <span style="${styleHeaderTitle()}">Archery App</span>
    </div>
`;

export const EMAIL_HEADER_TEXT = `Archery App\n${'─'.repeat(40)}\n\n`;
