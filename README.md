# 🏹 Archery App Backend

NestJS-based backend application for managing archery tournaments, users, and authentication. Built with TypeScript, PostgreSQL, and MikroORM.

> **Для деплою на VPS**: Дивіться [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🚀 Features

- **Authentication**: JWT-based authentication with Google OAuth support
- **User Management**: User registration, login, password reset functionality, password change
- **Tournament Management**: Create and manage archery tournaments with multiple applications support
- **Application System**: Tournament applications with deadline management and category-based restrictions
- **Email Integration**: Password reset and notification emails
- **Database**: PostgreSQL with MikroORM for type-safe database operations
- **API**: RESTful API with comprehensive endpoints
- **Code Quality**: Pre-commit hooks with ESLint and Prettier

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Docker** and **Docker Compose** (for database)
- **PostgreSQL** (if not using Docker)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd archery-app-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=archery_user
   DATABASE_PASSWORD=archery_password
   DATABASE_NAME=archery_db

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

   # Application URLs
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:3000

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

## 🗄️ Database Setup

### Option 1: Using Docker (Recommended)

1. **Start the PostgreSQL database**
   ```bash
   docker compose up -d
   ```

2. **Verify the database is running**
   ```bash
   docker compose ps
   ```

#### Using Colima (macOS alternative to Docker Desktop)

If you're using [Colima](https://github.com/abiosoft/colima) instead of Docker Desktop:

1. **Install Colima and Docker CLI** (if not already installed)
   ```bash
   brew install colima docker docker-compose
   ```

2. **Start Colima** (required before running any Docker commands)
   ```bash
   colima start
   ```

3. **Then start the database**
   ```bash
   docker-compose up -d
   ```

4. **Useful Colima commands**
   ```bash
   colima status    # Check if Colima is running
   colima stop      # Stop Colima VM
   colima start     # Start Colima VM
   ```

> **Note**: If you get "Cannot connect to the Docker daemon" errors, make sure Colima is running first with `colima start`.

### Option 2: Local PostgreSQL

If you prefer to use a local PostgreSQL installation:

1. Create a database named `archery_db`
2. Create a user `archery_user` with password `archery_password`
3. Grant necessary permissions to the user

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the development server**
   ```bash
   pnpm run start:dev
   ```

   The application will be available at `http://localhost:3000`

   **Rule PDFs:** Rules in the DB store only a `downloadLink` (path/filename); PDF files are served from `pdf/rules/`. Copy PDFs from `app-archery/public/pdf/rules/` into this repo’s `pdf/rules/` (see `pdf/rules/README.md`).

2. **With debugging enabled**
   ```bash
   pnpm run start:debug
   ```

### Production Mode

1. **Build the application**
   ```bash
   pnpm run build
   ```

2. **Start the production server**
   ```bash
   pnpm run start:prod
   ```

## 🗃️ Database Migrations

The database runs in Docker (`docker compose up -d`). Migrations run **from your host** and connect to `localhost:5432` (the container exposes this port). Ensure the DB container is running before any migration command.

### Running Migrations

1. **Ensure the database container is running**
   ```bash
   docker compose up -d
   docker compose ps   # optional: verify db is up
   ```

2. **Generate a new migration** (when you modify entities)
   ```bash
   pnpm run mikro-orm migration:create
   ```

3. **Run pending migrations**
   ```bash
   pnpm run mikro-orm migration:up
   ```

4. **Check migration status**
   ```bash
   pnpm run mikro-orm migration:list
   ```

5. **Revert the last migration**
   ```bash
   pnpm run mikro-orm migration:down
   ```

### Reset migrations and create a single initial migration

Use this when existing migration files are out of sync and you want one fresh initial migration from current entities.

1. **Start the database** (so the CLI can connect):
   ```bash
   docker compose up -d
   ```

2. **Remove old migration files** in both `src/migrations` and `dist/src/migrations` (no DB connection needed). The CLI uses `dist`, so both must be cleared:
   ```bash
   pnpm run migration:clear
   ```

3. **Clear migration history in the database.** MikroORM refuses to create an initial migration if the `mikro_orm_migrations` table has any rows. With the DB in Docker:
   ```bash
   pnpm run migration:clear-db-history
   ```
   Or run manually: `docker-compose exec db psql -U archery_user -d archery_db -c "TRUNCATE TABLE mikro_orm_migrations;"`

4. **Generate the initial migration** (requires DB running):
   ```bash
   pnpm run migration:initial
   ```

### Migration Commands Reference

```bash
# Create a new migration
pnpm run mikro-orm migration:create

# Create initial migration (clean slate; DB must be running)
pnpm run migration:initial

# Remove all migration files and snapshots (no DB needed)
pnpm run migration:clear

# Clear migration history in DB (required before migration:initial if migrations were run before)
pnpm run migration:clear-db-history

# Run all pending migrations
pnpm run mikro-orm migration:up

# Run migrations up to a specific version
pnpm run mikro-orm migration:up --to=Migration20241119213454

# Revert the last migration
pnpm run mikro-orm migration:down

# List all migrations and their status
pnpm run mikro-orm migration:list

# Show pending migrations
pnpm run mikro-orm migration:pending
```

## 🧪 Testing

### Unit Tests
```bash
pnpm run test
```

### E2E Tests
```bash
pnpm run test:e2e
```

### Test Coverage
```bash
pnpm run test:cov
```

### Watch Mode
```bash
pnpm run test:watch
```

## 🔧 Development Tools

### Code Formatting
```bash
pnpm run format
```

### Linting
```bash
pnpm run lint
```

### Type Checking
```bash
pnpm run build
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── controllers/      # Auth controllers
│   ├── services/         # Auth services
│   ├── guards/           # JWT and role guards
│   ├── strategies/       # Passport strategies
│   └── dto/             # Auth DTOs
├── user/                 # User management module
│   ├── entity/          # User entity
│   ├── controllers/     # User controllers
│   ├── services/        # User services
│   └── dto/            # User DTOs
├── tournament/           # Tournament management module
│   ├── entity/          # Tournament entities
│   ├── controllers/     # Tournament controllers
│   ├── services/        # Tournament services
│   └── dto/            # Tournament DTOs
├── email/               # Email service module
├── config/              # Configuration files
├── migrations/          # Database migrations
└── main.ts             # Application entry point
```

## 🔐 Authentication Setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your redirect URI: `http://localhost:3000/auth/google/callback`
6. Update your `.env` file with the client ID and secret

For detailed setup instructions, see [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)

### Email Setup

Configure your email service for password reset functionality. See [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md) for detailed instructions.

## 🚀 Deployment

### Quick Start with Docker

1. **Copy environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Run migrations and seeders**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend pnpm mikro-orm migration:up
   docker-compose -f docker-compose.prod.yml exec backend pnpm mikro-orm seeder:run
   ```

### Full Deployment Guide

For detailed deployment instructions on VPS with Ubuntu and Docker, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## 📚 API Documentation

The API endpoints are organized as follows:

- **Authentication**: `/auth/*` - Login, register, password reset, Google OAuth
- **Users**: `/users/*` - User management
- **Tournaments**: `/tournaments/*` - Tournament management
- **Tournament Applications**: `/tournament-applications/*` - Application management
- **Patrols**: `/patrols/*` - Patrol generation and management
- **Bow Categories**: `/bow-categories/*` - Bow category management
- **Divisions**: `/divisions/*` - Division management
- **Rules**: `/rules/*` - Rule management
- **Clubs**: `/clubs/*` - Club management
- **Upload**: `/upload/*` - File upload (images, attachments)

For detailed API endpoint information, refer to the controller files in `src/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check your database credentials in `.env`
   - Verify the database exists
   - If using Colima: ensure it's running with `colima start`

2. **Migration Errors**
   - Make sure all previous migrations are applied
   - Check for syntax errors in your entity files
   - Verify the database schema matches your entities

3. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Or kill the process using the current port

4. **Google OAuth Issues**
   - Verify your Google OAuth credentials
   - Check that the redirect URI matches exactly
   - Ensure the Google+ API is enabled

5. **Docker Daemon Not Running (Colima users)**
   - Run `colima start` before using Docker commands
   - Check status with `colima status`
   - If Colima fails to start, try `colima delete` then `colima start`

### Getting Help

If you encounter any issues:

1. Check the existing documentation in the `docs/` folder
2. Review the error logs
3. Ensure all prerequisites are installed
4. Verify your environment variables are correctly set

## 🔧 Code Quality

### Pre-commit Hooks
The project uses Husky and lint-staged to ensure code quality:

- **ESLint** - Code linting and error detection
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Automatic formatting** - Code is automatically formatted on commit

### Available Scripts
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run build` - Type checking and build

## 🔗 Related Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for VPS
- [docs/GOOGLE_OAUTH_SETUP.md](./docs/GOOGLE_OAUTH_SETUP.md) - Google OAuth setup
- [docs/EMAIL_SETUP.md](./docs/EMAIL_SETUP.md) - Email configuration

### External Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [MikroORM Documentation](https://mikro-orm.io/) 