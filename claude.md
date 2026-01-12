# Archery App Backend - Detailed Documentation for Claude

## Project Overview

**Archery App Backend** - a backend application for managing archery tournaments, built with NestJS using TypeScript, PostgreSQL, and MikroORM.

### Main Purpose
- User management (registration, authentication, profiles)
- Archery tournament management
- Tournament application system
- Patrol management (participant groups)
- Image and file upload and processing
- Email notifications (password reset, notifications)

### Version
- **Project Version**: 0.0.1
- **Node.js**: >=22.12.0
- **pnpm**: >=9.0.0
- **Package Manager**: pnpm@10.20.0

---

## Technology Stack

### Backend Framework
- **NestJS** 10.x - progressive Node.js framework
- **TypeScript** 5.1.3 - typed JavaScript
- **Express** - base HTTP server

### Database
- **PostgreSQL** - relational database
- **MikroORM** 6.4.0 - TypeScript ORM
  - PostgreSQL driver
  - Migrations
  - Seeder for test data

### Authentication
- **Passport** - authentication middleware
  - **passport-jwt** - JWT strategy
  - **passport-google-oauth20** - Google OAuth
- **@nestjs/jwt** - JWT tokens
- **bcryptjs** - password hashing

### Validation and Transformation
- **class-validator** - DTO validation
- **class-transformer** - object transformation
- **zod** - env variable validation schema

### File Processing
- **multer** - file upload
- **sharp** - image processing (cropping, resizing, optimization)
- **uuid** - unique identifier generation

### Email
- **nodemailer** - email sending
- SMTP configuration

### Development Tools
- **ESLint** - code linting
- **Prettier** - code formatting
- **Husky** - git hooks
- **lint-staged** - staged file linting
- **Jest** - testing

### Other
- **date-fns** - date manipulation
- **@nestjs/schedule** - task scheduler (cron jobs)
- **@nestjs/config** - configuration management

---

## Application Architecture

### Modular Structure (NestJS)

```
AppModule (root module)
├── ConfigModule (global)
├── MikroOrmModule (database)
├── ScheduleModule (scheduler)
├── UserModule (users)
├── AuthModule (authentication)
├── EmailModule (email service)
├── TournamentModule (tournaments)
└── UploadModule (file uploads)
```

### Folder Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Entry point
├── config/                    # Configuration
│   ├── env.validation.ts      # Env validation
│   └── env.zod.ts            # Zod schema for env
├── auth/                      # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts     # Endpoints: login, register, OAuth
│   ├── auth.service.ts        # Auth business logic
│   ├── strategies/            # Passport strategies
│   │   ├── jwt.strategy.ts
│   │   └── google.strategy.ts
│   ├── guards/                # Guards
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   └── dto/                   # Data Transfer Objects
│       ├── user-login.dto.ts
│       ├── forgot-password.dto.ts
│       ├── reset-password.dto.ts
│       └── set-password.dto.ts
├── user/                      # User module
│   ├── user.module.ts
│   ├── user.controller.ts     # CRUD for users
│   ├── user.service.ts        # Business logic
│   ├── entity/
│   │   └── user.entity.ts     # User entity
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── admin-update-user.dto.ts
│   │   └── change-password.dto.ts
│   └── types.ts               # Types (Roles, AuthProviders)
├── tournament/                # Tournament module
│   ├── tournament.module.ts
│   ├── tournament.controller.ts
│   ├── tournament.service.ts
│   ├── tournament-application.controller.ts
│   ├── tournament-application.service.ts
│   ├── patrol.controller.ts
│   ├── patrol.service.ts
│   └── entities:
│       ├── tournament.entity.ts           # Tournament
│       ├── tournament-application.entity.ts # Application
│       ├── patrol.entity.ts               # Patrol
│       └── patrol-member.entity.ts        # Patrol member
├── email/                     # Email service
│   ├── email.module.ts
│   ├── email.controller.ts
│   └── email.service.ts       # Email sending
├── upload/                    # File uploads
│   ├── upload.module.ts
│   ├── upload.controller.ts   # Upload endpoints
│   ├── upload.service.ts      # File processing
│   ├── interfaces/
│   │   └── upload-options.interface.ts
│   └── dto/
│       ├── upload-image.dto.ts
│       └── upload-attachment.dto.ts
├── migrations/                # Database migrations
│   ├── Migration*.ts
│   └── .snapshot-archery_db.json
└── seeders/                   # Database seeders
    └── DatabaseSeeder.ts
