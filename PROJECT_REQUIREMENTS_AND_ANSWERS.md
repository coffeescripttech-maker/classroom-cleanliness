# 📋 Project Requirements & Implementation Answers

## Classroom Cleanliness Monitoring System - Q&A Documentation

---

## 1. ⭐ Rating Criteria (Fair, Good, Excellent)

### Current Scoring System

**Total Score Range:** 0-50 points (5 metrics × 10 points each)

**Rating Categories:**

| Rating | Score Range | Percentage | Description |
|--------|-------------|------------|-------------|
| **Excellent** | 45-50 | 90-100% | Outstanding cleanliness, minimal issues |
| **Good** | 35-44 | 70-89% | Above average, some minor issues |
| **Fair** | 25-34 | 50-69% | Acceptable but needs improvement |
| **Poor** | 0-24 | 0-49% | Below standards, requires immediate attention |

### Passing Score

**Minimum Passing Score:** **25/50 (50%)**
- Scores below 25 are considered **failing** and require immediate action
- Scores of 25-34 are **passing but need improvement**
- Scores of 35+ are **good to excellent**

### Detailed Metrics Breakdown

Each metric is scored from 0-10:

1. **Floor Cleanliness (0-10)**
   - 9-10: Spotless, no trash or dirt
   - 7-8: Clean with minor dust
   - 5-6: Some visible dirt or trash
   - 3-4: Noticeably dirty
   - 0-2: Very dirty, needs immediate cleaning

2. **Furniture Orderliness (0-10)**
   - 9-10: All chairs/desks properly arranged
   - 7-8: Mostly organized, few items out of place
   - 5-6: Some disorganization
   - 3-4: Many items out of place
   - 0-2: Chaotic arrangement

3. **Trash Bin Condition (0-10)**
   - 9-10: Empty or minimal trash, properly placed
   - 7-8: Some trash but not overflowing
   - 5-6: Nearly full
   - 3-4: Overflowing
   - 0-2: Trash scattered around bin

4. **Wall/Board Cleanliness (0-10)**
   - 9-10: Clean, no marks or clutter
   - 7-8: Minor marks or minimal clutter
   - 5-6: Some marks or moderate clutter
   - 3-4: Noticeable marks or clutter
   - 0-2: Very dirty or cluttered

5. **Clutter Detection (0-10)**
   - 9-10: No clutter, everything in place
   - 7-8: Minimal clutter
   - 5-6: Some clutter present
   - 3-4: Noticeable clutter
   - 0-2: Excessive clutter

### Example Scores

**Example 1: Excellent Classroom**
- Floor: 9.5, Furniture: 9.0, Trash: 9.5, Wall: 8.5, Clutter: 9.0
- **Total: 45.5/50 (91%) - Excellent** ✅

**Example 2: Good Classroom**
- Floor: 8.0, Furniture: 7.5, Trash: 8.0, Wall: 7.0, Clutter: 8.0
- **Total: 38.5/50 (77%) - Good** ✅

**Example 3: Fair Classroom (Passing)**
- Floor: 6.0, Furniture: 5.5, Trash: 6.5, Wall: 5.0, Clutter: 6.0
- **Total: 29.0/50 (58%) - Fair** ⚠️

**Example 4: Poor Classroom (Failing)**
- Floor: 4.0, Furniture: 4.5, Trash: 5.0, Wall: 3.5, Clutter: 4.0
- **Total: 21.0/50 (42%) - Poor** ❌

---

## 2. 🔒 Student Face Blurring in Photos

### Current Status: ⚠️ NOT YET IMPLEMENTED

### Proposed Implementation

**Technology:** OpenCV Face Detection + Gaussian Blur

**Process:**
1. Capture image from RTSP camera
2. Detect faces using Haar Cascade or DNN face detector
3. Apply Gaussian blur to detected face regions
4. Save blurred image for analysis
5. Store both original (admin only) and blurred (public) versions

### Implementation Plan

**Files to Create:**
- `utils/face_blur.py` - Face detection and blurring logic
- Update `python-api/app.py` - Add face blurring before saving

**Code Example:**
```python
import cv2

def blur_faces(image):
    # Load face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Detect faces
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    # Blur each face
    for (x, y, w, h) in faces:
        face_region = image[y:y+h, x:x+w]
        blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
        image[y:y+h, x:x+w] = blurred_face
    
    return image
```

