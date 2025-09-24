## Analysis and Recommendations

This document summarizes a security and quality audit of the NestJS backend. It highlights critical risks, high‑impact improvements, and operational polish with concrete implementation snippets.

### Overview

- Tech: NestJS 10, MikroORM 6, PostgreSQL, JWT, Google OAuth, Nodemailer, Zod + dotenv.
- Scope reviewed: config/bootstrap, auth, user, email, tournaments, patrols, applications.

## Critical Risks (fix ASAP)

### 1) Sensitive user fields exposed in API responses
`User` entity returns `password`, `resetPasswordToken`, `resetPasswordExpires` in many endpoints.

Recommended:
- Hide sensitive fields via MikroORM or `class-transformer`.
- Option A (MikroORM):

```ts
// user.entity.ts
@Property({ hidden: true, nullable: true })
password?: string;
@Property({ hidden: true, nullable: true })
resetPasswordToken?: string;
@Property({ hidden: true, nullable: true })
resetPasswordExpires?: Date;
```

- Option B (Nest serialization): enable `ClassSerializerInterceptor` globally and use `@Exclude()` on fields.

### 2) Privilege escalation via profile update
`UpdateUserDto` includes `role` and `updateProfile` assigns request body directly, allowing users to grant themselves admin.

Recommended:
- Remove `role` from `UpdateUserDto`.
- Ignore `role` changes in normal profile updates; separate admin-only DTO for role updates.

```ts
// update-user.dto.ts (remove role)
export class UpdateUserDto { /* firstName, lastName, bio, location, website, picture */ }

// user.service.ts (server-side guard)
const { role, ...safe } = updateData as any;
Object.assign(user, safe);
```

### 3) Unguarded destructive endpoint
`DELETE /users/:id` is public.

Recommended:
- Require `JwtAuthGuard`. Allow self-delete or admin-only.

```ts
@UseGuards(JwtAuthGuard)
@Delete(':id')
remove(@Param('id') id: string, @Request() req: any) {
  if (req.user.sub !== id && req.user.role !== 'admin') throw new ForbiddenException();
  return this.userService.remove(id);
}
```

### 4) Missing global request validation and serialization
No global `ValidationPipe`; several controllers accept `any`. Hidden fields also require global serialization.

Recommended:
- Add global validation with whitelist and transform.
- Also enable global serialization so hidden/excluded fields are honored.

```ts
// main.ts
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));

app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

### 5) OAuth token exposed in URL query
Google callback redirects with `?token=...`, leaking tokens via logs/history.

Recommended:
- Prefer httpOnly, Secure cookie; or use URL fragment `#token=...`.
- Guard or remove diagnostic OAuth endpoint in production.

```ts
// auth.controller.ts (cookie example)
res.cookie('access_token', jwt, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3600_000 });
res.redirect(frontendUrl + '/auth/google/callback');

// Protect the test endpoint
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('google/test')
```

### 6) Public email-sending endpoint
`POST /email/test` is unauthenticated.

Recommended:
- Guard with `JwtAuthGuard` and an admin role or remove in production.

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post('test')
```

### 7) Insecure SMTP TLS and verbose credential logging
TLS verification disabled; SMTP username logged.

Recommended:
- Enable TLS verification for non-dev.
- Avoid logging SMTP username; never log passwords.

```ts
const isProd = this.configService.get('NODE_ENV') === 'production';
// nodemailer transport
tls: { rejectUnauthorized: isProd },
// log without username
this.logger.log(`Initializing SMTP transporter (host: ${host}, port: ${port})`);
```

## High‑Impact Improvements

### A) JWT strategy hardening and consistency
Use `ConfigService` in strategy; throw Unauthorized when user not found.

```ts
// jwt.strategy.ts
constructor(config: ConfigService, private userService: UserService) {
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: config.get('JWT_SECRET'),
  });
}
async validate(payload: any) {
  const user = await this.userService.findById(payload.sub);
  if (!user) throw new UnauthorizedException();
  return { sub: user.id, email: user.email, role: user.role };
}
```

### B) Unify environment validation
Currently both Zod and a manual `.env` validator exist, with mismatched keys.

Recommended:
- Keep Zod only; include all required keys used by the app (`FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_CALLBACK_URL`, `PORT`, SMTP fields, etc.). Remove the manual validator import in `main.ts`.

```ts
export const envSchema = z.object({
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.string().transform((v) => parseInt(v, 10)),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  PORT: z.string().transform((v) => parseInt(v, 10)),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().transform((v) => parseInt(v, 10)),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_EMAIL: z.string().email(),
  SMTP_FROM_NAME: z.string().min(1),
});