```

---

## Database - Entities

### User Entity
**File**: [src/user/entity/user.entity.ts](src/user/entity/user.entity.ts)

```typescript
@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  role: string;                 // 'admin' | 'user'

  @Property()
  email: string;                // Unique email

  @Property({ nullable: true, hidden: true })
  password?: string;            // Password hash (bcrypt)

  @Property()
  authProvider: AuthProvider;   // 'local' | 'google'

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  picture?: string;             // Image URL

  @Property({ nullable: true })
  bio?: string;

  @Property({ nullable: true })
  location?: string;

  @Property({ nullable: true })
  appLanguage?: string;         // App language

  @Property({ nullable: true, hidden: true })
  resetPasswordToken?: string;  // Password reset token

  @Property({ nullable: true, hidden: true })
  resetPasswordExpires?: Date;  // Token expiration time

  @Property({ nullable: true })
  federationNumber?: string;    // Federation number

  @Property({ type: 'array', nullable: true })
  categories?: string[];        // Archer categories

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
```

**User Roles** (enum in [src/user/types.ts](src/user/types.ts)):
- `admin` - administrator
- `user` - regular user

**Auth Providers**:
- `local` - email/password
- `google` - Google OAuth

---

### Tournament Entity
**File**: [src/tournament/tournament.entity.ts](src/tournament/tournament.entity.ts)

```typescript
@Entity()
export class Tournament {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  title: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true, type: 'json' })
  locationCoords?: { lat: number; lng: number };

  @Property()
  startDate: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ nullable: true })
  applicationDeadline?: Date;   // Application deadline

  @Property({ default: true })
  allowMultipleApplications: boolean = true;  // Allow multiple applications

  @Property({ nullable: true })
  banner?: string;              // Banner URL

  @Property({ type: 'json', nullable: true })
  attachments?: Array<{         // Attachments (PDF, docs)
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  }>;

  @ManyToOne(() => User)
  createdBy: User;              // Tournament creator

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
```

---

### TournamentApplication Entity
**File**: [src/tournament/tournament-application.entity.ts](src/tournament/tournament-application.entity.ts)

```typescript
export enum ApplicationStatus {
  PENDING = 'pending',      // Awaiting review
  APPROVED = 'approved',    // Approved
  REJECTED = 'rejected',    // Rejected
  WITHDRAWN = 'withdrawn',  // Withdrawn
}

@Entity()
export class TournamentApplication {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Tournament)
  tournament: Tournament;

  @ManyToOne(() => User)
  applicant: User;          // Applicant

  @Property({ type: 'string' })
  status: ApplicationStatus = ApplicationStatus.PENDING;

  @Property({ nullable: true })
  category?: string;        // Archer category

  @Property({ nullable: true })
  division?: string;        // Division (male/female)

  @Property({ nullable: true })
  equipment?: string;       // Equipment type (bow)

  @Property({ nullable: true })
  notes?: string;           // Additional notes

  @Property({ nullable: true })
  rejectionReason?: string; // Rejection reason

  @Property({ onCreate: () => new Date() })
  createdAt?: Date;

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
```

---

### Patrol Entity
**File**: [src/tournament/patrol.entity.ts](src/tournament/patrol.entity.ts)

```typescript
@Entity()
export class Patrol {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;             // Patrol name

  @Property({ nullable: true })
  description?: string;

  @ManyToOne(() => Tournament)
  tournament: Tournament;   // Associated tournament

  @ManyToOne(() => User)
  leader: User;             // Patrol leader

  @OneToMany(() => PatrolMember, member => member.patrol)
  members = [];             // Patrol members

