export interface EmailI18n {
  footer: string;

  passwordReset: {
    subject: string;
    heading: string;
    hello: string;
    body: string;
    ctaLabel: string;
    linkFallback: string;
    expiry: string;
    ignoreNote: string;
  };

  welcome: {
    subject: string;
    heading: string;
    greeting: string; // supports {{name}}
    intro: string;
    features: [string, string, string, string];
    helpNote: string;
  };

  invitation: {
    subject: string;
    heading: string;
    body: string; // supports {{adminName}}
    ctaLabel: string;
    linkFallback: string;
    expiry: string;
    ignoreNote: string;
  };

  applicationSubmitted: {
    subject: string; // supports {{tournamentTitle}}
    heading: string;
    greeting: string; // supports {{name}}
    successMessage: string; // supports {{tournamentTitle}}
    labelTournament: string;
    labelDate: string;
    labelLocation: string;
    waitMessage: string;
    ctaLabel: string;
    months: [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];
  };

  applicationStatus: {
    subjectApproved: string; // supports {{tournamentTitle}}
    subjectRejected: string; // supports {{tournamentTitle}}
    headingApproved: string;
    headingUpdate: string;
    greeting: string; // supports {{name}}
    approvedMessage: string; // supports {{tournamentTitle}}
    approvedDetail: string;
    approvedLookForward: string;
    rejectedMessage: string; // supports {{tournamentTitle}}
    feedbackLabel: string;
    questionsNote: string;
    ctaLabel: string;
  };

  roleChanged: {
    subject: string;
    heading: string;
    greeting: string; // supports {{name}}
    body: string; // supports {{adminName}}
    permissionsHeading: string; // supports {{role}}
    questionsNote: string;
    ctaLabel: string;
    roleLabels: Record<string, string>;
    rolePermissions: Record<string, string[]>;
  };
}
