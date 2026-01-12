import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

interface TestEmailDto {
  to: string;
  subject?: string;
  message?: string;
}

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Get('config')
  @HttpCode(HttpStatus.OK)
  getEmailConfig() {
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      user: this.configService.get<string>('SMTP_USER'),
      from: `"${this.configService.get<string>('SMTP_FROM_NAME')}" <${this.configService.get<string>('SMTP_FROM_EMAIL')}>`,
      // Don't expose password for security
      passwordConfigured: !!this.configService.get<string>('SMTP_PASSWORD'),
    };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestEmail(@Body() testEmailDto: TestEmailDto) {
    const {
      to,
      subject = 'Test Email',
      message = 'This is a test email from Archery App',
    } = testEmailDto;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>${message}</p>
        <p>This is a test email sent from the Archery App email service.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Test email - Archery App
        </p>
      </div>
    `;

    const text = `
      ${subject}

      ${message}

      This is a test email sent from the Archery App email service.

      Test email - Archery App
    `;

    await this.emailService.sendEmail({
      to,
      subject,
      html,
      text,
    });

    return {
      success: true,
      message: `Test email sent successfully to ${to}`,
    };
  }
}
