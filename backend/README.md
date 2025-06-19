# License Renewal Manager - Backend

This is the backend API for the Software License Renewal Manager, built with Node.js, Express, and SQLite.

## Features

- RESTful API endpoints for license management
- JWT authentication with role-based access control
- SQLite database for data storage
- Email notifications for expiring licenses
- File upload handling for license documents
- Audit logging for all user actions
- Daily cron job to check for expiring licenses

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user info

### Licenses
- `GET /api/licenses` - List all licenses
- `GET /api/licenses/:id` - Retrieve a specific license
- `POST /api/licenses` - Create a new license
- `PUT /api/licenses/:id` - Update license
- `DELETE /api/licenses/:id` - Delete license
- `GET /api/licenses/alerts/expiring` - Get expiring licenses
- `GET /api/licenses/dashboard/stats` - Get dashboard statistics

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user details (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Directory Structure

- `controllers/` - API route handlers
- `database/` - Database configuration, migrations, and seeds
- `middleware/` - Express middleware (auth, validation, etc.)
- `routes/` - API route definitions
- `uploads/` - Directory for uploaded license files
- `utils/` - Utility functions (email, audit logging, etc.)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in production mode.

### `npm run dev`

Runs the app in development mode with nodemon for auto-restart on file changes.

### `npm run db:migrate`

Runs database migrations to set up the database schema.

### `npm run db:seed`

Seeds the database with initial data (users, sample licenses).

### `npm test`

Runs the test suite using Jest.

## Environment Configuration

The backend uses environment variables for configuration. Create a `.env` file in the backend directory with:

```
PORT=3001
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@licensemanager.com
UPLOAD_DIR=uploads
```

## Database Schema

The application uses SQLite with the following main tables:

### Users
- id (INTEGER PRIMARY KEY)
- username (TEXT)
- password (TEXT) - Hashed with bcrypt
- email (TEXT)
- role (TEXT) - 'admin', 'editor', or 'viewer'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Licenses
- id (INTEGER PRIMARY KEY)
- software_name (TEXT)
- vendor (TEXT)
- license_type (TEXT)
- purchase_date (DATE)
- expiration_date (DATE)
- auto_renewal (BOOLEAN)
- contact_name (TEXT)
- contact_email (TEXT)
- license_key (TEXT)
- license_file_path (TEXT)
- notes (TEXT)
- created_by (INTEGER) - Foreign key to users.id
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Audit Logs
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER) - Foreign key to users.id
- username (TEXT)
- action (TEXT) - 'CREATE', 'READ', 'UPDATE', 'DELETE'
- table_name (TEXT)
- record_id (INTEGER)
- details (TEXT) - JSON string of changes
- created_at (TIMESTAMP)

## Learn More

For more information about the full application, refer to the main [README.md](../README.md) file in the project root.
