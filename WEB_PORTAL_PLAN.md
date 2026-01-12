# 🌐 Admin Web Portal - Complete Plan

## System Overview

**Tech Stack:**
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MySQL
- **AI Integration:** Python API (your current system)
- **Image Storage:** Local filesystem or Cloud (AWS S3/Cloudinary)

---

## 📋 Features Breakdown

### 1. Webcam & Photo Capture Management
**Features:**
- Schedule photo capture times
- Configure alarm settings
- Set pre-capture delay (time for students to clean)
- Manage multiple cameras/classrooms
- Test camera connection

**Database Tables:**
```sql
cameras (
  id, classroom_id, ip_address, status, last_capture
)

capture_schedules (
  id, camera_id, time, days_of_week, alarm_enabled, 
  pre_capture_delay_seconds, active
)
```

---

### 2. Photo Schedule Management
**Features:**
- Create/edit/delete schedules
- Set different schedules per classroom
- Enable/disable schedules
- View upcoming captures
- Schedule templates (copy to multiple classrooms)

**Admin Pages:**
- `/admin/schedules` - List all schedules
- `/admin/schedules/create` - Create new schedule
- `/admin/schedules/[id]/edit` - Edit schedule

---

### 3. Alarm Configuration
**Features:**
- Set alarm sound/tone
- Configure alarm duration
- Set alarm volume
- Test alarm before capture
- Enable/disable per schedule

**Database:**
```sql
alarm_settings (
  id, schedule_id, sound_file, duration_seconds, 
  volume, enabled
)
```

---

### 4. Image Storage & Organization
**Features:**
- Auto-organize by grade level and section
- View captured images in gallery
- Filter by date, classroom, grade
- Download images
- Delete old images (retention policy)

**Folder Structure:**
```
images/
├── Grade-7/
│   ├── Section-A/
│   │   ├── 2026-01-12_08-00-00.jpg
│   │   ├── 2026-01-12_14-00-00.jpg
│   └── Section-B/
├── Grade-8/
└── Grade-9/
```

**Database:**
```sql
captured_images (
  id, classroom_id, image_path, captured_at, 
  file_size, width, height
)
```

---

### 5. Before/After Comparison
**Features:**
- Automatically pair before/after images
- Visual side-by-side comparison
- Show improvement metrics
- Highlight changes detected by AI

**Database:**
```sql
image_comparisons (
  id, before_image_id, after_image_id, 
  improvement_score, changes_detected, created_at
)
```

---

### 6. AI Cleanliness Rating
**Features:**
- Trigger AI analysis on captured images
- View detailed scoring breakdown
- Historical score trends
- Export analysis reports

**Database:**
```sql
cleanliness_scores (
  id, image_id, classroom_id, 
  floor_score, furniture_score, trash_score, 
  wall_score, clutter_score, total_score, 
  rating, analyzed_at
)
```

---

### 7. Leaderboard System
**Features:**
- Real-time rankings
- Filter by grade level
- Daily/weekly/monthly views
- Top performers highlight
- Improvement tracking

**Pages:**
- `/leaderboard` - Public leaderboard
- `/admin/leaderboard` - Admin view with controls

---

## 🗄️ Complete Database Schema

