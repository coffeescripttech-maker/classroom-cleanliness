# 🎨 Annotated Images Feature - OpenCV Rendering

## Overview

Instead of redrawing bounding boxes on the frontend with JavaScript canvas, we now use the **pre-rendered annotated images** created by Python/OpenCV. This provides:

✅ **More Accurate** - Uses the same OpenCV rendering as the standalone Python script
✅ **Better Quality** - Professional OpenCV drawing with anti-aliasing
✅ **Consistent** - Same visualization in web portal and command line
✅ **Faster** - No client-side canvas rendering needed
✅ **Reliable** - Proven OpenCV drawing code

## How It Works

### 1. Python Analysis (main.py)

When you run the standalone Python script:

```bash
python main.py --image data/classroom2.png --classroom "Room 101" --use-owlvit
```

The script:
1. Detects objects with YOLOv8 and OWL-ViT
2. Draws bounding boxes with OpenCV
3. Shows annotated image in window
4. Returns `annotated_image` in result

### 2. Python API (web-portal/python-api/app.py)

When the web portal calls the API:

```python
# Analyze classroom
result = ai_system.analyze_classroom(image_path, classroom_id)

# Save annotated image
if 'annotated_image' in result:
    annotated_filename = f"{name}_annotated_{timestamp}.jpg"
    cv2.imwrite(web_portal_path, result['annotated_image'])
    
# Return path in response
response = {
    'annotated_image_path': annotated_filename,
    'detections': detections,
    'scores': scores
}
```

### 3. Next.js API Route

Stores the annotated image path in database:

```typescript
const annotatedImagePath = aiResult.annotated_image_path;

await query(
  `INSERT INTO cleanliness_scores 
   (..., detected_objects, annotated_image_path, ...)
   VALUES (?, ?, ?, ...)`,
  [..., detections, annotatedImagePath, ...]
);
```

### 4. Frontend Display

Shows the pre-rendered annotated image:

```typescript
{image.score.annotated_image_path ? (
  // Use OpenCV-rendered image
  <img src={`/uploads/${image.score.annotated_image_path}`} />
) : (
  // Fallback to canvas drawing
  <DetectedObjectsCanvas detections={detections} />
)}
```

## Data Flow

```
User clicks "Analyze with AI"
    ↓
POST /api/images/analyze
    ↓
Next.js API calls Python API
    ↓
Python API: ai_system.analyze_classroom()
    ↓
main.py: ClassroomCleanliness.analyze_classroom()
    ↓
Detects objects with YOLOv8 + OWL-ViT
    ↓
Draws bounding boxes with OpenCV
    ↓
Returns annotated_image (numpy array)
    ↓
Python API saves as JPG file
    ↓
Returns annotated_image_path
    ↓
Next.js stores path in database
    ↓
Frontend displays annotated image
```

## File Structure

```
web-portal/
├── public/
│   └── uploads/
│       ├── classroom1.jpg                    # Original image
│       └── classroom1_annotated_20250112.jpg # Annotated image ⭐
│
├── python-api/
│   └── app.py                                # Saves annotated images
│
├── app/
│   ├── api/
│   │   └── images/
│   │       └── analyze/
│   │           └── route.ts                  # Stores path in DB
│   └── dashboard/
│       └── images/
│           └── [id]/
│               └── page.tsx                  # Displays annotated image
│
└── database/
    ├── schema.sql                            # Has annotated_image_path column
    └── migrations/
        └── add_annotated_image_path.sql      # Migration script
```

## Database Schema

```sql
CREATE TABLE cleanliness_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image_id INT NOT NULL,
  classroom_id INT NOT NULL,
  floor_score DECIMAL(4,2),
  furniture_score DECIMAL(4,2),
  trash_score DECIMAL(4,2),
  wall_score DECIMAL(4,2),
  clutter_score DECIMAL(4,2),
  total_score DECIMAL(5,2),
  rating ENUM('Excellent', 'Good', 'Fair', 'Poor'),
  detected_objects JSON,
  annotated_image_path VARCHAR(255),  -- ⭐ NEW COLUMN
  analyzed_at TIMESTAMP,
  FOREIGN KEY (image_id) REFERENCES captured_images(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
```

## Migration

For existing databases, run:

```bash
mysql -u root -p classroom_cleanliness < web-portal/database/migrations/add_annotated_image_path.sql
```

Or manually:

```sql
ALTER TABLE cleanliness_scores 
ADD COLUMN annotated_image_path VARCHAR(255) AFTER detected_objects;
```

## API Response Format

### Python API Response

```json
{
  "success": true,
  "scores": {
    "floor": 7.16,
    "furniture": 8.79,
    "trash": 7.0,
    "wall": 4.86,
    "clutter": 10.0
  },
  "total_score": 37.81,
  "rating": "Good",
  "detections": [...],
  "annotated_image_path": "classroom1_annotated_20250112_143022.jpg",
  "classroom_id": "Room 101"
}
```

### Next.js API Response

```json
{
  "success": true,
  "data": {
    "scores": {...},
    "total_score": 37.81,
    "rating": "Good",
    "detections": [...],
    "annotated_image_path": "classroom1_annotated_20250112_143022.jpg"
  },
  "message": "Image analyzed successfully"
}
```

## OpenCV Drawing Code

The drawing is done in `main.py`:

```python
# Draw YOLO detections
annotated = self.detector.draw_detections(resized, yolo_detections)

# Draw OWL-ViT detections
if owlvit_detections:
    annotated = self.owlvit_detector.draw_detections(annotated, owlvit_detections)
```

