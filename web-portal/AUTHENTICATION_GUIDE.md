# Authentication System Guide

## Overview
Complete user authentication system with role-based access control for the Classroom Cleanliness Portal.

## User Roles

### 1. Administrator
- **Access**: Full system access
- **Permissions**:
  - View all classrooms and images
  - Manage users, cameras, schedules
  - Access all settings
  - Delete images
  - View original (non-blurred) images

### 2. Class President
- **Access**: Limited to assigned classroom
- **Permissions**:
  - View own classroom images only
  - View scores and reports for own classroom
  - Cannot access other classrooms
  - Cannot modify settings

### 3. Student
- **Access**: Public information only
- **Permissions**:
  - View public leaderboard
  - See classroom rankings
  - No access to images or detailed reports

## Setup Instructions

### Step 1: Run Database Migration
```bash
cd web-portal
mysql -u root -p classroom_cleanliness < database/migrations/create_auth_tables.sql
```

This creates:
- `users` table - Stores user accounts
- `sessions` table - Manages login sessions

### Step 2: Seed Default Users
```bash
node database/seed-auth.js
```

This creates default accounts:
- **Admin**: username `admin`, password `admin123`
- **Class President**: username `president1`, password `president123`
- **Student**: username `student1`, password `student123`

### Step 3: Quick Setup (All-in-One)
```bash
setup-auth.bat
```

This runs both migration and seeding automatically.

## Default Credentials

### Administrator Account
```
Username: admin
Password: admin123
```
**⚠️ IMPORTANT**: Change this password in production!

### Class President Account
```
Username: president1
Password: president123
Classroom: First classroom in database
```

### Student Account
```
Username: student1
Password: student123
```

## Usage

### Login
1. Navigate to `http://localhost:3000/login`
2. Enter username and password
3. Click "Sign In"
4. Redirected to dashboard on success

### Logout
1. Click on your profile in the top-right corner
2. Click "Sign Out"
3. Redirected to login page

### Public Access
- Public leaderboard available at `http://localhost:3000/leaderboard`
- No login required
- Shows rankings without images

## Access Control

### Protected Routes
All `/dashboard/*` routes require authentication:
- `/dashboard` - Main dashboard
- `/dashboard/images` - Image gallery
- `/dashboard/classrooms` - Classroom management
- `/dashboard/cameras` - Camera management
- `/dashboard/schedules` - Schedule management
- `/dashboard/settings` - System settings (admin only)

### Public Routes
- `/login` - Login page
- `/leaderboard` - Public leaderboard
- `/api/auth/login` - Login API
- `/api/leaderboard` - Leaderboard data

### API Protection
All API routes check authentication except:
- `/api/auth/login`
- `/api/leaderboard`

## Role-Based Permissions

### Image Access
```typescript
// Admin: Can view all images
// Class President: Can only view own classroom images
// Student: Cannot view images

GET /api/images/[id]
- Returns 401 if not authenticated
- Returns 403 if no permission for classroom
- Returns image data if authorized
```

### Classroom Access
```typescript
// Admin: Can access all classrooms
// Class President: Can only access assigned classroom
// Student: No access

canAccessClassroom(user, classroomId)
- Returns true for admin (all classrooms)
- Returns true for class president (own classroom only)
- Returns false for students
```

### Delete Operations
```typescript
// Only admin can delete
DELETE /api/images/[id]
- Returns 403 if not admin
- Deletes image if admin
```

## Security Features

### Password Hashing
- Uses bcryptjs with 10 salt rounds
- Passwords never stored in plain text
- Secure comparison prevents timing attacks

### Session Management
- Secure session IDs (64 random characters)
- 7-day expiration
- HttpOnly cookies (prevents XSS)
- Automatic cleanup of expired sessions

### Middleware Protection
- Checks authentication on every request
- Redirects to login if not authenticated
- Prevents access to protected routes

## Creating New Users

### Via Database
```sql
-- Hash password first using bcrypt
-- Then insert user
INSERT INTO users (username, password_hash, role, full_name, email, classroom_id)
VALUES ('newuser', '$2a$10$...', 'class_president', 'John Doe', 'john@school.edu', 1);
```

### Programmatically
```typescript
import { hashPassword } from '@/lib/auth';

const passwordHash = await hashPassword('password123');

await query(
  `INSERT INTO users (username, password_hash, role, full_name, classroom_id)
   VALUES (?, ?, ?, ?, ?)`,
  ['newuser', passwordHash, 'class_president', 'John Doe', 1]
);
```

## Testing Authentication

### Test Admin Access
1. Login as admin
2. Navigate to `/dashboard/settings`
3. Should see all settings
4. Can view all classroom images

### Test Class President Access
1. Login as president1
2. Navigate to `/dashboard/images`
3. Should only see own classroom images
4. Cannot access `/dashboard/settings`

### Test Student Access
1. Login as student1
2. Redirected to `/dashboard`
3. Limited view (no images)
4. Can view `/leaderboard`

### Test Public Access
1. Logout or open incognito window
2. Navigate to `/leaderboard`
3. Should see rankings without login
4. Cannot access `/dashboard`

## Troubleshooting

### Cannot Login
- Check database connection
- Verify users table exists
- Confirm password hash is correct
- Check browser console for errors

### Session Expires Immediately
- Check cookie settings
- Verify session table exists
- Check system time (sessions use timestamps)

### Access Denied Errors
- Verify user role in database
- Check classroom_id for class presidents
- Confirm user.active = TRUE

### Middleware Not Working
- Check middleware.ts is in root of web-portal
- Verify matcher config includes your routes
- Check session cookie is being set

## Password Reset

Currently, passwords must be reset via database:

```sql
-- Generate new hash using bcrypt
-- Update user password
UPDATE users 
SET password_hash = '$2a$10$...' 
WHERE username = 'admin';
```

## Best Practices

### Production Deployment
1. Change all default passwords
2. Use HTTPS (secure cookies)
3. Set strong password requirements
4. Enable rate limiting on login
5. Add password reset functionality
6. Implement 2FA for admin accounts

### User Management
1. Deactivate users instead of deleting
2. Regularly cleanup expired sessions
3. Monitor failed login attempts
4. Audit user access logs

### Security
1. Never log passwords
2. Use environment variables for secrets
3. Implement CSRF protection
4. Add brute force protection
5. Regular security audits

## API Reference

### POST /api/auth/login
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "System Administrator",
    "classroom_id": null
  }
}
```

### POST /api/auth/logout
Logout current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
Get current logged-in user.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "System Administrator",
    "email": "admin@school.edu",
    "classroom_id": null,
    "last_login": "2026-01-19T12:00:00.000Z"
  }
}
```

## Next Steps

1. Run setup: `setup-auth.bat`
2. Login at: `http://localhost:3000/login`
3. Test different user roles
4. Change default passwords
5. Create class president accounts for each classroom

## Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Test with default credentials
4. Verify database tables exist