  @Property({ onCreate: () => new Date() })
  createdAt: Date;

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
```

---

### PatrolMember Entity
**File**: [src/tournament/patrol-member.entity.ts](src/tournament/patrol-member.entity.ts)

Links users to patrols (many-to-many through junction table).

---

## API Endpoints

### Authentication Endpoints
**Controller**: [src/auth/auth.controller.ts](src/auth/auth.controller.ts)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/login` | ❌ | - | Login (email/password) |
| POST | `/auth/forgot-password` | ❌ | - | Request password reset |
| POST | `/auth/reset-password` | ❌ | - | Reset password with token |
| POST | `/auth/set-password` | ✅ | - | Set password for OAuth user |
| GET | `/auth/google` | ❌ | - | Start Google OAuth flow |
| GET | `/auth/google/callback` | ❌ | - | Google OAuth callback |
| GET | `/auth/google/test` | ❌ | - | Test Google OAuth configuration |
| POST | `/auth/admin/reset-password/:userId` | ✅ | admin | Admin resets user password |

**Login Example**:
```typescript
// POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Forgot Password Example**:
```typescript
// POST /auth/forgot-password
{
  "email": "user@example.com"
}

// Response:
{
  "message": "Password reset email sent"
}
```

---

### User Endpoints
**Controller**: [src/user/user.controller.ts](src/user/user.controller.ts)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/users` | ❌ | - | Create user (registration) |
| GET | `/users/profile` | ✅ | - | Get own profile |
| PATCH | `/users/profile` | ✅ | - | Update own profile |
| PATCH | `/users/change-password` | ✅ | - | Change password |
| DELETE | `/users/:id` | ✅ | - | Delete user (own or admin) |
| GET | `/users/admin/all` | ✅ | admin | Get all users |
| GET | `/users/admin/:userId` | ✅ | admin | Get user by ID |
| PATCH | `/users/admin/:id` | ✅ | admin | Update user (admin) |

**Create User Example**:
```typescript
// POST /users
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Update Profile Example**:
```typescript
// PATCH /users/profile
// Headers: Authorization: Bearer <token>
{
  "firstName": "Jane",
  "bio": "Professional archer",
  "location": "Kyiv, Ukraine",
  "federationNumber": "UA12345",
  "categories": ["Recurve", "Compound"]
}
```

---

### Tournament Endpoints
**Controller**: [src/tournament/tournament.controller.ts](src/tournament/tournament.controller.ts)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/tournaments` | ✅ | admin | Create tournament |
| GET | `/tournaments` | ❌ | - | Get all tournaments |
| GET | `/tournaments/:id` | ❌ | - | Get tournament by ID |
| PUT | `/tournaments/:id` | ✅ | admin | Update tournament |
| DELETE | `/tournaments/:id` | ✅ | admin | Delete tournament |

**Create Tournament Example**:
```typescript
// POST /tournaments
// Headers: Authorization: Bearer <admin-token>
{
  "title": "Ukrainian National Championship 2025",
  "description": "Annual archery championship",
  "address": "Olympic Stadium, Kyiv",
  "locationCoords": {
    "lat": 50.4501,
    "lng": 30.5234
  },
  "startDate": "2025-06-15T09:00:00Z",
  "endDate": "2025-06-18T18:00:00Z",
  "applicationDeadline": "2025-06-01T23:59:59Z",
  "allowMultipleApplications": true,
  "banner": "/uploads/tournaments/banner-123.jpg"
}
```

---

### Tournament Application Endpoints
**Controller**: [src/tournament/tournament-application.controller.ts](src/tournament/tournament-application.controller.ts)

Tournament application management (submission, approval, rejection).

---

### Patrol Endpoints
**Controller**: [src/tournament/patrol.controller.ts](src/tournament/patrol.controller.ts)

Patrol (participant groups) management for tournaments.

---

### Upload Endpoints
**Controller**: [src/upload/upload.controller.ts](src/upload/upload.controller.ts)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/image` | ✅ | Upload image (with processing) |
| POST | `/upload/attachment` | ✅ | Upload attachment (PDF, docs) |
| DELETE | `/upload/attachment/:tournamentId/:filename` | ✅ | Delete attachment |

**Image Upload Features**:
- Cropping
- Resizing
- Compression
- Supported formats: JPEG, PNG, WebP
- Automatic quality optimization

**Upload Image Example**:
```typescript
// POST /upload/image
// Content-Type: multipart/form-data
{
  "file": <binary>,
  "type": "tournament_banner",
  "entityId": "tournament-uuid",
  "cropX": 0,
  "cropY": 0,
  "cropWidth": 1200,
  "cropHeight": 600,
  "quality": 80
}

// Response:
{
  "url": "/uploads/tournaments/uuid/banner-123.jpg",
  "filename": "banner-123.jpg"
}
```

---

## Environment Configuration

### Environment Variables
**File**: [.env.example](.env.example)

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=archery_user
DATABASE_PASSWORD=archery_password
DATABASE_NAME=archery_db

# Server Configuration
PORT=3000

# JWT Configuration
JWT_SECRET=supersecret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Application URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000

# Email Configuration (SMTP)
SMTP_HOST=mail.fedirko.pro
SMTP_PORT=465
SMTP_USER=no-reply@fedirko.pro
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=no-reply@fedirko.pro
SMTP_FROM_NAME="Archery App"
```

### Environment Validation
**File**: [src/config/env.zod.ts](src/config/env.zod.ts)

Uses **Zod** for environment variable validation on app startup. If any variable is missing or invalid, the app won't start.

---

## Migrations (MikroORM)

### Basic Commands

```bash
# Create new migration
pnpm run mikro-orm migration:create

# Execute all pending migrations
pnpm run mikro-orm migration:up

# Rollback last migration
pnpm run mikro-orm migration:down

# List migrations and their status
pnpm run mikro-orm migration:list

# Show pending migrations
pnpm run mikro-orm migration:pending
```

### Existing Migrations
**Folder**: [src/migrations/](src/migrations/)

Main migrations:
1. `Migration20241119213454.ts` - Initial DB structure
2. `Migration20241119235752.ts` - Entity updates
3. `Migration20250704233945.ts` - Tournament fields addition
4. `Migration20250706113141_AddResetPasswordFields.ts` - Reset password fields
5. `Migration20250707221919.ts` - Tournament application update
6. `Migration20250727194404_AddApplicationDeadlineToTournament.ts` - Application deadline
7. `Migration20250727211853_AddAllowMultipleApplicationsToTournament.ts` - Multiple applications
8. `Migration20251003120000_AddLanguageToUser.ts` - User language
9. `Migration20251005142500_RenameLanguageToAppLanguage.ts` - Field rename
10. `Migration20251005143000_DropWebsiteFromUser.ts` - Remove website
11. `Migration20251104193354_add-tournament-banner-attachments.ts` - Banner and attachments

---

## Authentication and Authorization

### JWT Strategy
**File**: [src/auth/strategies/jwt.strategy.ts](src/auth/strategies/jwt.strategy.ts)

- Uses `passport-jwt`
- Tokens obtained from Bearer token in Authorization header
- Secret: `JWT_SECRET` from .env
- Payload contains: `{ sub: userId, email, role }`

### Google OAuth Strategy
**File**: [src/auth/strategies/google.strategy.ts](src/auth/strategies/google.strategy.ts)

- OAuth 2.0 flow
- Callback URL: `/auth/google/callback`
- After successful authentication, user is redirected to frontend with JWT token

### Guards

**JwtAuthGuard** ([src/auth/guards/jwt-auth.guard.ts](src/auth/guards/jwt-auth.guard.ts)):
- Verifies JWT token presence and validity
- Adds `req.user` with user data

**RolesGuard** ([src/auth/guards/roles.guard.ts](src/auth/guards/roles.guard.ts)):
- Checks user role
- Used with `@Roles()` decorator

### Controller Usage Example

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.Admin)
@Post()
async create(@Body() data: any, @Request() req: any) {
  // Admin only
  // req.user contains user data
}
```

---

## Email Service

**File**: [src/email/email.service.ts](src/email/email.service.ts)

### Features
- Email sending via SMTP (Nodemailer)
- Email templates for:
  - Password reset
  - Registration confirmation
  - Change notifications

### Configuration
SMTP settings from .env:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

### Send Email Example

```typescript
await this.emailService.sendPasswordResetEmail(
  user.email,
  resetToken,
  user.firstName
);
```

More details: [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md)

---

## File Upload and Processing

**Module**: [src/upload/](src/upload/)

### Upload Service
**File**: [src/upload/upload.service.ts](src/upload/upload.service.ts)

### Image Processing (Sharp)
- **Cropping** - crop by coordinates
- **Resizing** - resize
- **Compression** - compression (JPEG quality)
- **Format conversion** - format conversion
- **Optimization** - file size optimization

### Upload Types
1. **Images** (tournament banners, user avatars):
   - Processing via Sharp
   - Saved to `/uploads/tournaments/` or `/uploads/users/`

2. **Attachments** (PDFs, documents):
   - No processing
   - Saved to `/uploads/tournaments/:tournamentId/attachments/`

### Static Files
**Configuration**: [src/main.ts:23-25](src/main.ts#L23-L25)

```typescript
app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});
```

Files available at URL: `http://localhost:3000/uploads/...`