```sql
-- Schools/Organizations
CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grade Levels
CREATE TABLE grade_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT,
  name VARCHAR(50) NOT NULL, -- "Grade 7", "Grade 8"
  level INT NOT NULL, -- 7, 8, 9
  FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Sections
CREATE TABLE sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  grade_level_id INT,
  name VARCHAR(50) NOT NULL, -- "Section A", "Section B"
  room_number VARCHAR(20),
  FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id)
);

-- Classrooms
CREATE TABLE classrooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_id INT,
  name VARCHAR(100) NOT NULL,
  building VARCHAR(50),
  floor INT,
  capacity INT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- Cameras
CREATE TABLE cameras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  classroom_id INT,
  name VARCHAR(100),
  ip_address VARCHAR(45),
  port INT DEFAULT 8080,
  username VARCHAR(100),
  password VARCHAR(255), -- encrypted
  status ENUM('active', 'inactive', 'error') DEFAULT 'active',
  last_capture TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

-- Capture Schedules
CREATE TABLE capture_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  camera_id INT,
  name VARCHAR(100),
  capture_time TIME NOT NULL,
  days_of_week VARCHAR(20) DEFAULT '1,2,3,4,5', -- Mon-Fri
  alarm_enabled BOOLEAN DEFAULT TRUE,
  alarm_duration_seconds INT DEFAULT 10,
  pre_capture_delay_seconds INT DEFAULT 300, -- 5 minutes
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

-- Captured Images
CREATE TABLE captured_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  classroom_id INT,
  schedule_id INT,
  image_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_size INT,
  width INT,
  height INT,
  captured_at TIMESTAMP NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
  FOREIGN KEY (schedule_id) REFERENCES capture_schedules(id)
);

-- Cleanliness Scores
CREATE TABLE cleanliness_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image_id INT,
  classroom_id INT,
  floor_score DECIMAL(4,2),
  furniture_score DECIMAL(4,2),
  trash_score DECIMAL(4,2),
  wall_score DECIMAL(4,2),
  clutter_score DECIMAL(4,2),
  total_score DECIMAL(5,2),
  rating ENUM('Excellent', 'Good', 'Fair', 'Poor'),
  detected_objects JSON, -- Store detected objects
  analysis_details JSON, -- Detailed breakdown
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (image_id) REFERENCES captured_images(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
  INDEX idx_classroom_date (classroom_id, analyzed_at),
  INDEX idx_total_score (total_score)
);

-- Image Comparisons (Before/After)
CREATE TABLE image_comparisons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  before_image_id INT,
  after_image_id INT,
  classroom_id INT,
  improvement_score DECIMAL(5,2),
  changes_detected JSON,
  comparison_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (before_image_id) REFERENCES captured_images(id),
  FOREIGN KEY (after_image_id) REFERENCES captured_images(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

-- Users (Admin)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'viewer') DEFAULT 'viewer',
  full_name VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System Settings
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📁 Next.js Project Structure

```
classroom-cleanliness-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main dashboard
│   │   │
│   │   ├── classrooms/
│   │   │   ├── page.tsx          # List classrooms
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Classroom details
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx  # Edit classroom
│   │   │   └── create/
│   │   │       └── page.tsx      # Create classroom
│   │   │
│   │   ├── schedules/
│   │   │   ├── page.tsx          # List schedules
│   │   │   ├── [id]/
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   │
│   │   ├── cameras/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── images/
│   │   │   ├── page.tsx          # Image gallery
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Image details
│   │   │   └── compare/
│   │   │       └── page.tsx      # Before/After comparison
│   │   │
│   │   ├── scores/
│   │   │   ├── page.tsx          # All scores
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Score details
│   │   │
│   │   ├── leaderboard/
│   │   │   └── page.tsx          # Admin leaderboard view
│   │   │
│   │   ├── reports/
│   │   │   └── page.tsx          # Analytics & reports
│   │   │
│   │   ├── settings/
│   │   │   ├── page.tsx          # System settings
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   └── alarms/
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx            # Dashboard layout
│   │
│   ├── leaderboard/
│   │   └── page.tsx              # Public leaderboard
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   │
│   │   ├── classrooms/
│   │   │   ├── route.ts          # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE
│   │   │
│   │   ├── schedules/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   │
│   │   ├── cameras/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── test/
│   │   │       └── route.ts      # Test camera connection
│   │   │
│   │   ├── images/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── analyze/
│   │   │       └── route.ts      # Trigger AI analysis
│   │   │
│   │   ├── scores/
│   │   │   ├── route.ts
│   │   │   └── leaderboard/
│   │   │       └── route.ts
│   │   │
│   │   ├── capture/
│   │   │   ├── trigger/
│   │   │   │   └── route.ts      # Manual capture
│   │   │   └── alarm/
│   │   │       └── route.ts      # Trigger alarm
│   │   │
│   │   └── python-ai/
│   │       └── analyze/
│   │           └── route.ts      # Proxy to Python AI
│   │
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatsCard.tsx
│   │   └── RecentActivity.tsx
│   │
│   ├── classrooms/
│   │   ├── ClassroomCard.tsx
│   │   ├── ClassroomForm.tsx
│   │   └── ClassroomList.tsx
│   │
│   ├── schedules/
│   │   ├── ScheduleForm.tsx
│   │   ├── ScheduleCalendar.tsx
│   │   └── UpcomingCaptures.tsx
│   │
│   ├── images/
│   │   ├── ImageGallery.tsx
│   │   ├── ImageCard.tsx
│   │   ├── ImageViewer.tsx
│   │   └── BeforeAfterSlider.tsx
│   │
│   ├── scores/
│   │   ├── ScoreCard.tsx
│   │   ├── ScoreBreakdown.tsx
│   │   ├── ScoreChart.tsx
│   │   └── TrendGraph.tsx
│   │
│   └── leaderboard/
│       ├── LeaderboardTable.tsx
│       ├── RankBadge.tsx
│       └── FilterControls.tsx
│
├── lib/
│   ├── db.ts                     # MySQL connection
│   ├── auth.ts                   # Authentication
│   ├── utils.ts                  # Utility functions
│   ├── api-client.ts             # API client
│   └── python-ai-client.ts       # Python AI integration
│
├── types/
│   ├── classroom.ts
│   ├── schedule.ts
│   ├── image.ts
│   ├── score.ts
│   └── user.ts
│
├── hooks/
│   ├── useClassrooms.ts
│   ├── useSchedules.ts
│   ├── useImages.ts
│   └── useLeaderboard.ts
│
├── public/
│   ├── images/
│   └── sounds/
│       └── alarm.mp3
│
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 🎨 Key Pages & Features

