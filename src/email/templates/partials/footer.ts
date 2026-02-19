import { styleHr, styleFooter } from '../theme';

const DEFAULT_FOOTER_TEXT =
  'This is an automated email. Please do not reply to this message.';

export function buildFooterHtml(text: string = DEFAULT_FOOTER_TEXT): string {
  return `
    <hr style="${styleHr()}">
    <p style="${styleFooter()}">${text}</p>
  </div>
`;
}

export function buildFooterText(text: string = DEFAULT_FOOTER_TEXT): string {
  return `\n\n────────────────────────────────────\n${text}`;
}
