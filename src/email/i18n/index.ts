import { en } from './en';
import { es } from './es';
import { it } from './it';
import { pt } from './pt';
import { uk } from './uk';
import type { EmailI18n } from './types';

export type { EmailI18n } from './types';

const translations: Record<string, EmailI18n> = { en, es, it, pt, uk };

/**
 * The app stores Ukrainian as 'ua' (app code) but the translations map uses 'uk' (BCP-47).
 * Also normalises any unexpected values so we never silently fall back to English.
 */
const LOCALE_NORMALIZE: Record<string, string> = { ua: 'uk' };

const DEFAULT_LOCALE = 'pt'; // matches the app's own default language

/** Returns translations for the given locale, falling back to the app default (pt). */
export function getEmailI18n(locale?: string | null): EmailI18n {
  const raw = locale ?? DEFAULT_LOCALE;
  const normalised = LOCALE_NORMALIZE[raw] ?? raw;
  return translations[normalised] ?? translations[DEFAULT_LOCALE];
}

/**
 * Replaces {{variable}} placeholders in a string.
 * e.g. interpolate('Hello {{name}}', { name: 'Alice' }) → 'Hello Alice'
 */
export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replaceAll(
    /\{\{(\w+)\}\}/g,
    (_, key: string) => vars[key] ?? `{{${key}}}`,
  );
}
