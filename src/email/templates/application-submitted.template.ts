import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import {
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleSuccessBox,
  styleSuccessBoxText,
} from './theme';

export interface ApplicationSubmittedContentParams {
  applicantName: string;
  tournamentTitle: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  myApplicationsUrl: string;
}

function formatDate(date: Date, months: string[]): string {
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function buildDateRange(
  startDate: Date,
  endDate: Date | undefined,
  months: string[],
): string {
  const start = formatDate(startDate, months);
  if (!endDate) return start;
  const end = formatDate(endDate, months);
  return start === end ? start : `${start} – ${end}`;
}

export function getApplicationSubmittedContent(
  params: ApplicationSubmittedContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const {
    applicantName,
    tournamentTitle,
    startDate,
    endDate,
    location,
    myApplicationsUrl,
  } = params;
  const s = t.applicationSubmitted;

  const dateRange = buildDateRange(startDate, endDate, s.months);
  const greeting = interpolate(s.greeting, { name: applicantName });
  const successMessage = interpolate(s.successMessage, { tournamentTitle });

  const detailsHtml = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 100px;">${s.labelTournament}</td>
        <td style="padding: 8px 0; font-weight: bold;">${tournamentTitle}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">${s.labelDate}</td>
        <td style="padding: 8px 0;">${dateRange}</td>
      </tr>
      ${
        location
          ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">${s.labelLocation}</td>
        <td style="padding: 8px 0;">${location}</td>
      </tr>`
          : ''
      }
    </table>
  `;

  const detailsText = [
    `  ${s.labelTournament} : ${tournamentTitle}`,
    `  ${s.labelDate}       : ${dateRange}`,
    location ? `  ${s.labelLocation}   : ${location}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <h2 style="${styleHeading()}">${s.heading}</h2>
    <p>${greeting}</p>
    <div style="${styleSuccessBox()}">
      <p style="${styleSuccessBoxText()}">${successMessage}</p>
    </div>
    ${detailsHtml}
    <p>${s.waitMessage}</p>
    <div style="${styleBlockCenter()}">
      <a href="${myApplicationsUrl}"
         style="${styleButton()}">
        ${s.ctaLabel}
      </a>
    </div>
  `;

  const text = `
${s.heading}

${greeting}

${successMessage}

${detailsText}

${s.waitMessage}

${s.ctaLabel}: ${myApplicationsUrl}
`.trim();

  return { html, text };
}
