# Email Service Setup

## Overview
The email service is implemented using Nodemailer and supports SMTP for sending emails. It's configured to work with various email providers.

## Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=587
SMTP_USER=your-email@zoho.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@zoho.com
SMTP_FROM_NAME=Archery App
```

**Required:** `FRONTEND_URL` must also be set — used for password reset links and "View My Applications" links in tournament emails.

## Email Structure (What We Send)

| # | Email type | Trigger | `EmailService` method | Status |
|---|------------|---------|----------------------|--------|
| 1 | **Password reset** | User clicks "Forgot password" or admin resets a user | `sendPasswordResetEmail` | ✅ Active |
| 2 | **Application submitted** | User submits a tournament application | `sendApplicationSubmittedEmail` | ✅ Active |
| 3 | **Application status** | Application approved or rejected by admin | `sendApplicationStatusEmail` | ✅ Active |
| 4 | **Welcome** | New user registered (email/password or Google OAuth) | `sendWelcomeEmail` | ✅ Active |
| 5 | **Role changed** | Admin changes a user's role | `sendRoleChangedEmail` | ✅ Active |
| 6 | **Invitation** | Admin creates a user via admin panel | `sendInvitationEmail` | ✅ Active |

**Notes:**
- **Welcome email** requires `firstName` — enforced by `CreateUserDto` (`@IsNotEmpty`) for email signup; Google strategy always provides `name.givenName` with a fallback to the email username prefix.
- **Invitation email** includes the inviting admin's name and a set-password link valid for **24 hours** (reuses the `resetPasswordToken` mechanism). The link leads to the existing `/reset-password` page.
- **Welcome email is fire-and-forget** — a failed email send never blocks or fails the signup.

All emails use:
- **HTML + plain text** (fallback for clients that don't render HTML)
- **Consistent layout:** header → content → footer ("automated / do not reply")
- **From:** `SMTP_FROM_NAME` and `SMTP_FROM_EMAIL` (set in env)

### Template folder structure

Templates live under `src/email/templates/`:

```
src/email/templates/
├── index.ts                        # Re-exports theme, layout + all content templates
├── theme.ts                        # Design tokens (colors, sizes) + style helpers → inline strings
├── layout.ts                       # wrapEmail(contentHtml, contentText) → full email
├── partials/
│   ├── header.ts                   # Shared header (HTML + text)
│   └── footer.ts                   # Shared footer (HTML + text)
├── password-reset.template.ts          # getPasswordResetContent({ resetUrl })
├── welcome.template.ts                 # getWelcomeContent({ firstName })
├── application-submitted.template.ts   # getApplicationSubmittedContent({ applicantName, tournamentTitle, startDate, endDate?, location?, myApplicationsUrl })
├── application-status.template.ts      # getApplicationStatusContent({ applicantName, tournamentTitle, status, rejectionReason?, myApplicationsUrl })
├── role-changed.template.ts            # getRoleChangedContent({ recipientName, adminName, oldRole, newRole, profileUrl })
└── invitation.template.ts              # getInvitationContent({ recipientName, adminName, setPasswordUrl })
```

- **Theme:** `theme.ts` holds design tokens (`theme.colors`, `theme.sizes`) and helpers (`styleHeading()`, `styleButton()`, etc.) that return inline style strings. All templates use these — change a token once and every email updates. The final HTML always has styles inline for email-client compatibility.
- **Common parts:** `partials/header.ts` and `partials/footer.ts` are the shared top and bottom. `layout.ts` exports `wrapEmail(contentHtml, contentText)`, which assembles the full email.
- **Content templates:** Each email type has its own file exporting a `get*Content(params)` function that returns `{ html, text }` for the middle section only. `EmailService` calls `wrapEmail(content.html, content.text)` to build the complete email.

**Adding a new email type:**
1. Create `src/email/templates/your-type.template.ts` with `getYourTypeContent(params): { html, text }`
2. Use theme helpers for styling (e.g. `styleButton()`, `styleHeading()`)
3. Export it from `templates/index.ts`
4. Add `sendYourTypeEmail()` to `EmailService` following the same 3-line pattern:
   ```ts
   const content = getYourTypeContent(params);
   const { html, text } = wrapEmail(content.html, content.text);
   await this.sendEmail({ to, subject, html, text });
   ```

## Email Provider Setup

### Zoho Mail (current — recommended for production / demo)

- **Custom domain (paid org):** `smtppro.zoho.com`
- **Personal / free org:** `smtp.zoho.com`
- **EU data centre:** `smtp.zoho.eu`

```env
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_USER=your-email@your-domain.com
SMTP_PASSWORD=your-zoho-password-or-app-password
SMTP_FROM_EMAIL=your-email@your-domain.com
SMTP_FROM_NAME=Archery App
```

- Port **465** = SSL. Port **587** = STARTTLS (recommended if 465 is blocked by your network). Both work with the current code.
- If 2FA is enabled on the account, use a [Zoho application-specific password](https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html).

### Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: Google Account → Security → 2-Step Verification → App passwords
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

### Check loaded SMTP config
```bash
curl http://localhost:3000/email/config
```

### Send a test email
```bash
curl -X POST http://localhost:3000/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "you@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'
```

## Available `EmailService` Methods

| Method | Params | Notes |
|--------|--------|-------|
| `sendEmail(options)` | `{ to, subject, html, text? }` | Generic low-level send |
| `sendPasswordResetEmail(email, _token, resetUrl)` | — | Token stored in DB; link expires in 1h |
| `sendWelcomeEmail(email, firstName)` | — | Sent on every new registration |
| `sendApplicationSubmittedEmail(email, applicantName, tournamentTitle, startDate, endDate?, location?)` | — | Sent when user submits a tournament application |
| `sendApplicationStatusEmail(email, applicantName, tournamentTitle, status, rejectionReason?)` | `status: 'approved' \| 'rejected'` | Sent when admin updates application status |
| `sendRoleChangedEmail(email, recipientName, adminName, oldRole, newRole)` | — | Sent when admin changes a user's role; includes permission list |
| `sendInvitationEmail(email, recipientName, adminName, setPasswordUrl)` | — | Sent when admin creates a user; link valid 24h |

## Usage in Other Services

```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async someMethod() {
    const content = getYourTypeContent(params);
    const { html, text } = wrapEmail(content.html, content.text);
    await this.emailService.sendEmail({ to, subject, html, text });
  }
}
```
