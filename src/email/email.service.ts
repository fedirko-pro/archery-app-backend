import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

import { getEmailI18n, interpolate } from './i18n';
import {
  wrapEmail,
  getPasswordResetContent,
  getWelcomeContent,
  getApplicationStatusContent,
  getApplicationSubmittedContent,
  getInvitationContent,
  getRoleChangedContent,
} from './templates';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    this.logger.log(
      `Initializing SMTP transporter with host: ${host}, port: ${port}, user: ${user}`,
    );

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000, // 10 s — fail fast instead of waiting 75 s
      socketTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(
          `SMTP connection failed (${host}:${port}):`,
          error.message,
        );
      } else {
        this.logger.log(`SMTP server ready (${host}:${port}, user: ${user})`);
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<SentMessageInfo> {
    try {
      this.logger.log(`Attempting to send email to: ${options.to}`);

      const mailOptions = {
        from: `"${this.configService.get<string>('SMTP_FROM_NAME')}" <${this.configService.get<string>('SMTP_FROM_EMAIL')}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      this.logger.log(`Mail options prepared:`, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      this.logger.error(`Error details:`, {
        message: error.message,
        code: error.code,
        command: error.command,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendInvitationEmail(
    email: string,
    recipientName: string,
    adminName: string,
    setPasswordUrl: string,
    locale?: string,
  ): Promise<void> {
    const t = getEmailI18n(locale);
    const content = getInvitationContent(
      { recipientName, adminName, setPasswordUrl },
      t,
    );
    const { html, text } = wrapEmail(content.html, content.text, t.footer);
    await this.sendEmail({
      to: email,
      subject: t.invitation.subject,
      html,
      text,
    });
  }

  async sendRoleChangedEmail(
    email: string,
    recipientName: string,
    adminName: string,
    oldRole: string,
    newRole: string,
    locale?: string,
  ): Promise<void> {
    const t = getEmailI18n(locale);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const content = getRoleChangedContent(
      {
        recipientName,
        adminName,
        oldRole,
        newRole,
        profileUrl: `${frontendUrl}/profile`,
      },
      t,
    );
    const { html, text } = wrapEmail(content.html, content.text, t.footer);
    await this.sendEmail({
      to: email,
      subject: t.roleChanged.subject,
      html,
      text,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    _resetToken: string,
    resetUrl: string,
    locale?: string,
  ): Promise<void> {
    const t = getEmailI18n(locale);
    const content = getPasswordResetContent({ resetUrl }, t);
    const { html, text } = wrapEmail(content.html, content.text, t.footer);
    await this.sendEmail({
      to: email,
      subject: t.passwordReset.subject,
      html,
      text,
    });
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    locale?: string,
  ): Promise<void> {
    const t = getEmailI18n(locale);
    const content = getWelcomeContent({ firstName }, t);
    const { html, text } = wrapEmail(content.html, content.text, t.footer);
    await this.sendEmail({ to: email, subject: t.welcome.subject, html, text });
  }

  async sendApplicationSubmittedEmail(
    email: string,
    applicantName: string,
    tournamentTitle: string,
    startDate: Date,
    endDate?: Date,
    location?: string,
    locale?: string,
  ): Promise<void> {
    const t = getEmailI18n(locale);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const content = getApplicationSubmittedContent(
      {
        applicantName,
        tournamentTitle,
        startDate,
        endDate,
        location,
        myApplicationsUrl: `${frontendUrl}/my-applications`,
      },
      t,
    );
    const { html, text } = wrapEmail(content.html, content.text, t.footer);
    const subject = interpolate(t.applicationSubmitted.subject, {
      tournamentTitle,
    });
    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendApplicationStatusEmail(
    email: string,
    applicantName: string,
    tournamentTitle: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    locale?: string,
  ): Promise<void> {
    const t = getEmailI18n(locale);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const content = getApplicationStatusContent(
      {
        applicantName,
        tournamentTitle,
        status,
        rejectionReason,
        myApplicationsUrl: `${frontendUrl}/my-applications`,
      },
      t,
    );
    const { html, text } = wrapEmail(content.html, content.text, t.footer);
    const subject = interpolate(
      status === 'approved'
        ? t.applicationStatus.subjectApproved
        : t.applicationStatus.subjectRejected,
      { tournamentTitle },
    );
    await this.sendEmail({ to: email, subject, html, text });
  }
}
