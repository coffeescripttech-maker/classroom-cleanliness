# 📁 Image Organization Structure

## Overview

Images are now organized in a hierarchical folder structure that makes it easy to find and manage classroom images by grade, section, and date.

---

## Folder Structure

```
public/uploads/
├── Grade-7/
│   ├── Section-A/
│   │   ├── 2026-01-13/              # Date folder (YYYY-MM-DD)
│   │   │   ├── original_08-00-00.jpg      # Original captured image
│   │   │   ├── annotated_08-00-00.jpg     # AI-analyzed with detections
│   │   │   ├── original_14-00-00.jpg      # Afternoon capture
│   │   │   ├── annotated_14-00-00.jpg
│   │   ├── 2026-01-14/
│   │   │   ├── original_08-00-00.jpg
│   │   │   ├── annotated_08-00-00.jpg
│   │   │   ├── original_14-00-00.jpg
│   │   │   ├── annotated_14-00-00.jpg
│   ├── Section-B/
│   │   ├── 2026-01-13/
│   │   │   ├── original_08-00-00.jpg
│   │   │   ├── annotated_08-00-00.jpg
├── Grade-8/
│   ├── Section-A/
│   │   ├── 2026-01-13/
│   │   │   ├── original_08-00-00.jpg
│   │   │   ├── annotated_08-00-00.jpg
```

---

## Naming Convention

### Original Images
**Format:** `original_HH-MM-SS.jpg`

**Examples:**
- `original_08-00-00.jpg` - Captured at 8:00 AM
- `original_14-30-00.jpg` - Captured at 2:30 PM
- `original_16-45-30.jpg` - Captured at 4:45:30 PM

### Annotated Images
**Format:** `annotated_HH-MM-SS.jpg`

**Examples:**
- `annotated_08-00-00.jpg` - AI analysis of 8:00 AM capture
- `annotated_14-30-00.jpg` - AI analysis of 2:30 PM capture

**Note:** The time in the filename corresponds to when the image was captured/analyzed, not when it was saved.

---

## Benefits

### 1. **Easy Navigation**
- Browse by grade level
- Filter by section
- View all captures for a specific date

### 2. **Organized by Date**
- Each day gets its own folder
- Easy to find images from specific dates
- Prevents folder clutter with hundreds of images

### 3. **Paired Images**
- Original and annotated images are in the same folder
- Easy to compare before/after AI analysis
- Time-based naming makes pairing obvious

### 4. **Scalable**
- Supports multiple captures per day
- Works with scheduled captures (every hour, multiple times per day)
- No filename conflicts

### 5. **Historical Tracking**
- Keep images organized by date
- Easy to implement retention policies (delete old folders)
- Simple backup and archival

---

## How It Works

### Upload Flow

1. **User uploads image** via `/dashboard/images`
2. **System determines classroom** (Grade 7, Section A)
3. **Creates date folder** (2026-01-13)
4. **Saves as** `Grade-7/Section-A/2026-01-13/original_08-00-00.jpg`

### Analysis Flow

1. **User triggers AI analysis** on uploaded image
2. **Python API analyzes** and draws bounding boxes
3. **Extracts path structure** from original image path
4. **Saves annotated image** in same folder as original
5. **Stores as** `Grade-7/Section-A/2026-01-13/annotated_08-00-00.jpg`

### Scheduled Capture Flow

1. **Schedule checker runs** (every minute)
2. **Finds active schedule** (e.g., 8:00 AM, Monday-Friday)
3. **Captures from RTSP camera**
4. **Saves to** `Grade-7/Section-A/2026-01-13/original_08-00-00.jpg`
5. **Auto-triggers AI analysis**
6. **Saves annotated** `Grade-7/Section-A/2026-01-13/annotated_08-00-00.jpg`

---

## Database Storage

### captured_images table
```sql
image_path: "Grade-7/Section-A/2026-01-13/original_08-00-00.jpg"
```

### cleanliness_scores table
```sql
annotated_image_path: "Grade-7/Section-A/2026-01-13/annotated_08-00-00.jpg"
```

**Note:** Paths are stored as relative paths from `public/uploads/`

---

## Web Access

### Original Image URL
```
http://localhost:3000/uploads/Grade-7/Section-A/2026-01-13/original_08-00-00.jpg
```

### Annotated Image URL
```
http://localhost:3000/uploads/Grade-7/Section-A/2026-01-13/annotated_08-00-00.jpg
```

---

## Maintenance

### Cleanup Old Images

**Manual:**
```bash
# Delete images older than 30 days
cd web-portal/public/uploads
# Find and delete folders older than 30 days
```

**Automated (Future):**
- Retention policy setting in admin panel
- Automatic cleanup script
- Archive to cloud storage before deletion

### Disk Space Management

**Estimate:**
- Average image size: 500 KB
- 2 images per capture (original + annotated): 1 MB
- 10 classrooms × 2 captures/day × 1 MB = 20 MB/day
- Monthly: ~600 MB
- Yearly: ~7 GB

---

## Migration from Old Structure

If you have existing images in the old flat structure:

```bash
# Old: uploads/2026-01-13_01.jpg
# New: uploads/Grade-7/Section-A/2026-01-13/original_08-00-00.jpg
```

**Migration script needed** to:
1. Read existing images from database
2. Determine classroom (grade/section)
3. Extract date from filename
4. Move to new structure
5. Update database paths

---

## Example Scenarios

### Scenario 1: Morning Capture
- **Time:** 8:00 AM
- **Classroom:** Grade 7, Section A
- **Original:** `Grade-7/Section-A/2026-01-13/original_08-00-00.jpg`
- **Annotated:** `Grade-7/Section-A/2026-01-13/annotated_08-00-00.jpg`

### Scenario 2: Multiple Captures Same Day
- **8:00 AM:** `original_08-00-00.jpg` + `annotated_08-00-00.jpg`
- **2:00 PM:** `original_14-00-00.jpg` + `annotated_14-00-00.jpg`
- **4:00 PM:** `original_16-00-00.jpg` + `annotated_16-00-00.jpg`

All in the same date folder: `Grade-7/Section-A/2026-01-13/`

### Scenario 3: Week View
```
Grade-7/Section-A/
├── 2026-01-13/  (Monday)
│   ├── original_08-00-00.jpg
│   ├── annotated_08-00-00.jpg
├── 2026-01-14/  (Tuesday)
│   ├── original_08-00-00.jpg
│   ├── annotated_08-00-00.jpg
├── 2026-01-15/  (Wednesday)
│   ├── original_08-00-00.jpg
│   ├── annotated_08-00-00.jpg
```

---

## API Changes

### Upload API Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "image_path": "Grade-7/Section-A/2026-01-13/original_08-00-00.jpg"
  }
}
```

### Analysis API Response
```json
{
  "success": true,
  "annotated_image_path": "Grade-7/Section-A/2026-01-13/annotated_08-00-00.jpg",
  "scores": { ... },
  "total_score": 42.5
}
```

---

## Summary

✅ **Organized** - Grade → Section → Date hierarchy  
✅ **Scalable** - Supports unlimited captures per day  
✅ **Paired** - Original and annotated in same folder  
✅ **Time-based** - Easy to find specific captures  
✅ **Maintainable** - Simple cleanup and archival  
✅ **Web-accessible** - Direct URL access to images  

This structure is production-ready and scales well for schools with multiple grades, sections, and daily captures! 🎉
