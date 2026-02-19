# Email Service Setup

## Overview
The email service is implemented using Nodemailer and supports SMTP for sending emails. It's configured to work with various email providers.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Archery App
```

**Required:** `FRONTEND_URL` must be set for password reset and invitation links, and for "View My Applications" links in tournament emails.

## Email Structure (What We Send)

| Email type | When sent | Method | Used by |
|------------|-----------|--------|---------|
| **Password reset** | User or admin requests reset | `sendPasswordResetEmail` | Auth (forgot-password, admin reset) |
| **Tournament application status** | Application approved or rejected | `sendApplicationStatusEmail` | Tournament application service |
| **Welcome** | After sign-up (optional) | `sendWelcomeEmail` | Not wired yet |
| **Invitation** | Admin creates user (set password link) | _To implement_ | User service (invite flow) |

All emails use:
- **HTML + plain text** (fallback for clients that don’t support HTML)
- **Consistent layout:** header, body, primary CTA (if any), footer with “automated / do not reply”
- **From:** `SMTP_FROM_NAME` and `SMTP_FROM_EMAIL` (set in env)

### Template folder structure

Templates live under `src/email/templates/`:

```
src/email/templates/
├── index.ts                    # Re-exports theme, layout + all content templates
├── theme.ts                    # Design tokens (colors, sizes) + style helpers → inline strings
├── layout.ts                   # wrapEmail(contentHtml, contentText) → full email
├── partials/
│   ├── header.ts               # Shared header (HTML + text)
│   └── footer.ts               # Shared footer (HTML + text)
├── password-reset.template.ts  # Content only: getPasswordResetContent({ resetUrl })
├── welcome.template.ts         # Content only: getWelcomeContent({ firstName })
├── application-status.template.ts  # Content: getApplicationStatusContent({ ... })
└── invitation.template.ts      # Content only: getInvitationContent({ setPasswordUrl, recipientName? })
```

- **Theme:** `theme.ts` holds design tokens (`theme.colors`, `theme.sizes`) and helpers (`styleHeading()`, `styleButton()`, etc.) that return inline style strings. Templates use these so all emails share one place for colors, spacing, and typography; the composed HTML still has inline styles for email-client compatibility.
- **Common parts:** `partials/header.ts` and `partials/footer.ts` define the shared top and bottom. `layout.ts` exports `wrapEmail(contentHtml, contentText)`, which wraps any content with header + footer.
- **Content templates:** Each email type has its own file that exports a `get*Content(params)` function returning `{ html, text }` for the middle part only. The service calls `wrapEmail(content.html, content.text)` to build the full email.
- To add a new email type: add a new `*.template.ts` with a `get*Content()` and wire it in `EmailService` (and optionally in `templates/index.ts`).

## Email Provider Setup

### Zoho Mail (recommended for production / demo)
Use your Zoho Mail address and password (or an [application-specific password](https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html) if 2FA is on).

- **Personal / free org:** `smtp.zoho.com`
- **Paid org (custom domain):** `smtppro.zoho.com`

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=your-email@zoho.com
SMTP_PASSWORD=your-zoho-password-or-app-password
SMTP_FROM_EMAIL=your-email@zoho.com
SMTP_FROM_NAME=Archery App
```

- Port **465** = SSL (recommended). Port **587** = STARTTLS; both work with the current code.

### Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password as `SMTP_PASSWORD`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Archery App
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@outlook.com
SMTP_FROM_NAME=Archery App
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@your-domain.com
SMTP_FROM_NAME=Archery App
```

## Testing the Email Service

### Test Endpoint
Send a POST request to `/email/test`:

```bash
curl -X POST http://localhost:3000/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'
```

### Available Email Methods

1. **sendEmail(options)** – Send a custom email (`to`, `subject`, `html`, optional `text`)
2. **sendPasswordResetEmail(email, resetToken, resetUrl)** – Password reset with link (1h expiry)
3. **sendWelcomeEmail(email, firstName)** – Welcome after sign-up (not called yet; wire in registration if desired)
4. **sendApplicationStatusEmail(email, applicantName, tournamentTitle, status, rejectionReason?)** – Tournament application approved/rejected  
5. **Invitation** – Template exists (`invitation.template.ts`); add `sendInvitationEmail` and wire in user invite flow when ready

## Usage in Other Services

Import and inject the EmailService in your modules:

```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async someMethod() {
    await this.emailService.sendWelcomeEmail('user@example.com', 'John');
  }
}
```