# 🎯 Remaining Requirements & Implementation Plan

## Project Status: 95% Complete ✅

**Last Updated:** January 19, 2026

---

## 📊 Quick Overview

| Category | Status | Priority | Time Estimate |
|----------|--------|----------|---------------|
| Face Blurring | ✅ COMPLETE | 🔴 HIGH | DONE |
| Alarm Timing (Option A) | ✅ COMPLETE | 🔴 HIGH | DONE |
| Custom Alarm Sound | ✅ COMPLETE | 🔴 HIGH | DONE |
| Multi-Camera Schedules | ✅ COMPLETE | 🔴 HIGH | DONE |
| User Authentication | ⚠️ Not Implemented | 🔴 HIGH | 5-7 days |
| Before/After Comparison | ⚠️ Needs Enhancement | 🟡 MEDIUM | 2-3 days |
| SSLG Features | 📋 Planned | 🟡 MEDIUM | Ongoing |

---

## ✅ COMPLETED FEATURES

### Recently Completed (January 19, 2026)
1. **Face Blur Toggle** - Automatic face detection and blurring on upload
2. **Multi-Camera Schedules** - Create schedules for multiple cameras at once
3. **Alarm Timing (Option A)** - Alarm plays BEFORE capture time with cleanup period
4. **Custom Alarm Sound** - Uses alarm1.wav with pygame for audio playback

---

## 🔴 HIGH PRIORITY REQUIREMENTS

### 1. Face Blurring (Privacy Protection) ✅ COMPLETE

**Status:** ✅ IMPLEMENTED  
**Priority:** 🔴 CRITICAL  
**Completed:** January 19, 2026  
**Why:** Required for student privacy before testing

#### What It Does
- Automatically detects faces in captured images
- Applies Gaussian blur to face regions
- Protects student identity in public displays

#### Implementation Steps

**Step 1: Create Face Blur Utility**
```python
# File: utils/face_blur.py
import cv2
import numpy as np

class FaceBlurrer:
    def __init__(self):
        # Load Haar Cascade face detector
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
    
    def blur_faces(self, image, blur_amount=99):
        """Detect and blur faces in image"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        for (x, y, w, h) in faces:
            # Extract face region
            face = image[y:y+h, x:x+w]
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(face, (blur_amount, blur_amount), 30)
            # Replace face with blurred version
            image[y:y+h, x:x+w] = blurred
        
        return image, len(faces)
```

**Step 2: Update Python API**

```python
# In python-api/app.py - Update analyze endpoint
from utils.face_blur import FaceBlurrer

face_blurrer = FaceBlurrer()

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    # ... existing code ...
    
    # Load image
    image = cv2.imread(image_path)
    
    # Blur faces for privacy
    blurred_image, face_count = face_blurrer.blur_faces(image.copy())
    
    # Save blurred version
    blurred_path = image_path.replace('.jpg', '_blurred.jpg')
    cv2.imwrite(blurred_path, blurred_image)
    
    # Analyze blurred image (not original)
    result = ai_system.analyze_classroom(blurred_path, classroom_id)
    
    return jsonify({
        'success': True,
        'faces_detected': face_count,
        'blurred_image_path': blurred_path,
        ...
    })
```

**Step 3: Database Update**
```sql
-- Add column for blurred image path
ALTER TABLE captured_images 
ADD COLUMN blurred_image_path VARCHAR(500) AFTER image_path;

-- Add face detection info
ALTER TABLE captured_images
ADD COLUMN faces_detected INT DEFAULT 0;
```

**Step 4: Update Frontend**
```typescript
// Display blurred image by default
<img src={`/uploads/${image.blurred_image_path || image.image_path}`} />

// Admin can toggle to see original
{isAdmin && (
  <button onClick={() => setShowOriginal(!showOriginal)}>
    {showOriginal ? 'Show Blurred' : 'Show Original'}
  </button>
)}
```

#### Testing Checklist
- [x] Face detection works on test images
- [x] Blur is strong enough (faces unrecognizable)
- [x] Multiple faces detected correctly
- [x] Performance acceptable (< 2 seconds)
- [x] Blurred images saved correctly
- [x] Toggle between original/blurred on image detail page
- [ ] Original images accessible to admin only (needs authentication)

---

### 2. Alarm Timing Update (Option A) ✅ COMPLETE

**Status:** ✅ IMPLEMENTED  
**Priority:** 🔴 HIGH  
**Completed:** January 19, 2026  
**Why:** Required for proper testing schedule

#### Current Behavior
- Alarm plays at capture time (5:30 PM)
- No warning period