**Privacy Levels:**
- **Public View:** Blurred faces (students, teachers)
- **Admin View:** Original unblurred images (for verification)
- **Class President:** Blurred images only

**Estimated Implementation Time:** 1-2 days

---

## 3. ⏰ Alarm Schedule: 5:00 PM Warning, 5:30 PM Capture

### Current Status: ✅ PARTIALLY IMPLEMENTED (Needs Update)

### Proposed Schedule Configuration

**Timeline:**
- **5:00 PM** - Warning alarm (5 minutes duration)
- **5:00-5:30 PM** - Cleanup period (30 minutes)
- **5:30 PM** - Photo capture

### Implementation

**Schedule Configuration:**
```javascript
{
  name: "Afternoon Cleanup & Capture",
  capture_time: "17:30:00",  // 5:30 PM
  alarm_enabled: true,
  alarm_time: "17:00:00",  // 5:00 PM (30 min before)
  alarm_duration_seconds: 300,  // 5 minutes
  pre_capture_delay_seconds: 1800,  // 30 minutes (from alarm to capture)
  days_of_week: "1,2,3,4,5"  // Monday-Friday
}
```

**Database Update Needed:**
Add `alarm_time` column to `capture_schedules` table:
```sql
ALTER TABLE capture_schedules 
ADD COLUMN alarm_time TIME DEFAULT NULL AFTER capture_time;
```

**Schedule Checker Logic:**
```python
# At 5:00 PM - Play warning alarm
if current_time == schedule.alarm_time:
    play_alarm(duration=300)  # 5 minutes
    log("Warning alarm played - 30 minutes until capture")

# At 5:30 PM - Capture photo
if current_time == schedule.capture_time:
    capture_image()
    analyze_with_ai()
    update_leaderboard()
```

**Estimated Implementation Time:** 2-3 hours

---

## 4. 🧪 Testing Duration: 3 Days, 4 Sections

### Testing Plan

**Duration:** 3 consecutive school days
**Scope:** 4 different sections

**Test Schedule:**

| Day | Sections | Capture Times | Focus |
|-----|----------|---------------|-------|
| **Day 1** | Grade 7-A, 7-B | 5:30 PM | System setup, initial testing |
| **Day 2** | Grade 8-A, 8-B | 5:30 PM | Leaderboard accuracy, notifications |
| **Day 3** | All 4 sections | 5:30 PM | Full workflow, before/after comparison |

**Test Checklist:**

**Day 1: Setup & Initial Testing**
- [ ] Install cameras in 4 classrooms
- [ ] Configure RTSP connections
- [ ] Test alarm at 5:00 PM
- [ ] Verify photo capture at 5:30 PM
- [ ] Check AI analysis accuracy
- [ ] Verify scores are saved to database

**Day 2: Leaderboard & Notifications**
- [ ] Verify leaderboard updates automatically
- [ ] Test ranking accuracy
- [ ] Check score calculations
- [ ] Verify students can view rankings
- [ ] Test class president image access

**Day 3: Full Workflow**
- [ ] Capture "before" photos (messy classrooms)
- [ ] Students clean classrooms
- [ ] Capture "after" photos (clean classrooms)
- [ ] Compare before/after scores
- [ ] Verify improvement tracking
- [ ] Generate reports

**Success Criteria:**
- ✅ All 4 cameras capture successfully
- ✅ AI analysis completes within 2 minutes
- ✅ Leaderboard updates within 5 minutes
- ✅ No system crashes or errors
- ✅ Students can access rankings
- ✅ Class presidents can view images

---

## 5. 📸 Before-and-After Photos

### Current Status: ⚠️ NEEDS ENHANCEMENT

### Implementation Plan

**Workflow:**

1. **Before Photo (Messy Classroom)**
   - Captured at 5:30 PM (end of day)
   - Shows classroom in its current state
   - Tagged as "before" in database

2. **After Photo (Clean Classroom)**
   - Captured next day at 5:30 PM
   - Shows classroom after cleanup
   - Tagged as "after" in database

3. **Comparison**
   - System automatically pairs before/after photos
   - Calculates improvement score
   - Displays side-by-side comparison

**Database Schema:**

```sql
-- Add photo type column
ALTER TABLE captured_images 
ADD COLUMN photo_type ENUM('before', 'after', 'regular') DEFAULT 'regular';

-- Add comparison table
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

**UI Features:**

**Comparison Page:** `/dashboard/images/compare`
- Side-by-side image viewer
- Slider to compare before/after
- Score difference display
- Improvement percentage
- Detected objects comparison

**Example Display:**
```
Before (Messy)          After (Clean)
Score: 28/50           Score: 42/50
Rating: Fair           Rating: Good