### 1. Dashboard (`/dashboard`)
**Components:**
- Overview statistics (total classrooms, today's captures, average score)
- Recent captures gallery
- Upcoming scheduled captures
- Top 5 leaderboard preview
- System status indicators

### 2. Classrooms Management (`/classrooms`)
**Features:**
- Grid/List view of all classrooms
- Filter by grade level, section
- Add/Edit/Delete classrooms
- Assign cameras
- View classroom history

### 3. Schedule Management (`/schedules`)
**Features:**
- Calendar view of all schedules
- Create schedule wizard
- Bulk schedule creation
- Enable/disable schedules
- Test alarm functionality

### 4. Image Gallery (`/images`)
**Features:**
- Grid view with thumbnails
- Filter by date, classroom, grade
- Lightbox viewer
- Download images
- Trigger AI analysis
- Before/After comparison mode

### 5. Leaderboard (`/leaderboard`)
**Features:**
- Real-time rankings table
- Filter by grade level
- Time period selector (today, week, month)
- Export to PDF/Excel
- Share leaderboard link

### 6. Reports & Analytics (`/reports`)
**Features:**
- Score trends over time
- Classroom performance comparison
- Improvement tracking
- Export reports
- Custom date ranges

---

## 🔌 Python AI Integration

### API Bridge (Next.js → Python)

```typescript
// lib/python-ai-client.ts
export async function analyzeImage(imagePath: string) {
  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_path: imagePath })
  });
  
  return response.json();
}
```

### Python Flask API (Bridge)

```python
# python-api/app.py
from flask import Flask, request, jsonify
from main import ClassroomCleanliness
import os

app = Flask(__name__)
system = ClassroomCleanliness(use_owlvit=True)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    image_path = data['image_path']
    classroom_id = data['classroom_id']
    
    result = system.analyze_classroom(image_path, classroom_id)
    
    return jsonify({
        'scores': result['scores'],
        'total_score': result['total_score'],
        'rating': result['rating'],
        'detections': result['detections']
    })

if __name__ == '__main__':
    app.run(port=5000)
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Setup Next.js project
- [ ] Configure Tailwind CSS
- [ ] Setup MySQL database
- [ ] Create database schema
- [ ] Implement authentication
- [ ] Build basic dashboard layout

### Phase 2: Core Features (Week 3-4)
- [ ] Classroom management CRUD
- [ ] Schedule management
- [ ] Camera configuration
- [ ] Image upload & storage
- [ ] Basic leaderboard

### Phase 3: AI Integration (Week 5-6)
- [ ] Python Flask API bridge
- [ ] Image analysis integration
- [ ] Score calculation & storage
- [ ] Before/After comparison
- [ ] Detailed score breakdown

### Phase 4: Advanced Features (Week 7-8)
- [ ] Real-time capture triggering
- [ ] Alarm system integration
- [ ] Reports & analytics
- [ ] Export functionality
- [ ] Email notifications

### Phase 5: Polish & Deploy (Week 9-10)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0",
    "react-dropzone": "^14.2.3",
    "sharp": "^0.33.0",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 🔐 Security Considerations

1. **Authentication:** JWT tokens with httpOnly cookies
2. **Authorization:** Role-based access control (Admin, Teacher, Viewer)
3. **Image Storage:** Secure file paths, prevent directory traversal
4. **API Security:** Rate limiting, CORS configuration
5. **Database:** Prepared statements, input validation
6. **Passwords:** Bcrypt hashing
7. **Environment Variables:** Secure credential storage

---

## 📊 Sample API Endpoints

```
GET    /api/classrooms              # List all classrooms
POST   /api/classrooms              # Create classroom
GET    /api/classrooms/[id]         # Get classroom details
PUT    /api/classrooms/[id]         # Update classroom
DELETE /api/classrooms/[id]         # Delete classroom

GET    /api/schedules               # List schedules
POST   /api/schedules               # Create schedule
PUT    /api/schedules/[id]          # Update schedule
DELETE /api/schedules/[id]          # Delete schedule

POST   /api/capture/trigger         # Manual capture
POST   /api/capture/alarm           # Trigger alarm

GET    /api/images                  # List images
POST   /api/images/upload           # Upload image
POST   /api/images/analyze          # Analyze image
GET    /api/images/[id]             # Get image details

GET    /api/scores                  # List scores
GET    /api/scores/leaderboard      # Get leaderboard
GET    /api/scores/[id]             # Get score details

POST   /api/python-ai/analyze       # Trigger AI analysis
```

---

## 🎯 Next Steps

1. **Review this plan** and confirm requirements
2. **Setup development environment**
3. **Create database** and run schema
4. **Initialize Next.js project**
5. **Start with Phase 1** (Foundation)

Want me to start creating the Next.js project structure and initial files?
