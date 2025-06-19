# License Renewal Manager - Frontend

This is the frontend application for the Software License Renewal Manager, built with React, TypeScript, and Material-UI.

## Features

- Interactive dashboard with license statistics
- License management interface (create, view, edit, delete)
- Role-based access control
- Search and filter capabilities
- Responsive design for mobile and desktop
- Form validation
- File upload for license documents
- JWT authentication

## Component Structure

The application is organized into the following main components:

### Authentication
- `Login.tsx` - User login form
- `PrivateRoute.tsx` - Route protection based on authentication and roles
- `AuthContext.tsx` - Authentication state management

### Layout
- `Layout.tsx` - Main layout wrapper with navbar and footer
- `Navbar.tsx` - Navigation bar with links and user menu

### Dashboard
- `Dashboard.tsx` - Main dashboard with statistics and widgets
- Statistics cards for total licenses, expiring licenses, and overdue licenses
- Recent activity log
- Upcoming renewals list

### License Management
- `LicenseList.tsx` - Table of all licenses with search and filter
- `LicenseForm.tsx` - Form for creating and editing licenses
- License detail view

### Common Components
- `NotFound.tsx` - 404 page
- `Unauthorized.tsx` - Access denied page

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Environment Configuration

The frontend uses environment variables for configuration. Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_NAME=License Renewal Manager
```

## API Integration

The frontend communicates with the backend through a RESTful API. The main API services are:

- `api.ts` - Base API configuration with Axios
- `authApi` - Authentication-related API calls
- `licenseApi` - License management API calls

## User Guide

### Dashboard

The dashboard provides an overview of your license status:
- Total number of licenses
- Licenses expiring within 30 days
- Overdue licenses
- Recent activity log
- Upcoming renewals

### License Management

To create a new license:
1. Click "Add License" button
2. Fill in the required fields (Software Name, Vendor, License Type, etc.)
3. Upload license file (optional)
4. Click "Create License"

To edit a license:
1. Click the edit icon next to the license in the list
2. Modify the fields as needed
3. Click "Update License"

To delete a license (Admin only):
1. Click the delete icon next to the license in the list
2. Confirm deletion

### Search and Filter

The license list includes search and filter capabilities:
- Search by software name or vendor
- Filter by expiration date range
- Filter by license type
- Filter by contact

## Learn More

For more information about the full application, refer to the main [README.md](../README.md) file in the project root.
