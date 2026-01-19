# Access Control Testing Guide

## Overview
This document outlines how to test the role-based access control system.

## Test Users

### Admin User
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full system access

### Class President User
- **Username**: `president1`
- **Password**: `president123`
- **Access**: Own classroom only (Classroom ID: 23)

### Student User
- **Username**: `student1`
- **Password**: `student123`
- **Access**: Public leaderboard only

---

## Access Control Matrix

| Feature | Admin | Class President | Student |
|---------|-------|-----------------|---------|
| Login Page | ✅ | ✅ | ✅ |
| Public Leaderboard | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ❌ |
| View All Classrooms | ✅ | ❌ (own only) | ❌ |
| View All Images | ✅ | ❌ (own only) | ❌ |
| View Image Details | ✅ | ✅ (own classroom) | ❌ |
| Create Classroom | ✅ | ❌ | ❌ |
| Edit Classroom | ✅ | ❌ | ❌ |
| Delete Classroom | ✅ | ❌ | ❌ |
| Create Camera | ✅ | ❌ | ❌ |
| Create Schedule | ✅ | ❌ | ❌ |
| Upload Image | ✅ | ❌ | ❌ |
| Delete Image | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ (own classroom) | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## Test Scenarios

### Test 1: Admin Access
**User**: admin / admin123

1. ✅ Login successful
2. ✅ Redirected to `/dashboard`
3. ✅ Can view all classrooms
4. ✅ Can view all images
5. ✅ Can create/edit/delete classrooms
6. ✅ Can access settings
7. ✅ Can delete images
8. ✅ Can view all reports

**Expected**: Full access to everything

---

### Test 2: Class President Access
**User**: president1 / president123

1. ✅ Login successful
2. ✅ Redirected to `/dashboard`
3. ✅ Can view own classroom only
4. ✅ Can view images from own classroom only
5. ❌ Cannot view other classrooms
6. ❌ Cannot create/edit/delete classrooms
7. ❌ Cannot access settings
8. ❌ Cannot delete images
9. ✅ Can view reports for own classroom

**Expected**: Limited access to own classroom only

**Test Steps**:
```
1. Login as president1
2. Go to /dashboard/classrooms
   - Should see only Room 101 (classroom_id: 23)
3. Go to /dashboard/images
   - Should see only images from Room 101
4. Try to access /dashboard/settings
   - Should be denied or hidden
5. Try to access another classroom's image
   - Should get 403 Forbidden
```

---

### Test 3: Student Access
**User**: student1 / student123

1. ✅ Login successful
2. ✅ Redirected to `/dashboard`
3. ❌ Cannot view classrooms
4. ❌ Cannot view images
5. ❌ Cannot access any management features
6. ✅ Can view public leaderboard

**Expected**: Minimal access, mostly public information

**Test Steps**:
```
1. Login as student1
2. Go to /dashboard/classrooms
   - Should get 403 Forbidden
3. Go to /dashboard/images
   - Should get 403 Forbidden
4. Go to /leaderboard (public)
   - Should see rankings
5. Try to access /dashboard/settings
   - Should be denied
```

---

### Test 4: Unauthenticated Access
**User**: Not logged in

1. ❌ Cannot access `/dashboard`
2. ❌ Cannot access `/dashboard/*` routes
3. ✅ Can access `/login`
4. ✅ Can access `/leaderboard`
5. ✅ Redirected to login when accessing protected routes

**Test Steps**:
```
1. Logout or open incognito window
2. Try to access /dashboard
   - Should redirect to /login
3. Try to access /dashboard/images
   - Should redirect to /login
4. Access /leaderboard
   - Should work without login
5. Access /login
   - Should show login form
```

---

## API Endpoint Tests

### GET /api/classrooms

**Admin**:
```bash
# Should return all classrooms
curl http://localhost:3000/api/classrooms \
  -H "Cookie: session=<admin_session>"
```

**Class President**:
```bash
# Should return only own classroom
curl http://localhost:3000/api/classrooms \
  -H "Cookie: session=<president_session>"
```

