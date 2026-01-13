# 🔍 AI Detection Data Flow - Updated with OpenCV Rendering

## ✅ Confirmed Flow

The detection data flows from Python API → Next.js API → Database → Frontend, and now includes **pre-rendered annotated images** from OpenCV!

## 📊 Complete Data Flow (Updated)

```
User clicks "Analyze with AI"
    ↓
Frontend calls: POST /api/images/analyze
    ↓
Next.js API Route: /api/images/analyze/route.ts
    ↓
Calls Python API: POST http://localhost:5000/api/analyze
    ↓
Python AI processes image with OWL-ViT/YOLOv8
    ↓
Python draws bounding boxes with OpenCV ⭐ NEW
    ↓
Python saves annotated image as JPG ⭐ NEW
    ↓
Python returns JSON response with detections + annotated_image_path ⭐ NEW
    ↓
Next.js stores in database (cleanliness_scores table)
    ↓
Frontend receives response
    ↓
UI displays pre-rendered annotated image ⭐ NEW (instead of canvas drawing)
```

## 🎯 Detection Data Structure

### Python API Response Format

```json
{
  "success": true,
  "total_score": 37.81,
  "rating": "Good",
  "scores": {
    "floor": 7.16,
    "furniture": 8.79,
    "trash": 7,
    "wall": 4.86,
    "clutter": 10
  },
  "detections": [
    {
      "bbox": [442.88, 503.34, 532.10, 639.47],
      "center": [487.49, 571.41],
      "class": "chair",
      "confidence": 0.775
    },
    {
      "bbox": [398.87, 416.39, 449.38, 576.48],
      "center": [424.13, 496.43],
      "class": "chair",
      "confidence": 0.744
    },
    {
      "bbox": [158.94, 575.33, 219.07, 613.26],
      "center": [189.01, 594.30],
      "class": "papers on floor",
      "confidence": 0.124
    }
  ],
  "classroom_id": "Room 201",
  "message": "Image analyzed successfully"
}
```

### Detection Object Structure

Each detection contains:

```typescript
{
  bbox: [x1, y1, x2, y2],      // Bounding box coordinates
  center: [cx, cy],             // Center point
  class: string,                // Object class name
  confidence: number            // Detection confidence (0-1)
}
```

## 🎨 Canvas Drawing Process

### Location: `web-portal/app/dashboard/images/[id]/page.tsx`

### Component: `DetectedObjectsCanvas`

```typescript
function DetectedObjectsCanvas({ imagePath, detections }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    // 1. Load image
    const img = new Image();
    img.src = imagePath;
    
    img.onload = () => {
      // 2. Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 3. Draw original image
      ctx.drawImage(img, 0, 0);
      
      // 4. Parse detections
      let detectionsArray = JSON.parse(detections);
      
      // 5. Draw each bounding box
      detectionsArray.forEach((detection, index) => {
        const { bbox, class: className, confidence } = detection;
        const [x1, y1, x2, y2] = bbox;
        const width = x2 - x1;
        const height = y2 - y1;
        
        // Generate unique color per object
        const hue = (index * 137.5) % 360;
        const color = `hsl(${hue}, 70%, 50%)`;
        
        // Draw rectangle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);
        
        // Draw label
        const label = `${className} ${(confidence * 100).toFixed(0)}%`;
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - 20, textWidth + 10, 20);
        ctx.fillStyle = 'white';
        ctx.fillText(label, x1 + 5, y1 - 5);
      });
    };
  }, [imagePath, detections]);
  
  return <canvas ref={canvasRef} />;
}
```

## 📝 Database Storage

### Table: `cleanliness_scores`

```sql
CREATE TABLE cleanliness_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image_id INT NOT NULL,
  classroom_id INT NOT NULL,
  floor_score DECIMAL(5,2),
  furniture_score DECIMAL(5,2),
  trash_score DECIMAL(5,2),
  wall_score DECIMAL(5,2),
  clutter_score DECIMAL(5,2),
  total_score DECIMAL(5,2),
  rating VARCHAR(20),
  detected_objects JSON,          -- ⭐ Detections stored here as JSON
  analyzed_at TIMESTAMP,
  FOREIGN KEY (image_id) REFERENCES captured_images(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
```

### Stored Format

```json
{
  "detected_objects": "[{\"bbox\":[442.88,503.34,532.10,639.47],\"class\":\"chair\",\"confidence\":0.775}...]"
}
```

## 🔄 Complete API Flow

### 1. Analyze Request

**Frontend:**
```typescript
const response = await fetch('/api/images/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image_id: imageId })
});
```

### 2. Next.js API Route

**File:** `web-portal/app/api/images/analyze/route.ts`

