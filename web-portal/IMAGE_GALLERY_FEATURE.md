# Image Gallery & Management Feature

## Overview
Complete image management system with upload, gallery view, AI analysis integration, and detailed score visualization.

## Features Implemented

### 1. Image Gallery Page (`/dashboard/images`)
- **Grid Layout**: Card-based gallery with image previews
- **Search & Filters**: 
  - Search by classroom or grade
  - Filter by classroom
  - Filter by date (Today, This Week, This Month, All Time)
- **Image Cards Show**:
  - Classroom image preview
  - Classroom name and grade/section
  - Capture date and time
  - Score badge (if analyzed)
  - Quick actions (View, Analyze, Delete)
- **Upload Button**: Quick access to upload modal

### 2. Image Detail Page (`/dashboard/images/[id]`)
- **Full Image View**: Large image display
- **Overall Score Card**: 
  - Total score out of 50
  - Rating badge (Excellent/Good/Fair/Poor)
  - Color-coded by rating
- **Score Breakdown**:
  - Floor Cleanliness (0-10)
  - Furniture Orderliness (0-10)
  - Trash Bin Condition (0-10)
  - Wall/Board Cleanliness (0-10)
  - Clutter Detection (0-10)
  - Visual progress bars for each metric
- **Image Information**:
  - Capture date/time
  - Building location
  - Analysis date/time
  - File size and dimensions
- **Actions**:
  - Analyze with AI button (if not analyzed)
  - Delete image button
  - Back to gallery link

### 3. Upload Modal
- **Classroom Selection**: Dropdown of all classrooms
- **File Upload**: Image file selector with preview
- **Image Preview**: Shows selected image before upload
- **Validation**: Ensures classroom and file are selected
- **Auto-Organization**: Saves to Grade-X/Section-Y/ folder structure

### 4. AI Analysis Integration
- **Trigger Analysis**: Click "Analyze" button on any image
- **Python API Integration**: Calls your existing AI system
- **Score Storage**: Saves results to database
- **Real-time Updates**: Scores appear immediately after analysis
- **Loading States**: Shows "Analyzing..." during processing

## File Organization

### Upload Structure
```
public/uploads/
├── Grade-7/
│   ├── Section-A/
│   │   ├── 2026-01-12_08-00-00.jpg
│   │   ├── 2026-01-12_14-00-00.jpg
│   └── Section-B/
│       ├── 2026-01-12_08-00-00.jpg
├── Grade-8/
│   ├── Section-A/
│   └── Section-B/
└── Grade-9/
```

### Database Tables Used
```sql
captured_images (
  id, classroom_id, image_path, captured_at,
  file_size, width, height
)

cleanliness_scores (
  id, image_id, classroom_id,
  floor_score, furniture_score, trash_score,
  wall_score, clutter_score, total_score,
  rating, detected_objects, analyzed_at
)
```

## API Endpoints

### Images
- `GET /api/images` - List all images with pagination
- `GET /api/images/[id]` - Get single image with score
- `DELETE /api/images/[id]` - Delete image
- `POST /api/images/upload` - Upload new image
- `POST /api/images/analyze` - Trigger AI analysis

### Analysis Flow
```
1. User uploads image → Saved to uploads folder
2. Image record created in database
3. User clicks "Analyze" → Calls Python API
4. Python AI analyzes image → Returns scores
5. Scores saved to database
6. UI updates with results
```

## Usage Instructions

### Uploading an Image
1. Go to Images page
2. Click "Upload Image" button
3. Select classroom from dropdown
4. Choose image file (JPG, PNG, etc.)
5. Preview appears
6. Click "Upload"
7. Image appears in gallery

### Analyzing an Image
1. Find image in gallery (or open detail page)
2. Click "Analyze" button
3. Wait for AI processing (shows "Analyzing...")
4. Scores appear automatically
5. View detailed breakdown on detail page

### Viewing Image Details
1. Click "View" button on any image card
2. See full-size image
3. View complete score breakdown
4. Check capture and analysis timestamps
5. See file information

