/**
 * Email design tokens. All values are used to build inline styles at composition time,
 * so the final HTML still has inline styles for maximum email-client compatibility.
 */
export const theme = {
  colors: {
    primary: '#007bff',
    text: '#333',
    textMuted: '#666',
    border: '#eee',
    // Success (e.g. approved state)
    successBg: '#d4edda',
    successBorder: '#c3e6cb',
    successText: '#155724',
    successHeading: '#28a745',
    // Danger (e.g. rejected state)
    dangerBg: '#f8d7da',
    dangerBorder: '#f5c6cb',
    dangerText: '#721c24',
    dangerHeading: '#dc3545',
    // Neutral (e.g. feedback block)
    neutralBg: '#f8f9fa',
    neutralBorder: '#6c757d',
    white: '#fff',
  },
  sizes: {
    fontFamily: 'Arial, sans-serif',
    fontSmall: '12px',
    fontHeading: '20px',
    maxWidth: '600px',
    spacingXs: '12px',
    spacingSm: '15px',
    spacingMd: '20px',
    spacingLg: '24px',
    spacingXl: '30px',
    radius: '5px',
  },
} as const;

/** Inline style string for the outer email container */
export function styleContainer(): string {
  const { fontFamily, maxWidth } = theme.sizes;
  return `font-family: ${fontFamily}; max-width: ${maxWidth}; margin: 0 auto;`;
}

/** Inline style for main headings (e.g. h2) */
export function styleHeading(color?: string): string {
  const c = color ?? theme.colors.text;
  return `color: ${c};`;
}

/** Inline style for body/paragraph text */
export function styleBody(): string {
  return `color: ${theme.colors.text};`;
}

/** Inline style for muted/secondary text */
export function styleMuted(): string {
  const { textMuted } = theme.colors;
  const { fontSmall } = theme.sizes;
  return `color: ${textMuted}; font-size: ${fontSmall};`;
}

/** Inline style for primary CTA button */
export function styleButton(): string {
  const { primary, white } = theme.colors;
  const { spacingXs, spacingLg, radius } = theme.sizes;
  return `background-color: ${primary}; color: ${white}; padding: ${spacingXs} ${spacingLg}; text-decoration: none; border-radius: ${radius}; display: inline-block;`;
}

/** Inline style for centered block (e.g. button wrapper) */
export function styleBlockCenter(): string {
  const { spacingXl } = theme.sizes;
  return `text-align: center; margin: ${spacingXl} 0;`;
}

/** Inline style for link that may break (e.g. reset URL) */
export function styleLinkMuted(): string {
  return `word-break: break-all; color: ${theme.colors.textMuted};`;
}

/** Inline style for footer text */
export function styleFooter(): string {
  return `color: ${theme.colors.textMuted}; font-size: ${theme.sizes.fontSmall};`;
}

/** Inline style for horizontal rule above footer */
export function styleHr(): string {
  const { spacingXl } = theme.sizes;
  const { border } = theme.colors;
  return `margin: ${spacingXl} 0; border: none; border-top: 1px solid ${border};`;
}

/** Inline style for header brand line */
export function styleHeaderBrand(): string {
  const { primary } = theme.colors;
  const { spacingXs, spacingLg } = theme.sizes;
  return `border-bottom: 2px solid ${primary}; padding-bottom: ${spacingXs}; margin-bottom: ${spacingLg};`;
}

/** Inline style for header title text */
export function styleHeaderTitle(): string {
  const { fontHeading } = theme.sizes;
  const { text } = theme.colors;
  return `font-size: ${fontHeading}; font-weight: bold; color: ${text};`;
}

/** Inline style for success alert box */
export function styleSuccessBox(): string {
  const { successBg, successBorder } = theme.colors;
  const { radius, spacingSm, spacingMd } = theme.sizes;
  return `background-color: ${successBg}; border: 1px solid ${successBorder}; border-radius: ${radius}; padding: ${spacingSm}; margin: ${spacingMd} 0;`;
}

/** Inline style for text inside success box */
export function styleSuccessBoxText(): string {
  return `margin: 0; color: ${theme.colors.successText};`;
}

/** Inline style for danger alert box */
export function styleDangerBox(): string {
  const { dangerBg, dangerBorder } = theme.colors;
  const { radius, spacingSm, spacingMd } = theme.sizes;
  return `background-color: ${dangerBg}; border: 1px solid ${dangerBorder}; border-radius: ${radius}; padding: ${spacingSm}; margin: ${spacingMd} 0;`;
}

/** Inline style for text inside danger box */
export function styleDangerBoxText(): string {
  return `margin: 0; color: ${theme.colors.dangerText};`;
}

/** Inline style for neutral/feedback box */
export function styleNeutralBox(): string {
  const { neutralBg, neutralBorder } = theme.colors;
  const { spacingXs, spacingSm } = theme.sizes;
  return `background-color: ${neutralBg}; border-left: 4px solid ${neutralBorder}; padding: ${spacingXs}; margin: ${spacingSm} 0;`;
}
