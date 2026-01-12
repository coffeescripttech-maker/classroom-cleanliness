# Classrooms Management Feature

## Overview
Complete CRUD interface for managing classroom locations in the cleanliness monitoring system.

## Features Implemented

### 1. Classrooms List Page (`/dashboard/classrooms`)
- **Grid View**: Card-based layout showing classroom details
- **List View**: Table format for compact viewing
- **Search**: Filter classrooms by name or section
- **Grade Filter**: Filter by grade level
- **Latest Scores**: Display most recent cleanliness scores
- **Status Indicators**: Active/Inactive badges
- **Quick Actions**: Edit and delete buttons

### 2. Create Classroom (`/dashboard/classrooms/create`)
- Form to add new classrooms
- Fields:
  - Classroom Name (e.g., "Room 101")
  - Section (dropdown with grade level + section)
  - Building name
  - Floor number
  - Student capacity
  - Active status checkbox
- Validation for required fields
- Cancel and save actions

### 3. Edit Classroom (`/dashboard/classrooms/[id]/edit`)
- Pre-populated form with existing data
- Same fields as create form
- Update functionality
- Cancel and save changes actions

## API Endpoints

### Classrooms
- `GET /api/classrooms` - List all classrooms with scores
- `POST /api/classrooms` - Create new classroom
- `GET /api/classrooms/[id]` - Get single classroom
- `PUT /api/classrooms/[id]` - Update classroom
- `DELETE /api/classrooms/[id]` - Delete classroom

### Supporting APIs
- `GET /api/grade-levels` - List all grade levels
- `POST /api/grade-levels` - Create grade level
- `GET /api/sections` - List all sections
- `POST /api/sections` - Create section

## Database Tables Used

```sql
classrooms (
  id, section_id, name, building, floor, 
  capacity, active, created_at
)

sections (
  id, grade_level_id, name, room_number
)

grade_levels (
  id, school_id, name, level
)
```

## Components Created

1. **ClassroomCard** - Grid view card component
2. **ClassroomRow** - Table row component
3. **Classroom Form** - Shared form logic (create/edit)

## Icons Used (Lucide React)
- `Building2` - Classroom/building icon
- `Plus` - Add new classroom
- `Search` - Search functionality
- `Filter` - Filter controls
- `Grid3x3` - Grid view toggle
- `List` - List view toggle
- `Pencil` - Edit action
- `Trash2` - Delete action
- `ArrowLeft` - Back navigation
- `Save` - Save action

## Setup Instructions

### 1. Database Setup
```bash
# Run the schema
mysql -u root -p classroom_cleanliness < web-portal/database/schema.sql

# Seed sample data
mysql -u root -p classroom_cleanliness < web-portal/database/seed-data.sql
```

### 2. Environment Variables
Make sure `.env.local` has:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=classroom_cleanliness
```

### 3. Start the Server
```bash
cd web-portal
npm run dev
```

### 4. Access the Feature
Navigate to: http://localhost:3000/dashboard/classrooms

## Usage Flow

1. **View Classrooms**: Navigate to Classrooms from sidebar
2. **Search/Filter**: Use search bar or grade filter
3. **Toggle View**: Switch between grid and list view
4. **Add Classroom**: Click "Add Classroom" button
5. **Fill Form**: Enter classroom details
6. **Save**: Submit form to create classroom
7. **Edit**: Click pencil icon on any classroom
8. **Delete**: Click trash icon (with confirmation)

## Sample Data Included

The seed data includes:
- 4 grade levels (7-10)
- 11 sections across grades
- 11 sample classrooms
- 4 cameras assigned to classrooms
- 4 capture schedules

## Next Steps

After classrooms are set up, you can:
1. **Assign Cameras** - Link cameras to classrooms
2. **Create Schedules** - Set up capture times
3. **Capture Images** - Start monitoring
4. **View Scores** - See cleanliness ratings
5. **Track Leaderboard** - Compare performance

## Troubleshooting

### No classrooms showing
- Check database connection in `.env.local`
- Verify tables exist: `SHOW TABLES;`
- Check if data exists: `SELECT * FROM classrooms;`

### Can't create classroom
- Ensure grade levels and sections exist first
- Check API logs in terminal
- Verify MySQL is running

### Edit page not loading
- Check classroom ID in URL
- Verify classroom exists in database
- Check browser console for errors