Improvement: +14 points (+50%)
```

**Estimated Implementation Time:** 2-3 days

---

## 6. 📊 System Flowchart

### Main System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM START                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Schedule Checker (Runs Every Minute)                       │
│  - Check current time                                        │
│  - Match with active schedules                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
              ┌──────┴──────┐
              │             │
              ▼             ▼
    ┌─────────────┐   ┌─────────────┐
    │  5:00 PM    │   │  5:30 PM    │
    │  Alarm      │   │  Capture    │
    └──────┬──────┘   └──────┬──────┘
           │                 │
           ▼                 ▼
    ┌─────────────┐   ┌─────────────┐
    │ Play Alarm  │   │ Capture     │
    │ 5 minutes   │   │ from RTSP   │
    └──────┬──────┘   └──────┬──────┘
           │                 │
           ▼                 ▼
    ┌─────────────┐   ┌─────────────┐
    │ Students    │   │ Save Image  │
    │ Clean Room  │   │ to Database │
    └─────────────┘   └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Blur Faces  │
                      │ (Privacy)   │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ AI Analysis │
                      │ (OWL-ViT)   │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Calculate   │
                      │ Scores      │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Save Scores │
                      │ to Database │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Update      │
                      │ Leaderboard │
                      └──────┬──────┘
                             │
                             ▼
                      ┌─────────────┐
                      │ Students    │
                      │ View Ranks  │
                      └─────────────┘
```

### User Access Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACCESS                               │
└────────────────────┬────────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
    ┌─────────────┐   ┌─────────────┐
    │   ADMIN     │   │  STUDENTS   │
    │  (Teacher)  │   │             │
    └──────┬──────┘   └──────┬──────┘
           │                 │
           ▼                 ▼
    ┌─────────────┐   ┌─────────────┐
    │ Full Access │   │ View Only   │
    │ - Dashboard │   │ - Rankings  │
    │ - Images    │   │ - Scores    │
    │ - Schedules │   │             │
    │ - Reports   │   │             │
    │ - Settings  │   │             │
    └─────────────┘   └──────┬──────┘
                             │
                      ┌──────┴──────┐
                      │             │
                      ▼             ▼
              ┌─────────────┐ ┌─────────────┐
              │ Regular     │ │ Class       │
              │ Student     │ │ President   │
              └──────┬──────┘ └──────┬──────┘
                     │               │
                     ▼               ▼
              ┌─────────────┐ ┌─────────────┐
              │ View        │ │ View        │
              │ Rankings    │ │ Rankings +  │
              │ Only        │ │ Images      │
              └─────────────┘ └─────────────┘
