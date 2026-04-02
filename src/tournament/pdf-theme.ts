/**
 * Design tokens for PDFKit-generated documents (patrol lists, score cards).
 * Keep brand colors in sync with:
 *   - frontend: src/theme/colors.ts
 *   - email:    src/email/templates/theme.ts
 */
export const PDF_COLORS = {
  // Brand
  primary: '#000080', // navy — table headers, accents
  primaryText: '#ffffff', // text on primary bg (if used)

  // Text
  textPrimary: '#000000',
  textBody: '#333333',
  textMuted: '#555555',
  textDisabled: '#999999',

  // Surfaces
  headerBg: '#e0e0e0', // table column headers
  rowAltBg: '#f9f9f9', // alternating row stripe
  cellBg: '#e8e8e8', // score card cell / info cell bg

  // Lines
  strokeLight: '#999999',
  strokeMedium: '#333333',
  strokeDark: '#000000',
} as const;