```typescript
// Get image details from database
const images = await query(`SELECT * FROM captured_images WHERE id = ?`, [image_id]);

// Call Python API
const aiResponse = await fetch(`${pythonApiUrl}/api/analyze`, {
  method: 'POST',
  body: JSON.stringify({
    image_path: imagePath,
    classroom_id: image.classroom_name
  })
});

const aiResult = await aiResponse.json();

// Extract data
const detections = JSON.stringify(aiResult.detections || []);

// Store in database
await query(
  `INSERT INTO cleanliness_scores 
   (image_id, classroom_id, floor_score, furniture_score, 
    trash_score, wall_score, clutter_score, total_score, 
    rating, detected_objects, analyzed_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [image_id, classroom_id, floorScore, furnitureScore, 
   trashScore, wallScore, clutterScore, totalScore, 
   rating, detections]  // ⭐ Detections stored as JSON string
);
```

### 3. Frontend Retrieval

**File:** `web-portal/app/dashboard/images/[id]/page.tsx`

```typescript
// Fetch image with scores
const response = await fetch(`/api/images/${imageId}`);
const data = await response.json();

// Access detections
const detections = data.score.detected_objects;

// Pass to canvas component
<DetectedObjectsCanvas 
  imagePath={`/uploads/${image.image_path}`}
  detections={detections}  // ⭐ Detections passed to canvas
/>
```

### 4. Canvas Drawing

```typescript
// Parse detections
let detectionsArray = JSON.parse(detections);

// Draw each detection
detectionsArray.forEach((detection) => {
  const [x1, y1, x2, y2] = detection.bbox;
  
  // Draw bounding box
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  
  // Draw label
  ctx.fillText(`${detection.class} ${detection.confidence}%`, x1, y1);
});
```

## 🎨 Visual Representation

```
┌─────────────────────────────────────────────────────────┐
│                    Original Image                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │     ┌─────────────┐                              │  │
│  │     │ chair 77%   │  ← Bounding box from bbox    │  │
│  │     └─────────────┘                              │  │
│  │                                                   │  │
│  │              ┌──────────────┐                    │  │
│  │              │ desk 85%     │                    │  │
│  │              └──────────────┘                    │  │
│  │                                                   │  │
│  │  ┌────────────────┐                              │  │
│  │  │ papers 12%     │                              │  │
│  │  └────────────────┘                              │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Each box drawn using detection.bbox coordinates        │
│  Label shows detection.class and detection.confidence   │
└─────────────────────────────────────────────────────────┘
```

## 📊 Detection Usage in UI

### 1. Canvas Visualization
- **Component**: `DetectedObjectsCanvas`
- **Purpose**: Draw bounding boxes on image
- **Data Used**: `bbox`, `class`, `confidence`

### 2. Object Count List
- **Component**: `DetectedObjectsList`
- **Purpose**: Show count of each object type
- **Data Used**: `class` (grouped and counted)

### 3. Score Computation Modals
- **Component**: `ScoreDetailModal`
- **Purpose**: Show which objects affected each score
- **Data Used**: `class`, `confidence` (filtered by category)

## 🔍 Example Detection Processing

### Input (from Python API)
```json
{
  "detections": [
    {"bbox": [100, 200, 150, 250], "class": "chair", "confidence": 0.85},
    {"bbox": [200, 300, 250, 350], "class": "papers on floor", "confidence": 0.45}
  ]
}
```

### Storage (in database)
```sql
detected_objects = '[{"bbox":[100,200,150,250],"class":"chair","confidence":0.85},{"bbox":[200,300,250,350],"class":"papers on floor","confidence":0.45}]'
```

### Canvas Drawing
```javascript
// Chair
ctx.strokeRect(100, 200, 50, 50);  // x1, y1, width, height
ctx.fillText("chair 85%", 100, 195);

// Papers
ctx.strokeRect(200, 300, 50, 50);
ctx.fillText("papers on floor 45%", 200, 295);
```

## ✅ Confirmation Summary

**Your understanding is 100% correct:**

1. ✅ API endpoint: `POST /api/images/analyze`
2. ✅ Response contains: `detections` array
3. ✅ Detection structure: `{bbox, class, confidence, center}`
4. ✅ UI uses detections to draw bounding boxes on canvas
5. ✅ Each detection creates a colored rectangle with label
6. ✅ Detections also used for object counting and score details

## 🎯 Key Points

1. **Detections are stored as JSON string** in database
2. **Parsed to array** when retrieved for display
3. **bbox format**: `[x1, y1, x2, y2]` (top-left and bottom-right corners)
4. **Canvas draws** using these exact coordinates
5. **Color generated** dynamically per object for visibility
6. **Label shows** class name and confidence percentage

## 📚 Related Files

- **API Route**: `web-portal/app/api/images/analyze/route.ts`
- **Image Detail Page**: `web-portal/app/dashboard/images/[id]/page.tsx`
- **Python API**: `web-portal/python-api/app.py`
- **Database Schema**: `web-portal/database/schema.sql`

---

**Confirmed**: The detection data flows from Python API → Next.js API → Database → Frontend → Canvas drawing exactly as you described! 🎉
