import { EMAIL_HEADER_HTML, EMAIL_HEADER_TEXT } from './partials/header';
import { EMAIL_FOOTER_HTML, EMAIL_FOOTER_TEXT } from './partials/footer';

export interface WrappedEmail {
  html: string;
  text: string;
}

/**
 * Wraps email content with shared header and footer.
 */
export function wrapEmail(
  contentHtml: string,
  contentText: string,
): WrappedEmail {
  return {
    html: EMAIL_HEADER_HTML + contentHtml + EMAIL_FOOTER_HTML,
    text: EMAIL_HEADER_TEXT + contentText + EMAIL_FOOTER_TEXT,
  };
}
