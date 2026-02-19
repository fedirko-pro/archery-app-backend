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
): { html: string; text: string } {
  const {
    applicantName,
    tournamentTitle,
    status,
    rejectionReason,
    myApplicationsUrl,
  } = params;

  const headingColor =
    status === 'approved'
      ? theme.colors.successHeading
      : theme.colors.dangerHeading;

  const approvedBlockHtml = `
    <div style="${styleSuccessBox()}">
      <p style="${styleSuccessBoxText()}">
        <strong>Great news!</strong> Your application for <strong>${tournamentTitle}</strong> has been approved.
      </p>
    </div>
    <p>You are now registered for this tournament. Please check your application details and prepare for the competition.</p>
    <p>We look forward to seeing you there!</p>
  `;

  const rejectedBlockHtml = `
    <div style="${styleDangerBox()}">
      <p style="${styleDangerBoxText()}">
        Your application for <strong>${tournamentTitle}</strong> has been reviewed.
      </p>
    </div>
    ${
      rejectionReason
        ? `
    <p><strong>Feedback:</strong></p>
    <div style="${styleNeutralBox()}">
      ${rejectionReason}
    </div>
    `
        : ''
    }
    <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
  `;

  const html = `
    <h2 style="${styleHeading(headingColor)}">
      Tournament Application ${status === 'approved' ? 'Approved ✓' : 'Update'}
    </h2>
    <p>Hello ${applicantName},</p>
    ${status === 'approved' ? approvedBlockHtml : rejectedBlockHtml}
    <div style="${styleBlockCenter()}">
      <a href="${myApplicationsUrl}"
         style="${styleButton()}">
        View My Applications
      </a>
    </div>
  `;

  const approvedBlockText = `Great news! Your application for ${tournamentTitle} has been approved.

You are now registered for this tournament. Please check your application details and prepare for the competition.

We look forward to seeing you there!`;

  const rejectedBlockText = `Your application for ${tournamentTitle} has been reviewed.
${rejectionReason ? `Feedback: ${rejectionReason}\n` : ''}
If you have any questions or concerns, please don't hesitate to contact us.`;

  const text = `
Tournament Application ${status === 'approved' ? 'Approved' : 'Update'}

Hello ${applicantName},

${status === 'approved' ? approvedBlockText : rejectedBlockText}

View your applications: ${myApplicationsUrl}
`.trim();

  return { html, text };
}