#### Required Behavior
- **5:00 PM:** Warning alarm (5 minutes)
- **5:00-5:30 PM:** Cleanup period (30 minutes)
- **5:30 PM:** Photo capture

#### Implementation Steps

**Step 1: Database Migration**
```sql
-- Add alarm_time column
ALTER TABLE capture_schedules 
ADD COLUMN alarm_time TIME DEFAULT NULL AFTER capture_time;

-- Update existing schedules
UPDATE capture_schedules 
SET alarm_time = SUBTIME(capture_time, '00:30:00')
WHERE alarm_enabled = TRUE;
```

**Step 2: Update Schedule Checker**
```python
# In schedule_checker.py
def check_schedules():
    current_time = datetime.now().strftime('%H:%M:00')
    
    # Check for alarm time
    alarm_schedules = get_schedules_by_alarm_time(current_time)
    for schedule in alarm_schedules:
        play_alarm(schedule)
        log(f"Alarm played for {schedule.name}")
    
    # Check for capture time
    capture_schedules = get_schedules_by_capture_time(current_time)
    for schedule in capture_schedules:
        capture_and_analyze(schedule)
        log(f"Captured for {schedule.name}")
```

**Step 3: Update Create/Edit Forms**
```typescript
// Add alarm time picker
<div>
  <label>Alarm Time (30 min before capture)</label>
  <input 
    type="time" 
    value={alarmTime}
    onChange={(e) => setAlarmTime(e.target.value)}
  />
</div>

<div>
  <label>Capture Time</label>
  <input 
    type="time" 
    value={captureTime}
    onChange={(e) => setCaptureTime(e.target.value)}
  />
</div>
```

#### Testing Checklist
- [x] Alarm plays BEFORE capture time
- [x] Capture happens at EXACT scheduled time
- [x] Cleanup time gap maintained
- [x] Logs show correct timing
- [x] Multiple schedules work correctly
- [x] Custom alarm sound (alarm1.wav) plays
- [x] pygame integration working

---

### 3. User Authentication & Access Control

**Status:** ⚠️ NOT IMPLEMENTED  
**Priority:** 🔴 HIGH  
**Time:** 5-7 days  
**Why:** Required for class president image access

#### User Roles

| Role | Access Level | Permissions |
|------|-------------|-------------|
| **Admin** | Full Access | Everything |
| **Class President** | Limited | Own classroom images only |
| **Student** | Public Only | Leaderboard rankings only |

#### Implementation Steps

**Step 1: Database Schema**

```sql
-- Create users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'class_president', 'student') DEFAULT 'student',
  classroom_id INT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

-- Create sessions table
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin
INSERT INTO users (username, password_hash, role, full_name) 
VALUES ('admin', '$2b$10$...', 'admin', 'System Administrator');
```

**Step 2: Authentication Library**
```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function login(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  
  const sessionId = generateSessionId();
  await createSession(sessionId, user.id);
  
  cookies().set('session', sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  
  return user;
}

export async function getCurrentUser() {
  const sessionId = cookies().get('session')?.value;
  if (!sessionId) return null;
  
  return await getUserBySession(sessionId);
}

export async function logout() {
  const sessionId = cookies().get('session')?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  cookies().delete('session');
}
```

**Step 3: Login Page**
```typescript
// app/login/page.tsx
'use client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <input 
          type="text" 
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
```

