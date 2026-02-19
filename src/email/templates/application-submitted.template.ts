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

function formatDate(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function buildDateRange(startDate: Date, endDate?: Date): string {
  const start = formatDate(startDate);
  if (!endDate) return start;
  const end = formatDate(endDate);
  return start === end ? start : `${start} – ${end}`;
}

export function getApplicationSubmittedContent(
  params: ApplicationSubmittedContentParams,
): { html: string; text: string } {
  const {
    applicantName,
    tournamentTitle,
    startDate,
    endDate,
    location,
    myApplicationsUrl,
  } = params;

  const dateRange = buildDateRange(startDate, endDate);

  const detailsHtml = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 100px;">Tournament</td>
        <td style="padding: 8px 0; font-weight: bold;">${tournamentTitle}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Date</td>
        <td style="padding: 8px 0;">${dateRange}</td>
      </tr>
      ${
        location
          ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">Location</td>
        <td style="padding: 8px 0;">${location}</td>
      </tr>`
          : ''
      }
    </table>
  `;

  const detailsText = [
    `  Tournament : ${tournamentTitle}`,
    `  Date       : ${dateRange}`,
    location ? `  Location   : ${location}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <h2 style="${styleHeading()}">Application Submitted</h2>
    <p>Hello ${applicantName},</p>
    <div style="${styleSuccessBox()}">
      <p style="${styleSuccessBoxText()}">
        Your application for <strong>${tournamentTitle}</strong> has been successfully submitted.
      </p>
    </div>
    ${detailsHtml}
    <p>Please wait while the administrator reviews your application. You will receive another email once a decision has been made.</p>
    <div style="${styleBlockCenter()}">
      <a href="${myApplicationsUrl}"
         style="${styleButton()}">
        View My Applications
      </a>
    </div>
  `;

  const text = `
Application Submitted

Hello ${applicantName},

Your application for "${tournamentTitle}" has been successfully submitted.

${detailsText}

Please wait while the administrator reviews your application.
You will receive another email once a decision has been made.

View your applications: ${myApplicationsUrl}
`.trim();

  return { html, text };
}