---

## CORS Configuration

**File**: [src/main.ts:16-19](src/main.ts#L16-L19)

```typescript
app.enableCors({
  origin: [frontendUrl],  // From .env FRONTEND_URL
  credentials: true,
});
```

---

## Validation Pipeline

**File**: [src/main.ts:27-33](src/main.ts#L27-L33)

Global ValidationPipe for automatic DTO validation:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,          // Removes fields not in DTO
    forbidNonWhitelisted: true, // Throws error on unknown fields
    transform: true,          // Automatic type transformation
  }),
);
```

---

## Scheduler (Cron Jobs)

**Module**: `@nestjs/schedule`

Can be used for:
- Auto-close registration after deadline
- Tournament reminders
- Cleanup old files

---

## Seeders

**File**: [src/seeders/DatabaseSeeder.ts](src/seeders/DatabaseSeeder.ts)

For populating DB with test data (users, tournaments).

```bash
# Run seeder (need to add command)
pnpm run mikro-orm seeder:run
```

---

## NPM Scripts

### Development
```bash
pnpm run start          # Start in normal mode
pnpm run start:dev      # Start with watch mode
pnpm run start:debug    # Start with debugger
```

### Production
```bash
pnpm run build          # Build project
pnpm run start:prod     # Start production
```

### Testing
```bash
pnpm run test           # Unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # Code coverage
pnpm run test:e2e       # E2E tests
pnpm run test:debug     # Debug tests
```

### Code Quality
```bash
pnpm run lint           # ESLint with auto-fix
pnpm run format         # Prettier formatting
```

### Database
```bash
pnpm run mikro-orm migration:create   # Create migration
pnpm run mikro-orm migration:up       # Execute migrations
pnpm run mikro-orm migration:down     # Rollback migration
pnpm run mikro-orm migration:list     # List migrations
```

---

## Git Hooks (Husky + lint-staged)

**Pre-commit hook**:
- Automatic ESLint fix
- Automatic Prettier formatting
- Only for staged files (`src/**/*.ts`)

Configuration in [package.json:24-29](package.json#L24-L29):
```json
"lint-staged": {
  "src/**/*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

---

## Common Workflows

### 1. Create New User (Registration)
```
POST /users
  ↓
UserService.create()
  ↓
- Email validation (uniqueness)
- Password hashing (bcryptjs)
- Create user entity
  ↓
Save to DB
  ↓
Return created user
```

### 2. Login
```
POST /auth/login
  ↓
AuthService.login()
  ↓
- Find user by email
- Verify password (bcrypt.compare)
- Generate JWT token
  ↓
Return { access_token }
```

### 3. Google OAuth
```
GET /auth/google
  ↓
Redirect to Google OAuth
  ↓
User authenticates
  ↓
GET /auth/google/callback
  ↓
GoogleStrategy.validate()
  ↓
- Find or create user
- Generate JWT
  ↓
Redirect to frontend with token
```

### 4. Create Tournament
```
POST /tournaments (admin only)
  ↓
TournamentController.create()
  ↓
- Validate data
- Create Tournament entity
- Set createdBy = current user
  ↓
Save to DB
  ↓
Return created tournament
```

### 5. Upload Image
```
POST /upload/image (multipart/form-data)
  ↓
UploadController.uploadImage()
  ↓
UploadService.processAndSaveImage()
  ↓
- Get file buffer
- Sharp processing:
  * Cropping
  * Resizing
  * Compression
- Save to disk
  ↓
Return image URL
```

### 6. Password Reset
```
POST /auth/forgot-password
  ↓
AuthService.forgotPassword()
  ↓
- Generate reset token
- Save token and expiry to DB
- Send email with link
  ↓
User receives email
  ↓
POST /auth/reset-password { token, newPassword }
  ↓
- Verify token
- Check expiry
- Hash new password
- Clear reset token
  ↓
Update password in DB
```

---

## Important Code Features

### 1. UUID as Primary Key
All entities use UUID instead of auto-increment ID:
```typescript
@PrimaryKey()
id: string = uuid();
```

### 2. Hidden Fields
Passwords and tokens are hidden (not returned in API):
```typescript
@Property({ nullable: true, hidden: true })
password?: string;
```

### 3. Timestamps
Automatic `createdAt` and `updatedAt`:
```typescript
@Property({ onCreate: () => new Date() })
createdAt?: Date;

@Property({ onUpdate: () => new Date(), nullable: true })
updatedAt?: Date;
```

### 4. JSON Fields
MikroORM supports JSON fields for complex objects:
```typescript
@Property({ type: 'json', nullable: true })
locationCoords?: { lat: number; lng: number };

@Property({ type: 'json', nullable: true })
attachments?: Array<{...}>;
```

### 5. Relations
Using decorators for relations:
- `@ManyToOne()` - many to one
- `@OneToMany()` - one to many

---

## Debugging and Logging

### MikroORM Debug
In [mikro-orm.config.ts:13](mikro-orm.config.ts#L13):
```typescript
debug: process.env.NODE_ENV !== 'production',
```
In development mode, all SQL queries are logged to console.

---

## Security Best Practices

### 1. Password Hashing
Using `bcryptjs` for password hashing (not plaintext).

### 2. JWT Tokens
- Tokens signed with secret (`JWT_SECRET`)
- Tokens have expiration time

### 3. CORS
- Restrict origin to `FRONTEND_URL`
- Credentials: true for cookies

### 4. Validation
- All input data validated via `class-validator`
- `whitelist: true` removes unknown fields

### 5. Guards
- `JwtAuthGuard` for endpoint protection
- `RolesGuard` for role-based access control

### 6. Hidden Fields
- Passwords, tokens not returned in API responses

---

## Deployment Checklist

### 1. Environment Variables
- Set production values in `.env`
- `NODE_ENV=production`
- Change `JWT_SECRET` to strong secret
- Configure production database

### 2. Database
- Run all migrations: `pnpm run mikro-orm migration:up`
- Ensure DB is backed up

### 3. Build
```bash
pnpm run build
```

### 4. Start
```bash
pnpm run start:prod
```

### 5. HTTPS
- Configure SSL certificate
- Use reverse proxy (nginx)

### 6. CORS
- Set correct `FRONTEND_URL`

### 7. File Uploads
- Ensure `uploads/` folder exists
- Configure access permissions

---

## Troubleshooting

### Database Connection Error
- Check DATABASE_* variables in .env
- Ensure PostgreSQL is running
- Check network accessibility

### Migration Errors
- Ensure DB schema is synchronized
- Check previous migrations
- View MikroORM debug logs

### JWT Errors
- Check `JWT_SECRET`
- Check token expiration
- Ensure token is passed in header

### File Upload Errors
- Check access permissions to `uploads/` folder
- Check file size (multer limits)
- Check file mimetype

### Google OAuth Errors
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check `GOOGLE_CALLBACK_URL` (must match Google Console)
- Ensure Google+ API is enabled

### Email Errors
- Check SMTP_* variables
- Test with SMTP testing tools
- Check firewall rules for SMTP port

---

## Extending Functionality

### Adding New Entity

1. Create entity file in appropriate module:
```typescript
// src/my-module/my-entity.entity.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
export class MyEntity {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date;
}
```

2. Create migration:
```bash
pnpm run mikro-orm migration:create
```

3. Execute migration:
```bash
pnpm run mikro-orm migration:up
```

### Adding New Endpoint

1. Create DTO:
```typescript
// src/my-module/dto/create-my.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMyDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

2. Add method to controller:
```typescript
@Post()
@UseGuards(JwtAuthGuard)
async create(@Body() dto: CreateMyDto) {
  return this.myService.create(dto);
}
```

3. Add method to service:
```typescript
async create(dto: CreateMyDto) {
  const entity = new MyEntity();
  entity.name = dto.name;
  await this.em.persistAndFlush(entity);
  return entity;
}
```

---

## Useful Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **MikroORM Docs**: https://mikro-orm.io/
- **Passport.js**: http://www.passportjs.org/
- **Sharp (Image Processing)**: https://sharp.pixelplumbing.com/

---

## Contacts and Support

- **Repository**: GitHub (check package.json for URL)
- **License**: UNLICENSED (private project)
- **Author**: (check package.json)

---

## Versions and Changelog

### v0.0.1 (Current)
- Initial version
- Basic user, authentication, tournament functionality
- Google OAuth
- File uploads
- Email service

---

## Additional Documentation

- [EMAIL_SETUP.md](docs/EMAIL_SETUP.md) - Email service setup
- [GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) - Google OAuth setup
- [README.md](docs/README.md) - Main documentation

---

**Last Updated**: 2025-11-30