```

**Estimated Time to Create Detailed Flowchart:** 2-3 hours

---

## 7. 💰 Server Hosting & Monthly Costs

### Current Setup: LOCAL HOSTING (No Monthly Cost)

**Current Configuration:**
- **Server:** Your local computer
- **Database:** MySQL (local)
- **Web Server:** Next.js (localhost:3000)
- **Python API:** Flask (localhost:5000)
- **Cost:** **FREE** (no monthly fees)

### Deployment Options & Costs

#### Option 1: School Server (Recommended)
**Cost:** **FREE**
- Host on school's existing server
- Accessible within school network
- No internet required
- No monthly fees

**Requirements:**
- Windows/Linux server
- 4GB RAM minimum
- 50GB storage
- MySQL database

#### Option 2: Cloud Hosting (If Internet Access Needed)

**A. Vercel (Frontend) + Railway (Backend)**
- **Vercel:** FREE for Next.js
- **Railway:** $5-10/month for database + Python API
- **Total:** **$5-10/month**

**B. DigitalOcean Droplet**
- **Basic Droplet:** $6/month (1GB RAM)
- **Recommended:** $12/month (2GB RAM)
- **Total:** **$12/month**

**C. AWS Free Tier (First Year)**
- **EC2 Instance:** FREE for 12 months
- **RDS Database:** FREE for 12 months
- **After 1 year:** ~$20-30/month
- **Total:** **FREE (Year 1), $20-30/month (After)**

#### Option 3: Raspberry Pi (One-Time Cost)
**Cost:** **₱3,000-5,000 (one-time)**
- Raspberry Pi 4 (4GB): ₱3,500
- MicroSD Card (64GB): ₱500
- Power Supply: ₱500
- Case: ₱300
- **Total:** **₱4,800 (one-time, no monthly fees)**

### Recommendation

**For School Use:** **Option 1 (School Server)** or **Option 3 (Raspberry Pi)**
- No monthly costs
- Full control
- Works without internet
- One-time setup

**Answer:** **NO monthly expiration or fees if hosted locally or on school server!** ✅

---

## 8. 🤝 Collaboration with SSLG

### SSLG Role & Responsibilities

**SSLG (Supreme Student Leadership Government) Partnership**

#### 1. Implementation Assistance
- Help install cameras in classrooms
- Assist in system setup and testing
- Coordinate with teachers and students
- Manage schedule coordination

#### 2. Information Dissemination
- Announce system launch to students
- Explain how the system works
- Share leaderboard updates
- Promote cleanliness awareness

#### 3. Evaluation & Monitoring
- Monitor daily rankings
- Verify classroom cleanliness
- Report system issues
- Provide feedback for improvements

#### 4. Student Participation
- Encourage students to maintain cleanliness
- Organize cleaning competitions
- Recognize top-performing classrooms
- Motivate students through gamification

### SSLG Access Levels

**SSLG Officers:**
- View all classroom rankings
- Access reports and analytics
- View before/after comparisons
- Monitor system performance

**Class Representatives:**
- View their section's ranking
- Access their classroom images
- Report issues or concerns
- Coordinate with classmates

### SSLG Activities

**Weekly:**
- Review leaderboard standings
- Announce top performers
- Share improvement tips
- Address concerns

**Monthly:**
- Generate performance reports
- Organize recognition ceremonies
- Plan improvement initiatives
- Evaluate system effectiveness

**Integration:**
- SSLG dashboard access
- Weekly email reports
- Mobile notifications (future)
- Recognition certificates (auto-generated)

---

## 9. 🌐 Website Only (Not a Mobile App)

### Current Status: ✅ WEB-BASED SYSTEM

**Platform:** Web Application (Browser-Based)

### Access Methods

**Desktop/Laptop:**
- Open browser (Chrome, Firefox, Edge)
- Navigate to: `http://[school-server-ip]:3000`
- Login with credentials
- Full functionality

**Mobile Devices (Phones/Tablets):**
- Open mobile browser
- Navigate to same URL
- Responsive design adapts to screen size
- Touch-friendly interface

**No App Download Required!**
- ✅ Access via web browser
- ✅ Works on any device with browser
- ✅ No installation needed
- ✅ No app store approval required
- ✅ Instant updates (no app updates)

### Access URL Examples

**Local Network (School):**
```
http://192.168.1.100:3000
http://school-server.local:3000
```

**Internet (If Deployed Online):**
```
https://classroom-cleanliness.vercel.app
https://yourdomain.com
```

### Advantages of Web-Based

1. **Universal Access**
   - Works on Windows, Mac, Linux
   - Works on Android, iOS
   - No device restrictions

2. **No Installation**
   - Just open browser
   - Bookmark the URL
   - Add to home screen (PWA)

3. **Easy Updates**
   - Update server once
   - All users get updates instantly
   - No app store approval delays

4. **Lower Maintenance**
   - Single codebase
   - No separate iOS/Android apps
   - Easier to maintain

### Future: Progressive Web App (PWA)

**Can be added later:**
- Install as "app" on home screen
- Works offline (limited)
- Push notifications
- App-like experience
- Still accessed via browser

**Estimated Time to Add PWA:** 1-2 days

---

## 10. 🔐 Ranking Feature with Restricted Image Access

### Current Status: ⚠️ NEEDS IMPLEMENTATION

### Access Control System

#### Public Leaderboard (All Students)

**URL:** `/leaderboard` (public page)

**Visible to Everyone:**
- ✅ Classroom rankings (1st, 2nd, 3rd, etc.)
- ✅ Classroom names
- ✅ Total scores
- ✅ Ratings (Excellent, Good, Fair, Poor)
- ✅ Grade level and section
- ✅ Improvement trends (↑↓)

**NOT Visible:**
- ❌ Classroom images
- ❌ Detailed score breakdown
- ❌ Detected objects
- ❌ Before/after photos

#### Class President Access

**URL:** `/dashboard/images` (requires login)

