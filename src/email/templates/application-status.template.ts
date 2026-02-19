import type { EmailI18n } from '../i18n';
import { interpolate } from '../i18n';
import {
  theme,
  styleHeading,
  styleButton,
  styleBlockCenter,
  styleSuccessBox,
  styleSuccessBoxText,
  styleDangerBox,
  styleDangerBoxText,
  styleNeutralBox,
} from './theme';

export interface ApplicationStatusContentParams {
  applicantName: string;
  tournamentTitle: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  myApplicationsUrl: string;
}

export function getApplicationStatusContent(
  params: ApplicationStatusContentParams,
  t: EmailI18n,
): { html: string; text: string } {
  const {
    applicantName,
    tournamentTitle,
    status,
    rejectionReason,
    myApplicationsUrl,
  } = params;
  const s = t.applicationStatus;

  const headingColor =
    status === 'approved'
      ? theme.colors.successHeading
      : theme.colors.dangerHeading;

  const greeting = interpolate(s.greeting, { name: applicantName });
  const approvedMessage = interpolate(s.approvedMessage, { tournamentTitle });
  const rejectedMessage = interpolate(s.rejectedMessage, { tournamentTitle });

  const approvedBlockHtml = `
    <div style="${styleSuccessBox()}">
      <p style="${styleSuccessBoxText()}">
        <strong>${approvedMessage}</strong>
      </p>
    </div>
    <p>${s.approvedDetail}</p>
    <p>${s.approvedLookForward}</p>
  `;

  const rejectedBlockHtml = `
    <div style="${styleDangerBox()}">
      <p style="${styleDangerBoxText()}">${rejectedMessage}</p>
    </div>
    ${
      rejectionReason
        ? `
    <p><strong>${s.feedbackLabel}</strong></p>
    <div style="${styleNeutralBox()}">
      ${rejectionReason}
    </div>
    `
        : ''
    }
    <p>${s.questionsNote}</p>
  `;

  const html = `
    <h2 style="${styleHeading(headingColor)}">
      ${status === 'approved' ? s.headingApproved : s.headingUpdate}
    </h2>
    <p>${greeting}</p>
    ${status === 'approved' ? approvedBlockHtml : rejectedBlockHtml}
    <div style="${styleBlockCenter()}">
      <a href="${myApplicationsUrl}"
         style="${styleButton()}">
        ${s.ctaLabel}
      </a>
    </div>
  `;

  const approvedBlockText = `${approvedMessage}

${s.approvedDetail}

${s.approvedLookForward}`;

  const rejectedBlockText = `${rejectedMessage}
${rejectionReason ? `${s.feedbackLabel} ${rejectionReason}\n` : ''}
${s.questionsNote}`;

  const text = `
${status === 'approved' ? s.headingApproved : s.headingUpdate}

${greeting}

${status === 'approved' ? approvedBlockText : rejectedBlockText}

${s.ctaLabel}: ${myApplicationsUrl}
`.trim();

  return { html, text };
}
