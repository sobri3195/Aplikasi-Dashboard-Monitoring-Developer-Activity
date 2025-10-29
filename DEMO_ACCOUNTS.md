# Demo Accounts and Test Data

This document provides information about the demo accounts and test data available in the DevMonitor Dashboard system.

## Available Demo Accounts

The system includes 6 pre-configured demo accounts for testing different user roles and scenarios:

### Admin Accounts

1. **Primary Admin**
   - Email: `admin@devmonitor.com`
   - Password: `admin123456`
   - Role: Admin
   - Description: Primary administrator account with full access

2. **Alex Johnson**
   - Email: `alex.johnson@example.com`
   - Password: `alex123`
   - Role: Admin
   - Description: Secondary admin account for testing multiple admin scenarios

### Developer Accounts

3. **Developer User**
   - Email: `developer@devmonitor.com`
   - Password: `developer123`
   - Role: Developer
   - Description: Primary developer account with sample device and activities

4. **John Doe**
   - Email: `john.doe@example.com`
   - Password: `john123`
   - Role: Developer
   - Description: Developer with MacBook Pro device and API development activities

5. **Jane Smith**
   - Email: `jane.smith@example.com`
   - Password: `jane123`
   - Role: Developer
   - Description: Developer with Dell XPS device and frontend development activities

### Viewer Account

6. **Viewer User**
   - Email: `viewer@devmonitor.com`
   - Password: `viewer123`
   - Role: Viewer
   - Description: Read-only account for monitoring activities

## Demo Data Included

### Devices

- **Developer Laptop** (Ubuntu 22.04 LTS, Intel Core i7)
- **John MacBook Pro** (macOS Ventura, Apple M1 Pro)
- **Jane Dell XPS** (Windows 11 Pro, Intel Core i9)

All devices are pre-approved and authorized.

### Activities

The seed data includes various git activities:
- Git Clone operations
- Git Pull operations
- Git Push operations
- Git Commit operations
- Login/Logout activities

Activities span across multiple repositories:
- sample-project
- backend-api
- frontend-app

### Repositories

- **sample-project**: Sample repository with secure status

## Seeding the Database

To populate your database with demo accounts and test data:

```bash
cd backend
npm run db:seed
```

This will create all users, devices, activities, and other test data.

## Login Page

The login page (`/login`) displays all available demo accounts directly on the page, making it easy to test the application without needing to remember credentials.

## Security Note

⚠️ **Important**: These are demo accounts intended for testing and development purposes only. 

- Never use these credentials in a production environment
- Always change default passwords in production
- Delete or disable these accounts before deploying to production
- Use strong, unique passwords for production accounts

## Usage Tips

1. **Testing Different Roles**: Use different account types to test role-based access control
2. **Multi-user Scenarios**: Login with different accounts in different browsers to test real-time updates
3. **Activity Monitoring**: Developer accounts have pre-populated activities for testing the monitoring dashboard
4. **Device Management**: Each developer has associated devices for testing device authorization workflows

## Resetting Demo Data

To reset the database and reseed with fresh demo data:

```bash
cd backend
npm run migrate
npm run db:seed
```

This will drop existing data and recreate the database schema with fresh demo data.