### Filtering Images
1. Use search bar to find by classroom/grade
2. Select classroom from dropdown filter
3. Choose date range (Today, Week, Month, All)
4. Results update automatically

## Score Rating System

### Rating Levels
- **Excellent**: 45-50 points (Green)
- **Good**: 35-44 points (Blue)
- **Fair**: 25-34 points (Yellow)
- **Poor**: Below 25 points (Red)

### Score Components
Each component worth 10 points:
1. **Floor Cleanliness**: Trash, debris, dirt on floor
2. **Furniture Orderliness**: Chairs, desks arrangement
3. **Trash Bin Condition**: Proper waste disposal
4. **Wall/Board Cleanliness**: Vandalism, board condition
5. **Clutter Detection**: Bags, bottles, papers left behind

## UI Components

### ImageCard Component
- Displays image thumbnail
- Shows classroom info
- Rating badge overlay
- Action buttons (View, Analyze, Delete)
- Hover effects

### UploadModal Component
- File input with preview
- Classroom selector
- Upload progress
- Success/error handling

### ScoreBar Component
- Visual progress bar
- Color-coded by percentage
- Shows score out of max
- Smooth animations

## Icons Used (Lucide React)
- `Upload` - Upload button
- `Search` - Search functionality
- `Filter` - Filter controls
- `Calendar` - Date filter
- `Image` - Empty state
- `Sparkles` - AI analysis
- `Eye` - View details
- `Trash2` - Delete action
- `Download` - Download image
- `BarChart3` - Score breakdown
- `Building2` - Location info
- `ArrowLeft` - Back navigation

## Integration with Python AI

### Environment Variable
```env
PYTHON_API_URL=http://localhost:5000
```

### API Request Format
```json
{
  "image_path": "/full/path/to/image.jpg",
  "classroom_id": "Room 101"
}
```

### Expected Response
```json
{
  "scores": {
    "floor_score": 8.5,
    "furniture_score": 7.0,
    "trash_score": 9.0,
    "wall_score": 6.5,
    "clutter_score": 10.0
  },
  "total_score": 41.0,
  "rating": "Good",
  "detections": { ... }
}
```

## Features

### Smart Organization
- Auto-creates folder structure
- Organized by grade and section
- Timestamped filenames
- No manual file management needed

### Real-time Analysis
- Click to analyze any image
- Loading states during processing
- Immediate score display
- Persistent storage

### Responsive Design
- Grid adapts to screen size
- Mobile-friendly cards
- Touch-optimized buttons
- Responsive modals

### Data Integrity
- Foreign key relationships
- Cascade delete configured
- Transaction safety
- Error handling

## Example Workflow

### Daily Monitoring
1. **Morning**: Upload classroom images
2. **Analyze**: Click analyze on each image
3. **Review**: Check scores and ratings
4. **Compare**: View trends over time
5. **Report**: Export data for reports

### Weekly Review
1. Filter by "This Week"
2. Compare all classrooms
3. Identify low-scoring rooms
4. Track improvements
5. Update leaderboard

## Troubleshooting

### Image not uploading
- Check file size (max 10MB recommended)
- Verify file format (JPG, PNG)
- Ensure classroom is selected
- Check uploads folder permissions

### Analysis failing
- Verify Python API is running (port 5000)
- Check PYTHON_API_URL in .env
- Ensure image file exists
- Check Python API logs

### Images not displaying
- Check uploads folder path
- Verify image_path in database
- Check file permissions
- Use browser dev tools for errors

### Scores not showing
- Verify analysis completed
- Check cleanliness_scores table
- Refresh the page
- Check for API errors

## Next Steps

After images are working:
1. Add before/after comparison feature
2. Implement bulk analysis
3. Add image download functionality
4. Create image reports
5. Add image annotations
6. Implement image search by objects detected

## Performance Tips

### Optimization
- Use image thumbnails for gallery
- Lazy load images
- Paginate results
- Cache API responses
- Compress uploaded images

### Storage Management
- Set retention policy (e.g., 90 days)
- Auto-delete old images
- Archive important images
- Monitor disk space
- Implement cloud storage option
