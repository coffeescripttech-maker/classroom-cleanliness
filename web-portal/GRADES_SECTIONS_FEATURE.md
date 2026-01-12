# Grades & Sections Management Feature

## Overview
Complete management interface for dynamically creating and managing grade levels and sections. This makes classroom creation fully flexible and customizable.

## Features Implemented

### 1. Settings Hub (`/dashboard/settings`)
- Central settings page with categorized options
- Quick access cards for different settings areas
- Icons and descriptions for each category

### 2. Grades & Sections Page (`/dashboard/settings/grades-sections`)
- **Two-column layout**: Grade Levels on left, Sections on right
- **Real-time updates**: Changes reflect immediately
- **Modal-based editing**: Clean UX with popup forms

### Grade Levels Management
- **Add Grade Level**: Create new grade (e.g., Grade 7, Grade 8)
- **Edit Grade Level**: Update name and level number
- **Delete Grade Level**: Remove grade (with warning about cascading effects)
- **Fields**:
  - Grade Name (e.g., "Grade 7")
  - Level Number (7, 8, 9, etc.)

### Sections Management
- **Add Section**: Create new section for any grade
- **Edit Section**: Update section details
- **Delete Section**: Remove section (with warning)
- **Fields**:
  - Section Name (e.g., "Section A", "Section B")
  - Grade Level (dropdown of available grades)
  - Room Number (optional)

## How It Works

### Integration with Classrooms
When creating or editing a classroom:
1. Section dropdown automatically populates from database
2. Shows format: "Grade X - Section Y"
3. Dynamically updates when grades/sections are added
4. No hardcoded values - fully database-driven

### Data Flow
```
Grade Levels → Sections → Classrooms
     ↓             ↓           ↓
  Grade 7    Section A    Room 101
  Grade 8    Section B    Room 102
```

## API Endpoints

### Grade Levels
- `GET /api/grade-levels` - List all grades
- `POST /api/grade-levels` - Create grade
- `GET /api/grade-levels/[id]` - Get single grade
- `PUT /api/grade-levels/[id]` - Update grade
- `DELETE /api/grade-levels/[id]` - Delete grade

### Sections
- `GET /api/sections` - List all sections
- `POST /api/sections` - Create section
- `GET /api/sections/[id]` - Get single section
- `PUT /api/sections/[id]` - Update section
- `DELETE /api/sections/[id]` - Delete section

## Database Tables

```sql
grade_levels (
  id, school_id, name, level
)

sections (
  id, grade_level_id, name, room_number
)

classrooms (
  id, section_id, name, building, floor, capacity, active
)
```

## Usage Instructions

### Adding a New Grade Level
1. Go to Settings → Grades & Sections
2. Click "Add Grade" button
3. Enter grade name (e.g., "Grade 10")
4. Enter level number (e.g., 10)
5. Click "Save"

### Adding a New Section
1. Go to Settings → Grades & Sections
2. Click "Add Section" button
3. Enter section name (e.g., "Section C")
4. Select grade level from dropdown
5. Optionally enter room number
6. Click "Save"

### Creating a Classroom with New Grade/Section
1. Add grade level first (if needed)
2. Add section under that grade
3. Go to Classrooms → Add Classroom
4. Select the new section from dropdown
5. Fill in other details and save

## UI Components

### Modals
- **GradeModal**: Add/edit grade levels
- **SectionModal**: Add/edit sections
- Clean overlay design with form validation
- Loading states during save operations

### Icons (Lucide React)
- `GraduationCap` - Grade levels
- `Users` - Sections
- `Plus` - Add new items
- `Pencil` - Edit items
- `Trash2` - Delete items

## Features

### Smart Validation
- Required fields marked with *
- Grade level number limited to 1-12
- Section must have a grade level selected
- Duplicate prevention (handled by database)

### User Feedback
- Confirmation dialogs before deletion
- Warning about cascading effects
- Success/error messages
- Loading states during operations

### Responsive Design
- Two-column layout on desktop
- Stacked layout on mobile
- Scrollable sections list
- Modal adapts to screen size

## Safety Features

### Cascade Warnings
When deleting:
- **Grade Level**: Warns that sections and classrooms will be affected
- **Section**: Warns that classrooms will be affected

### Database Constraints
- Foreign key relationships maintained
- Cascade delete configured in schema
- Data integrity preserved

## Example Workflow

### Setting Up a New School Year
1. **Add Grade Levels**:
   - Grade 7
   - Grade 8
   - Grade 9
   - Grade 10

2. **Add Sections for Each Grade**:
   - Grade 7: Section A, B, C
   - Grade 8: Section A, B, C
   - Grade 9: Section A, B
   - Grade 10: Section A, B

3. **Create Classrooms**:
   - Room 101 → Grade 7 - Section A
   - Room 102 → Grade 7 - Section B
   - Room 201 → Grade 8 - Section A
   - etc.

## Benefits

### For Administrators
- No code changes needed to add grades/sections
- Flexible structure for any school size
- Easy reorganization between school years
- Clear visual management interface

### For System
- Fully normalized database design
- Scalable architecture
- Consistent data relationships
- Easy to query and report

## Next Steps

After setting up grades and sections:
1. Create classrooms for each section
2. Assign cameras to classrooms
3. Set up capture schedules
4. Start monitoring cleanliness

## Troubleshooting

### Can't delete grade level
- Check if sections exist under that grade
- Delete sections first, then grade
- Or use cascade delete (configured in schema)

### Section not showing in classroom dropdown
- Refresh the page
- Check if section was saved successfully
- Verify grade level exists

### Changes not reflecting
- Hard refresh browser (Ctrl+F5)
- Check browser console for errors
- Verify API endpoints are working