**Additional Access:**
- ✅ View their classroom's images
- ✅ See detailed score breakdown
- ✅ View detected objects
- ✅ Access before/after comparisons
- ✅ Download images (blurred faces)

**Restrictions:**
- ❌ Cannot view other classrooms' images
- ❌ Cannot edit or delete images
- ❌ Cannot change scores

### Implementation Plan

#### 1. User Roles & Authentication

**Database Schema:**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'class_president', 'student') DEFAULT 'student',
  classroom_id INT NULL,  -- For class presidents
  full_name VARCHAR(255),
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
```

#### 2. Access Control Logic

**Public Leaderboard (No Login):**
```typescript
// /app/leaderboard/page.tsx
export default function PublicLeaderboard() {
  // Show rankings only, no images
  return (
    <div>
      <h1>Classroom Rankings</h1>
      <LeaderboardTable showImages={false} />
    </div>
  );
}
```

**Class President Dashboard (Login Required):**
```typescript
// /app/dashboard/images/page.tsx
export default function ImagesPage() {
  const user = getCurrentUser();
  
  // Filter images by classroom
  const images = await getImages({
    classroomId: user.classroom_id
  });
  
  return (
    <div>
      <h1>My Classroom Images</h1>
      <ImageGallery images={images} />
    </div>
  );
}
```

#### 3. API Middleware

**Check User Permissions:**
```typescript
// /app/api/images/[id]/route.ts
export async function GET(request, { params }) {
  const user = await getCurrentUser(request);
  const image = await getImage(params.id);
  
  // Check if user can access this image
  if (user.role === 'admin') {
    // Admin can see all
    return image;
  } else if (user.role === 'class_president') {
    // President can only see their classroom
    if (image.classroom_id === user.classroom_id) {
      return image;
    } else {
      return { error: 'Access denied' };
    }
  } else {
    // Regular students cannot access images
    return { error: 'Access denied' };
  }
}
```

### User Accounts Setup

**Admin Account:**
- Username: `admin`
- Role: `admin`
- Access: Everything

**Class President Accounts:**
- Username: `president_7a` (Grade 7-A)
- Role: `class_president`
- Classroom: Grade 7-A
- Access: Only Grade 7-A images

**Student Accounts (Optional):**
- Username: `student_7a_01`
- Role: `student`
- Access: Public leaderboard only

### Login Page

**URL:** `/login`

**Features:**
- Username/password authentication
- Role-based redirect
- Session management
- Remember me option

**After Login:**
- Admin → `/dashboard`
- Class President → `/dashboard/images` (filtered)
- Student → `/leaderboard` (public)

### Estimated Implementation Time

- User authentication: 2-3 days
- Role-based access control: 1-2 days
- Public leaderboard page: 1 day
- Testing: 1 day
- **Total: 5-7 days**

---

## 📊 Summary Table

| # | Requirement | Status | Implementation Time | Priority |
|---|-------------|--------|---------------------|----------|
| 1 | Rating Criteria | ✅ Complete | - | - |
| 2 | Face Blurring | ⚠️ Pending | 1-2 days | High |
| 3 | 5:00 PM Alarm | ⚠️ Needs Update | 2-3 hours | High |
| 4 | 3-Day Testing | 📋 Planned | 3 days | High |
| 5 | Before/After Photos | ⚠️ Needs Enhancement | 2-3 days | Medium |
| 6 | Flowchart | 📋 Documented | 2-3 hours | Low |
| 7 | Server Costs | ✅ Answered (FREE) | - | - |
| 8 | SSLG Collaboration | 📋 Planned | Ongoing | Medium |
| 9 | Website Only | ✅ Complete | - | - |
| 10 | Restricted Access | ⚠️ Pending | 5-7 days | High |

---

## 🎯 Next Steps Priority

### High Priority (Implement First)
1. **Face Blurring** - Privacy requirement
2. **5:00 PM Alarm Update** - Testing requirement
3. **User Authentication & Access Control** - Security requirement

### Medium Priority (Implement Second)
4. **Before/After Comparison** - Feature enhancement
5. **SSLG Dashboard** - Collaboration feature

### Low Priority (Can Wait)
6. **Detailed Flowchart** - Documentation
7. **PWA Features** - Future enhancement

---

## 📞 Contact & Support

For questions or clarifications:
- Review this document
- Check existing documentation files
- Test the system locally
- Consult with SSLG officers

**Last Updated:** January 15, 2026
**Version:** 1.0
