# Software License Renewal Manager

A web-based application to track and manage software license renewals for an organization. It stores license metadata, renewal dates, responsible contacts, and alerts users when action is required.

## Features

- CRUD operations for software license records
- Role-based access control (Admin, Editor, Viewer)
- Dashboard with license statistics and upcoming renewals
- Email notifications for licenses expiring soon
- Search and filter capabilities
- File uploads for license documents
- Audit logging for all user actions
- Auto-renewal tracking
- Expiration date monitoring
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API requests
- Context API for state management

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- RESTful API endpoints
- Cron jobs for scheduled tasks

## Dashboard Features

The dashboard provides a comprehensive overview of your license status:

- Total number of licenses in the system
- Licenses expiring within the next 30 days
- Overdue licenses (already expired)
- Recent activity log showing user actions
- No upcoming renewals indicator when applicable

## License Management

The application allows you to manage licenses with the following details:

- Software Name
- Vendor
- License Type (Per User, Per Device, Site License, Subscription, Perpetual, etc.)
- Purchase Date
- Expiration Date
- Auto-Renewal status
- Contact information (Name and Email)
- License Key/File (with file upload capability)
- Notes/Comments

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/license-renewal-manager.git
cd license-renewal-manager
```

2. Set up the backend
```
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
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

4. Run the database migrations
```
npm run db:migrate
```

5. Seed the database with initial data
```
npm run db:seed
```

6. Set up the frontend
```
cd ../frontend
npm install
```

7. Start the application
```
# In the backend directory
npm start
# or for development with auto-restart:
npm run dev

# In the frontend directory (in a separate terminal)
npm start
```

8. Access the application at http://localhost:3000

## Default Login Credentials

- Admin: username: `admin`, password: `admin123`
- Editor: username: `editor`, password: `editor123`
- Viewer: username: `viewer`, password: `viewer123`

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

## User Roles and Permissions

### Admin
- Full access to all features
- Can manage users
- Can delete licenses
- Access to admin panel

### Editor
- Can create, read, update licenses
- Cannot delete licenses
- Cannot manage users

### Viewer
- Read-only access to licenses and dashboard
- Cannot modify any data

## License

This project is licensed under the MIT License - see the LICENSE file for details.
