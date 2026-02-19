import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import { styleHeading } from './theme';

export interface WelcomeContentParams {
  firstName: string;
}

export function getWelcomeContent(
  params: WelcomeContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const { firstName } = params;
  const s = t.welcome;

  const greeting = interpolate(s.greeting, { name: firstName });
  const [f1, f2, f3, f4] = s.features;

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <p>${s.intro}</p>
    <ul>
      <li>${f1}</li>
      <li>${f2}</li>
      <li>${f3}</li>
      <li>${f4}</li>
    </ul>
    <p>${s.helpNote}</p>
  `;

  const text = `
${s.heading}

${greeting}

${s.intro}

- ${f1}
- ${f2}
- ${f3}
- ${f4}

${s.helpNote}
`.trim();

  return { html, text };
}