// main.ts
// import './config/env.validation'; // remove this line
```

### C) Registration and roles
Ensure public registration cannot set elevated roles.

Recommended:
- Remove `role` from `CreateUserDto` (or ignore on service side); set default role server-side. Provide a separate admin-only endpoint to change roles.

### D) Data integrity and indexes
Add unique index on `User.email` at DB level.

```ts
@Property({ unique: true })
email: string;
```

### E) DTOs for tournaments/patrols/applications
Replace `any` in controllers with DTOs + validation for create/update.

### F) Response shaping and pagination
Add pagination/filtering to list endpoints, and avoid over-populating relations by default.

```ts
// controller example
@Get()
async findAll(@Query('limit') limit = 20, @Query('offset') offset = 0) {
  return this.tournamentService.findAll({ limit: +limit, offset: +offset });
}

// service example
async findAll(opts: { limit: number; offset: number }) {
  const [items, total] = await this.em.findAndCount(Tournament, {}, {
    limit: opts.limit,
    offset: opts.offset,
    fields: ['id','title','startDate','endDate','applicationDeadline'],
  });
  return { items, total };
}
```

### G) Error handling consistency
Use Nest exceptions instead of `new Error()` to ensure correct HTTP codes.

## Operational Enhancements

### Security middleware
- Add `helmet` globally.
- Add `@nestjs/throttler` in `AppModule`.

```ts
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

```ts
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // ... other modules
  ],
})
export class AppModule {}
```

### CORS tightening
- Validate configured origin(s), avoid overly broad wildcards.

```ts
// main.ts
const frontendUrl = configService.get<string>('FRONTEND_URL');
app.enableCors({
  origin: [frontendUrl],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
});
```

### Token lifecycle
- Introduce refresh tokens with rotation + revocation list to improve UX/security over 1h access tokens.

### Logging
- Use structured logging (e.g., `pino`) and avoid logging secrets/user PII.

### Version alignment
- README states Node 18+, package enforces Node >=22. Align both (prefer Node 22 in README or relax engines).

### Docker and envs
- Keep default local creds in compose, ensure prod uses secure secrets and not compose defaults. Consider a `.env` file loaded by compose for local dev.

## Suggested Implementation Order (quick win → deeper)

1) Enable global `ValidationPipe` and add DTOs for non-auth modules.
2) Hide sensitive `User` fields; remove role from public DTOs; block role updates in profile.
3) Guard `DELETE /users/:id`; protect or remove `/email/test`.
4) Fix Google OAuth redirect to httpOnly cookie or URL fragment.
5) Unify env validation (Zod only) and add missing keys; use `ConfigService` in `JwtStrategy`.
6) Add helmet + throttling; adjust CORS.
7) Add `unique` on `User.email`; add migrations.
8) Add pagination to list endpoints.
9) Optional: introduce refresh tokens and structured logging.

Example migration commands after entity changes:

```bash
pnpm run mikro-orm migration:create
pnpm run mikro-orm migration:up
```

## Acceptance Checklist

- [ ] Sensitive fields never appear in API responses.
- [ ] Users cannot escalate own role; only admins can change roles.
- [ ] Destructive endpoints require auth and authorization.
- [ ] ValidationPipe enabled; bodies strictly validated (whitelist on).
- [ ] Global serializer enabled; sensitive fields excluded.
- [ ] OAuth tokens not exposed in URLs; cookie or fragment used.
- [ ] Email test endpoint protected or removed.
- [ ] SMTP TLS verification on (non-dev); no credential logging.
- [ ] Single source of truth for env validation; all keys covered.
- [ ] `User.email` unique at DB level; migration applied.
- [ ] JWT strategy uses `ConfigService` and rejects missing users.
- [ ] Node version aligned between README and engines.


