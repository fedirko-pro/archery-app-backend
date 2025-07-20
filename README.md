# Archery App Backend

A NestJS-based backend application for managing archery tournaments, users, and authentication. Built with TypeScript, PostgreSQL, and MikroORM.

## 🚀 Features

- **Authentication**: JWT-based authentication with Google OAuth support
- **User Management**: User registration, login, password reset functionality
- **Tournament Management**: Create and manage archery tournaments
- **Email Integration**: Password reset and notification emails
- **Database**: PostgreSQL with MikroORM for type-safe database operations
- **API**: RESTful API with comprehensive endpoints

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
   docker-compose up -d
   ```

2. **Verify the database is running**
   ```bash
   docker-compose ps
   ```

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

### Running Migrations

1. **Generate a new migration** (when you modify entities)
   ```bash
   pnpm run mikro-orm migration:create
   ```

2. **Run pending migrations**
   ```bash
   pnpm run mikro-orm migration:up
   ```

3. **Check migration status**
   ```bash
   pnpm run mikro-orm migration:list
   ```

4. **Revert the last migration**
   ```bash
   pnpm run mikro-orm migration:down
   ```

### Migration Commands Reference

```bash
# Create a new migration
pnpm run mikro-orm migration:create

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

### Environment Variables for Production

Make sure to update your environment variables for production:

```env
NODE_ENV=production
DATABASE_HOST=your-production-db-host
DATABASE_PORT=5432
DATABASE_USER=your-production-db-user
DATABASE_PASSWORD=your-production-db-password
DATABASE_NAME=your-production-db-name
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/auth/google/callback
```

### Build and Deploy

1. **Build the application**
   ```bash
   pnpm run build
   ```

2. **Start the production server**
   ```bash
   pnpm run start:prod
   ```

## 📚 API Documentation

The API endpoints are organized as follows:

- **Authentication**: `/auth/*` - Login, register, password reset
- **Users**: `/users/*` - User management
- **Tournaments**: `/tournaments/*` - Tournament management
- **Email**: `/email/*` - Email-related endpoints

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

### Getting Help

If you encounter any issues:

1. Check the existing documentation in the `docs/` folder
2. Review the error logs
3. Ensure all prerequisites are installed
4. Verify your environment variables are correctly set

## 🔗 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [MikroORM Documentation](https://mikro-orm.io/)
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)
- [Email Setup](docs/EMAIL_SETUP.md) 