### Drawing Implementation (models/detector.py)

```python
def draw_detections(self, image, detections):
    """Draw bounding boxes on image"""
    annotated = image.copy()
    
    for detection in detections:
        bbox = detection['bbox']
        class_name = detection['class']
        confidence = detection['confidence']
        
        # Draw rectangle
        cv2.rectangle(annotated, 
                     (int(bbox[0]), int(bbox[1])),
                     (int(bbox[2]), int(bbox[3])),
                     color, 2)
        
        # Draw label
        label = f"{class_name} {confidence:.2f}"
        cv2.putText(annotated, label, 
                   (int(bbox[0]), int(bbox[1]) - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    
    return annotated
```

## Advantages Over Canvas Drawing

### Old Method (Canvas Drawing)
```typescript
// Frontend draws bounding boxes
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.strokeRect(x1, y1, width, height);
ctx.fillText(label, x1, y1);
```

**Issues:**
- ❌ Different rendering than Python script
- ❌ Inconsistent across browsers
- ❌ No anti-aliasing
- ❌ Client-side processing
- ❌ Potential coordinate mismatches

### New Method (OpenCV Pre-rendering)
```python
# Python draws with OpenCV
cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
cv2.putText(image, label, (x1, y1-10), font, 0.5, color, 2)
cv2.imwrite(output_path, annotated_image)
```

**Benefits:**
- ✅ Same rendering as standalone script
- ✅ Professional OpenCV quality
- ✅ Anti-aliased lines and text
- ✅ Server-side processing
- ✅ Guaranteed coordinate accuracy

## Fallback Mechanism

The frontend includes a fallback:

```typescript
{image.score.annotated_image_path ? (
  // Primary: Use OpenCV-rendered image
  <img 
    src={`/uploads/${image.score.annotated_image_path}`}
    onError={() => {
      // Fallback to canvas if image fails to load
      console.warn('Falling back to canvas rendering');
    }}
  />
) : (
  // Fallback: Canvas drawing (old method)
  <DetectedObjectsCanvas detections={detections} />
)}
```

## File Naming Convention

Annotated images are named:
```
{original_name}_annotated_{timestamp}.jpg
```

Examples:
- `classroom1.jpg` → `classroom1_annotated_20250112_143022.jpg`
- `room_101.png` → `room_101_annotated_20250112_143022.jpg`

## Storage Location

All images stored in:
```
web-portal/public/uploads/
```

Accessible via:
```
http://localhost:3000/uploads/filename.jpg
```

## Cleanup Considerations

### Automatic Cleanup (Future Enhancement)

Consider implementing:
1. Delete annotated images when original is deleted
2. Periodic cleanup of old annotated images
3. Storage quota management

### Manual Cleanup

```bash
# Find annotated images
cd web-portal/public/uploads
ls *_annotated_*.jpg

# Delete old annotated images (older than 30 days)
find . -name "*_annotated_*.jpg" -mtime +30 -delete
```

## Testing

### Test Annotated Image Generation

1. **Upload image:**
   ```
   POST /api/images/upload
   ```

2. **Analyze image:**
   ```
   POST /api/images/analyze
   Body: { "image_id": 1 }
   ```

3. **Check response:**
   ```json
   {
     "annotated_image_path": "classroom1_annotated_20250112.jpg"
   }
   ```

4. **Verify file exists:**
   ```bash
   ls web-portal/public/uploads/*_annotated_*.jpg
   ```

5. **View in browser:**
   ```
   http://localhost:3000/uploads/classroom1_annotated_20250112.jpg
   ```

### Test Frontend Display

1. Go to image detail page
2. Click "Analyze with AI"
3. Wait for analysis to complete
4. Check "Detected Objects" section
5. Should see "✓ OpenCV Rendered" badge
6. Image should show bounding boxes

## Comparison

### Before (Canvas Drawing)
- Detections stored as JSON
- Frontend draws boxes with JavaScript
- Inconsistent rendering
- Browser-dependent quality

### After (OpenCV Pre-rendering)
- Detections stored as JSON (still available)
- Annotated image path stored
- Python draws boxes with OpenCV
- Consistent professional quality
- Same as standalone script

## Benefits Summary

1. **Accuracy** - Uses proven OpenCV drawing code
2. **Consistency** - Same visualization everywhere
3. **Quality** - Professional anti-aliased rendering
4. **Performance** - No client-side canvas processing
5. **Reliability** - Pre-rendered, always works
6. **Debugging** - Can view annotated images directly
7. **Compatibility** - Works in all browsers
8. **Maintainability** - Single drawing codebase

## Future Enhancements

1. **Multiple Formats** - Save as PNG for transparency
2. **Configurable Colors** - User-defined color schemes
3. **Annotation Layers** - Toggle different detection types
4. **Zoom/Pan** - Interactive viewing of annotated images
5. **Comparison Slider** - Side-by-side with slider
6. **Download Options** - Download original or annotated
7. **Batch Processing** - Generate annotated images in bulk

## Related Files

- **Python API**: `web-portal/python-api/app.py`
- **Main Script**: `main.py`
- **Detector**: `models/detector.py`
- **OWL-ViT**: `models/owlvit_detector.py`
- **API Route**: `web-portal/app/api/images/analyze/route.ts`
- **Frontend**: `web-portal/app/dashboard/images/[id]/page.tsx`
- **Schema**: `web-portal/database/schema.sql`
- **Migration**: `web-portal/database/migrations/add_annotated_image_path.sql`

---

**Result**: More accurate, consistent, and professional object detection visualization using OpenCV pre-rendered images! 🎨✨
