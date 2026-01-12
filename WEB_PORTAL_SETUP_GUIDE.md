# 🚀 Web Portal Setup Guide

## ✅ What We've Built

A complete admin web portal with:
- ✅ Next.js 14 project structure
- ✅ MySQL database schema (12 tables)
- ✅ API routes (classrooms, leaderboard, AI integration)
- ✅ TypeScript types
- ✅ Python Flask API bridge
- ✅ React components (Stats, Leaderboard)
- ✅ Tailwind CSS configuration

## 📁 Files Created

```
web-portal/
├── app/
│   └── api/
│       ├── classrooms/
│       │   ├── route.ts          ✅ CRUD operations
│       │   └── [id]/route.ts     ✅ Single classroom
│       ├── scores/
│       │   └── leaderboard/
│       │       └── route.ts      ✅ Rankings
│       └── python-ai/
│           └── analyze/
│               └── route.ts      ✅ AI integration
│
├── components/
│   ├── dashboard/
│   │   └── StatsCard.tsx         ✅ Statistics card
│   └── leaderboard/
│       └── LeaderboardTable.tsx  ✅ Rankings table
│
├── lib/
│   └── db.ts                     ✅ MySQL connection
│
├── types/
│   └── index.ts                  ✅ TypeScript definitions
│
├── database/
│   └── schema.sql                ✅ Complete database schema
│
├── python-api/
│   ├── app.py                    ✅ Flask API server
│   └── requirements.txt          ✅ Python dependencies
│
├── package.json                  ✅ Node dependencies
├── tailwind.config.ts            ✅ Tailwind config
├── next.config.js                ✅ Next.js config
├── .env.example                  ✅ Environment template
└── README.md                     ✅ Documentation
```

## 🚀 Quick Start (5 Steps)

### Step 1: Install Node Dependencies

```bash
cd web-portal
npm install
```

**Installs:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- MySQL2
- And more...

### Step 2: Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and run schema
mysql -u root -p < database/schema.sql
```

**Creates:**
- 12 tables (schools, classrooms, cameras, schedules, images, scores, etc.)
- Default admin user
- System settings

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env.local
```

**Edit `.env.local`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=classroom_cleanliness

PYTHON_AI_URL=http://localhost:5000
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000
```

### Step 4: Start Python AI API

```bash
# Install Python dependencies
cd python-api
pip install flask flask-cors

# Start Flask server
python app.py
```

**Python API runs on:** `http://localhost:5000`

**Endpoints:**
- `GET /api/health` - Health check
- `POST /api/analyze` - Analyze image
- `POST /api/batch-analyze` - Batch analysis

### Step 5: Start Next.js Server

```bash
# From web-portal directory
npm run dev
```

**Web portal runs on:** `http://localhost:3000`

## 🎯 Test the System

### 1. Test Database Connection

```bash
# In web-portal directory
node -e "require('./lib/db').testConnection()"
```

### 2. Test Python AI API

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "message": "Python AI API is running",
  "owlvit_enabled": true
}
```

### 3. Test Classrooms API

```bash
curl http://localhost:3000/api/classrooms
```

### 4. Test AI Analysis

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image_path": "../data/classroom2.png",
    "classroom_id": "Room 101",
    "use_owlvit": true
  }'
```

## 📊 Database Schema Overview

### Core Tables

**1. schools** - School/organization info
**2. grade_levels** - Grade 7, 8, 9, etc.
**3. sections** - Section A, B, C, etc.
**4. classrooms** - Individual classrooms
**5. cameras** - Camera devices
**6. capture_schedules** - Photo schedules
**7. captured_images** - Stored images
**8. cleanliness_scores** - AI analysis results
**9. image_comparisons** - Before/after
**10. users** - Admin users
**11. activity_logs** - Audit trail
**12. system_settings** - Configuration

## 🔌 API Endpoints

### Classrooms
```
GET    /api/classrooms              # List all
POST   /api/classrooms              # Create
GET    /api/classrooms/[id]         # Get one
PUT    /api/classrooms/[id]         # Update
DELETE /api/classrooms/[id]         # Delete
```

### Leaderboard
```
GET    /api/scores/leaderboard      # Rankings
  ?period=today|week|month|all
  &grade_level_id=1
  &limit=50
```

### Python AI
```
POST   /api/python-ai/analyze       # Analyze image
```

## 🎨 Components

### StatsCard
```tsx
<StatsCard
  title="Total Classrooms"
  value={25}
  icon={<BuildingIcon />}
  trend={{ value: 5, isPositive: true }}
  color="blue"
/>
```

### LeaderboardTable
```tsx
<LeaderboardTable
  data={leaderboardData}
  loading={false}
/>
```

## 🔐 Security Features

- ✅ Prepared SQL statements (SQL injection protection)
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (admin, teacher, viewer)

## 📝 Next Steps

### Phase 1: Complete UI (Week 1-2)
- [ ] Dashboard page
- [ ] Classroom management UI
- [ ] Schedule management UI
- [ ] Authentication pages

### Phase 2: Image Management (Week 3)
- [ ] Image upload
- [ ] Gallery view
- [ ] Before/After comparison
- [ ] Trigger AI analysis from UI

### Phase 3: Advanced Features (Week 4)
- [ ] Real-time capture
- [ ] Alarm system
- [ ] Reports & analytics
- [ ] Email notifications

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env.local
# Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
```

### Python API Not Starting
```bash
# Install dependencies
pip install flask flask-cors

# Check port 5000 is available
# Try different port in app.py if needed
```

### Next.js Build Errors
```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run dev
```

## 📚 Documentation

- **WEB_PORTAL_PLAN.md** - Complete system plan
- **README.md** - Project overview
- **database/schema.sql** - Database structure
- **types/index.ts** - TypeScript types

## 🎉 Success Checklist

- [ ] MySQL database created
- [ ] Environment variables configured
- [ ] Python AI API running (port 5000)
- [ ] Next.js server running (port 3000)
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] Can create/read classrooms
- [ ] Can fetch leaderboard
- [ ] AI analysis working

## 🚀 Ready to Build!

You now have:
1. ✅ Complete database schema
2. ✅ Working API routes
3. ✅ Python AI integration
4. ✅ React components
5. ✅ TypeScript types
6. ✅ Development environment

**Start building the UI pages next!**

Need help with:
- Dashboard page?
- Classroom management UI?
- Schedule management?
- Image gallery?

Just ask! 🎯
