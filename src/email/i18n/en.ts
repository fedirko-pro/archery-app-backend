import type { EmailI18n } from './types';

export const en: EmailI18n = {
  footer: 'This is an automated email. Please do not reply to this message.',

  passwordReset: {
    subject: 'Password Reset Request',
    heading: 'Password Reset Request',
    hello: 'Hello,',
    body: 'We received a request to reset the password for your account. Click the button below to set a new password:',
    ctaLabel: 'Reset Password',
    linkFallback:
      "If the button doesn't work, you can copy and paste this link into your browser:",
    expiry: 'This link will expire in 1 hour for security reasons.',
    ignoreNote:
      "If you didn't request this password reset, please ignore this email.",
  },

  welcome: {
    subject: 'Welcome to Archery App!',
    heading: 'Welcome to Archery App!',
    greeting: 'Hello {{name}},',
    intro:
      "Thank you for joining our archery community! We're excited to have you on board.",
    features: [
      'Complete your profile',
      'Join competitions',
      'Track your progress',
      'Connect with other archers',
    ],
    helpNote:
      'If you have any questions, feel free to reach out to our support team.',
  },

  invitation: {
    subject: "You're Invited to Archery App",
    heading: "You're Invited to Archery App",
    body: '{{adminName}} has created an account for you on Archery App. Click the button below to set your password and get started:',
    ctaLabel: 'Set Your Password',
    linkFallback:
      "If the button doesn't work, copy and paste this link into your browser:",
    expiry: 'This link will expire in 24 hours.',
    ignoreNote:
      'If you were not expecting this invitation, you can safely ignore this email.',
  },

  applicationSubmitted: {
    subject: 'Application Submitted – {{tournamentTitle}}',
    heading: 'Application Submitted',
    greeting: 'Hello {{name}},',
    successMessage:
      'Your application for {{tournamentTitle}} has been successfully submitted.',
    labelTournament: 'Tournament',
    labelDate: 'Date',
    labelLocation: 'Location',
    waitMessage:
      'Please wait while the administrator reviews your application. You will receive another email once a decision has been made.',
    ctaLabel: 'View My Applications',
    months: [
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
    ],
  },

  applicationStatus: {
    subjectApproved: 'Application Approved – {{tournamentTitle}}',
    subjectRejected: 'Application Update – {{tournamentTitle}}',
    headingApproved: 'Tournament Application Approved ✓',
    headingUpdate: 'Tournament Application Update',
    greeting: 'Hello {{name}},',
    approvedMessage:
      'Great news! Your application for {{tournamentTitle}} has been approved.',
    approvedDetail:
      'You are now registered for this tournament. Please check your application details and prepare for the competition.',
    approvedLookForward: 'We look forward to seeing you there!',
    rejectedMessage:
      'Your application for {{tournamentTitle}} has been reviewed.',
    feedbackLabel: 'Feedback:',
    questionsNote:
      "If you have any questions or concerns, please don't hesitate to contact us.",
    ctaLabel: 'View My Applications',
  },

  roleChanged: {
    subject: 'Your Role Has Been Updated – Archery App',
    heading: 'Your Role Has Been Updated',
    greeting: 'Hello {{name}},',
    body: '{{adminName}} has updated your role in Archery App:',
    permissionsHeading: 'With the {{role}} role you can:',
    questionsNote:
      'If you have any questions about your new permissions, please contact your administrator.',
    ctaLabel: 'View My Profile',
    roleLabels: {
      user: 'User',
      club_admin: 'Club Admin',
      federation_admin: 'Federation Admin',
      general_admin: 'General Admin',
    },
    rolePermissions: {
      user: [
        'Browse and view tournaments',
        'Submit applications to tournaments',
        'View and manage your own applications',
        'Edit your profile',
      ],
      club_admin: [
        'Create and edit tournaments',
        'View and manage tournament applications',
        'Apply other users to tournaments',
        'Create and edit users',
      ],
      federation_admin: [
        'Create and edit tournaments',
        'Delete tournaments',
        'View and manage tournament applications',
        'Edit and delete applications, generate PDFs',
        'Apply other users to tournaments',
        'Create, edit and delete users',
      ],
      general_admin: [
        'Full access to all tournaments and applications',
        'Create, edit and delete users',
        'Manage reference data (categories, clubs, divisions, rules)',
        'Manage role permissions (Access Control)',
        'All other admin capabilities',
      ],
    },
  },
};
