# Email Service Setup

## Overview
The email service is implemented using Nodemailer and supports SMTP for sending emails. All emails are sent in the **recipient's preferred language** (`appLanguage` field on the `User` entity). If no language is set the app default (`pt`) is used.

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
- **Password reset body** is intentionally passive ("We received a request…") so it reads correctly whether the user or an admin triggered it.
- All non-critical emails are **fire-and-forget** — a failed send never blocks or fails the triggering operation.

All emails use:
- **HTML + plain text** (fallback for clients that don't render HTML)
- **Consistent layout:** header → content → footer ("automated / do not reply")
- **Localised content:** subject, body, button labels, month names and role descriptions all come from the i18n translation files
- **From:** `SMTP_FROM_NAME` and `SMTP_FROM_EMAIL` (set in env)

---

## Internationalisation (i18n)

Emails are sent in the language stored in the recipient's `appLanguage` field. If that field is `null` or unrecognised, the app default (`pt`) is used.

### Supported languages

| Code (DB) | Language   |
|-----------|-----------|
| `pt`      | Portuguese |
| `en`      | English    |
| `es`      | Spanish    |
| `it`      | Italian    |
| `uk` / `ua` | Ukrainian (the app stores `ua`, both resolve correctly) |

### Translation files

```
src/email/i18n/
├── types.ts      # EmailI18n interface — all translatable strings typed
├── en.ts         # English
├── pt.ts         # Portuguese
├── es.ts         # Spanish
├── it.ts         # Italian
├── uk.ts         # Ukrainian
└── index.ts      # getEmailI18n(locale?) + interpolate() helper
```

**`getEmailI18n(locale?)`** — returns the `EmailI18n` object for the given locale, normalising `'ua' → 'uk'` and falling back to `'pt'` when the locale is unknown or null.

**`interpolate(template, vars)`** — replaces `{{variable}}` placeholders in a string.

### `EmailI18n` interface sections

| Section | Content |
|---------|---------|
| `footer` | "This is an automated email…" note |
| `passwordReset` | Subject, heading, body, button, expiry, ignore note |
| `welcome` | Subject, heading, greeting, intro, 4 feature bullets, help note |
| `invitation` | Subject, heading, body, button, expiry, ignore note |
| `applicationSubmitted` | Subject, heading, labels, wait message, 12 month names |
| `applicationStatus` | Subject×2, heading×2, approved/rejected blocks, feedback label |
| `roleChanged` | Subject, heading, body, permissions heading, role labels, role permissions |

### Adding a new language
1. Create `src/email/i18n/xx.ts` implementing the full `EmailI18n` interface
2. Add it to the map in `src/email/i18n/index.ts`:
   ```ts
   import { xx } from './xx';
   const translations = { en, es, it, pt, uk, xx };
   ```
3. Add the locale to the frontend's `SUPPORTED_APP_LANGS` in `src/utils/i18n-lang.ts`

---

## Template folder structure

Templates live under `src/email/templates/`:

```
src/email/templates/
├── index.ts                        # Re-exports theme, layout + all content templates
├── theme.ts                        # Design tokens (colors, sizes) + style helpers → inline strings
├── layout.ts                       # wrapEmail(contentHtml, contentText, footerText?) → full email
├── partials/
│   ├── header.ts                   # Shared header (HTML + text)
│   └── footer.ts                   # buildFooterHtml(text) / buildFooterText(text)
├── password-reset.template.ts          # getPasswordResetContent(params, t)
├── welcome.template.ts                 # getWelcomeContent(params, t)
├── application-submitted.template.ts   # getApplicationSubmittedContent(params, t)
├── application-status.template.ts      # getApplicationStatusContent(params, t)
├── role-changed.template.ts            # getRoleChangedContent(params, t)
└── invitation.template.ts              # getInvitationContent(params, t)
```

- **Theme:** `theme.ts` holds design tokens (`theme.colors`, `theme.sizes`) and helpers (`styleHeading()`, `styleButton()`, etc.) that return inline style strings.
- **Footer:** now a function `buildFooterHtml(text)` — `wrapEmail` accepts an optional `footerText` so the "do not reply" note is also translated.
- **Content templates:** each function accepts `(params, t: EmailI18n)` and returns `{ html, text }`.

**Adding a new email type:**
1. Create `src/email/templates/your-type.template.ts`:
   ```ts
   import type { EmailI18n } from '../i18n';
   export function getYourTypeContent(params, t: EmailI18n): { html, text } { … }
   ```
2. Add translatable strings to `EmailI18n` in `src/email/i18n/types.ts` and all 5 locale files
3. Export it from `templates/index.ts`
4. Add `sendYourTypeEmail(…, locale?: string)` to `EmailService`:
   ```ts
   const t = getEmailI18n(locale);
   const content = getYourTypeContent(params, t);
   const { html, text } = wrapEmail(content.html, content.text, t.footer);
   await this.sendEmail({ to, subject: t.yourType.subject, html, text });
   ```

---

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

All methods accept an optional trailing `locale?: string` parameter that controls email language.

| Method | Params | Notes |
|--------|--------|-------|
| `sendEmail(options)` | `{ to, subject, html, text? }` | Generic low-level send |
| `sendPasswordResetEmail(email, _token, resetUrl, locale?)` | — | Token stored in DB; link expires in 1h; body is passive ("We received a request…") |
| `sendWelcomeEmail(email, firstName, locale?)` | — | Sent on every new registration |
| `sendApplicationSubmittedEmail(email, applicantName, tournamentTitle, startDate, endDate?, location?, locale?)` | — | Sent when user submits a tournament application |
| `sendApplicationStatusEmail(email, applicantName, tournamentTitle, status, rejectionReason?, locale?)` | `status: 'approved' \| 'rejected'` | Sent when admin updates application status |
| `sendRoleChangedEmail(email, recipientName, adminName, oldRole, newRole, locale?)` | — | Sent when admin changes a user's role; includes permission list |
| `sendInvitationEmail(email, recipientName, adminName, setPasswordUrl, locale?)` | — | Sent when admin creates a user; link valid 24h |

## Usage in Other Services

```typescript
import { EmailService } from '../email/email.service';
import { getEmailI18n, interpolate } from '../email/i18n';
import { wrapEmail, getYourTypeContent } from '../email/templates';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async someMethod(user: User) {
    // Always pass the recipient's locale — never the current admin's locale
    await this.emailService.sendYourTypeEmail(
      user.email,
      /* …params… */
      user.appLanguage,   // ← recipient locale
    );
  }
}
```