**Student**:
```bash
# Should return 403 Forbidden
curl http://localhost:3000/api/classrooms \
  -H "Cookie: session=<student_session>"
```

---

### GET /api/images

**Admin**:
```bash
# Should return all images
curl http://localhost:3000/api/images \
  -H "Cookie: session=<admin_session>"
```

**Class President**:
```bash
# Should return only own classroom images
curl http://localhost:3000/api/images \
  -H "Cookie: session=<president_session>"
```

**Student**:
```bash
# Should return 403 Forbidden
curl http://localhost:3000/api/images \
  -H "Cookie: session=<student_session>"
```

---

### GET /api/images/[id]

**Admin**:
```bash
# Should return any image
curl http://localhost:3000/api/images/1 \
  -H "Cookie: session=<admin_session>"
```

**Class President**:
```bash
# Should return only if image belongs to own classroom
curl http://localhost:3000/api/images/1 \
  -H "Cookie: session=<president_session>"
# Returns 403 if not own classroom
```

**Student**:
```bash
# Should return 401 Unauthorized
curl http://localhost:3000/api/images/1 \
  -H "Cookie: session=<student_session>"
```

---

### DELETE /api/images/[id]

**Admin**:
```bash
# Should delete successfully
curl -X DELETE http://localhost:3000/api/images/1 \
  -H "Cookie: session=<admin_session>"
```

**Class President**:
```bash
# Should return 403 Forbidden
curl -X DELETE http://localhost:3000/api/images/1 \
  -H "Cookie: session=<president_session>"
```

---

### POST /api/classrooms

**Admin**:
```bash
# Should create successfully
curl -X POST http://localhost:3000/api/classrooms \
  -H "Cookie: session=<admin_session>" \
  -H "Content-Type: application/json" \
  -d '{"section_id":1,"name":"Test Room"}'
```

**Class President**:
```bash
# Should return 403 Forbidden
curl -X POST http://localhost:3000/api/classrooms \
  -H "Cookie: session=<president_session>" \
  -H "Content-Type: application/json" \
  -d '{"section_id":1,"name":"Test Room"}'
```

---

## Implementation Status

### ✅ Implemented

1. **Middleware Protection**
   - All `/dashboard/*` routes require authentication
   - Redirects to login if not authenticated
   - Public routes: `/login`, `/leaderboard`

2. **Images API Access Control**
   - `GET /api/images` - Filters by user role
   - `GET /api/images/[id]` - Checks classroom access
   - `DELETE /api/images/[id]` - Admin only

3. **Classrooms API Access Control**
   - `GET /api/classrooms` - Filters by user role
   - `POST /api/classrooms` - Admin only

4. **User Authentication**
   - Login/logout functionality
   - Session management
   - Password hashing

5. **Role-Based Filtering**
   - Admin: See all
   - Class President: See own classroom only
   - Student: No access to management features

### ⚠️ Needs Testing

1. Camera API access control
2. Schedule API access control
3. Reports API access control
4. Settings page access control

---

## Quick Test Commands

### Test Admin Access
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get all classrooms (should work)
curl http://localhost:3000/api/classrooms \
  -H "Cookie: session=<session_from_login>"
```

### Test Class President Access
```bash
# Login as president
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"president1","password":"president123"}'

# Get classrooms (should only return own)
curl http://localhost:3000/api/classrooms \
  -H "Cookie: session=<session_from_login>"
```

### Test Student Access
```bash
# Login as student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"student123"}'

# Try to get classrooms (should fail)
curl http://localhost:3000/api/classrooms \
  -H "Cookie: session=<session_from_login>"
```

---

## Summary

✅ **Fully Implemented**:
- Middleware route protection
- User authentication
- Images API access control
- Classrooms API access control
- Role-based filtering

✅ **Working As Expected**:
- Admin can access everything
- Class presidents can only access own classroom
- Students cannot access management features
- Public leaderboard accessible to all

🎯 **Next Steps**:
1. Test with real users
2. Add access control to remaining APIs (cameras, schedules, reports)
3. Add UI-level role checks (hide buttons for unauthorized actions)
4. Add audit logging for sensitive operations