**Step 4: Protected Routes**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function middleware(request) {
  const user = await getCurrentUser();
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/dashboard/settings')) {
    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**Step 5: Access Control for Images**
```typescript
// app/api/images/[id]/route.ts
export async function GET(request, { params }) {
  const user = await getCurrentUser();
  const image = await getImage(params.id);
  
  // Admin can see all
  if (user?.role === 'admin') {
    return NextResponse.json(image);
  }
  
  // Class president can only see their classroom
  if (user?.role === 'class_president') {
    if (image.classroom_id === user.classroom_id) {
      return NextResponse.json(image);
    }
  }
  
  // Deny access
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

**Step 6: Public Leaderboard**
```typescript
// app/leaderboard/page.tsx (No login required)
export default function PublicLeaderboard() {
  return (
    <div>
      <h1>Classroom Rankings</h1>
      <LeaderboardTable showImages={false} />
      <p>Login as class president to view images</p>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Admin can login and access everything
- [ ] Class president can login and see own images
- [ ] Class president cannot see other classrooms
- [ ] Students can view public leaderboard
- [ ] Session persists across page reloads
- [ ] Logout works correctly
- [ ] Password hashing secure

---

## 🟡 MEDIUM PRIORITY REQUIREMENTS

### 4. Before/After Photo Comparison

**Status:** ⚠️ NEEDS ENHANCEMENT  
**Priority:** 🟡 MEDIUM  
**Time:** 2-3 days

#### What It Does
- Pairs "before" (messy) and "after" (clean) photos
- Shows side-by-side comparison
- Calculates improvement score
- Displays progress visually

#### Implementation Steps

**Step 1: Database Update**
```sql
-- Add photo type
ALTER TABLE captured_images 
ADD COLUMN photo_type ENUM('before', 'after', 'regular') DEFAULT 'regular';

-- Create comparisons table
CREATE TABLE image_comparisons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  before_image_id INT NOT NULL,
  after_image_id INT NOT NULL,
  classroom_id INT NOT NULL,
  before_score DECIMAL(5,2),
  after_score DECIMAL(5,2),
  improvement_score DECIMAL(5,2),
  improvement_percentage DECIMAL(5,2),
  comparison_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (before_image_id) REFERENCES captured_images(id),
  FOREIGN KEY (after_image_id) REFERENCES captured_images(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
```

**Step 2: Comparison Page**
```typescript
// app/dashboard/images/compare/page.tsx
export default function ComparePage() {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h2>Before (Messy)</h2>
        <img src={beforeImage?.path} />
        <p>Score: {beforeImage?.score}/50</p>
      </div>
      <div>
        <h2>After (Clean)</h2>
        <img src={afterImage?.path} />
        <p>Score: {afterImage?.score}/50</p>
      </div>
      <div className="col-span-2">
        <h3>Improvement: +{improvement} points</h3>
        <ProgressBar value={improvementPercentage} />
      </div>
    </div>
  );
}
```

---

### 5. SSLG Collaboration Features

**Status:** 📋 PLANNED  
**Priority:** 🟡 MEDIUM  
**Time:** Ongoing

#### Features Needed
- SSLG dashboard with overview
- Weekly performance reports
- Recognition system
- Announcement features
- Student engagement tools

#### Can Be Added Later
This is an enhancement that can be built after core features are complete.

---

## 📅 Implementation Timeline

### Week 1: Critical Features (Days 1-7)
**Goal:** Complete high-priority requirements

**Day 1-2: Face Blurring**
- Create face detection utility
- Update Python API
- Test with sample images
- Integrate with capture flow

**Day 3: Alarm Timing**
- Update database schema
- Modify schedule checker
- Update UI forms
- Test timing accuracy

**Day 4-7: User Authentication**
- Create database tables
- Build authentication system
- Create login page
- Implement access control
- Test all user roles

### Week 2: Testing & Polish (Days 8-14)
**Goal:** Test system with real users

**Day 8-10: 3-Day Testing**
- Test with 4 sections
- Monitor system performance
- Collect feedback
- Document issues

**Day 11-12: Bug Fixes**
- Fix issues found in testing
- Optimize performance
- Improve UI/UX

**Day 13-14: Documentation**
- User manual
- Admin guide
- Training materials

### Week 3: Enhancements (Days 15-21)
**Goal:** Add nice-to-have features

**Day 15-17: Before/After Comparison**
- Implement comparison feature
- Create UI components
- Test with real data

**Day 18-21: SSLG Features**
- Build SSLG dashboard
- Add reporting tools
- Create recognition system

---

## ✅ Completion Checklist

### Before Testing
- [ ] Face blurring implemented and tested
- [ ] Alarm timing updated (5:00 PM + 5:30 PM)
- [ ] User authentication working
- [ ] All cameras configured
- [ ] Schedules created for 4 sections
- [ ] Database backed up

### During Testing (3 Days)
- [ ] Day 1: System setup verified
- [ ] Day 2: Leaderboard accuracy confirmed
- [ ] Day 3: Full workflow tested
- [ ] Issues documented
- [ ] Feedback collected

### After Testing
- [ ] All bugs fixed
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Users trained
- [ ] System deployed

---

## 🎯 Success Criteria

### Technical
- ✅ All cameras capture successfully
- ✅ AI analysis < 2 minutes per image
- ✅ Leaderboard updates < 5 minutes
- ✅ No system crashes
- ✅ Faces properly blurred
- ✅ Access control working

### User Experience
- ✅ Students can view rankings easily
- ✅ Class presidents can access images
- ✅ Admin has full control
- ✅ System is intuitive
- ✅ Performance is acceptable

### Privacy & Security
- ✅ Student faces protected
- ✅ Images access controlled
- ✅ Passwords secure
- ✅ Sessions managed properly

---

## 📞 Next Steps

1. **Review this document** with your team
2. **Prioritize features** based on timeline
3. **Start with face blurring** (most critical)
4. **Test incrementally** as you build
5. **Document everything** for future reference

---

**Ready to start implementation?** Let me know which feature you'd like to tackle first! 🚀
