import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_id } = body;

    if (!image_id) {
      return NextResponse.json(
        { success: false, error: 'image_id is required' },
        { status: 400 }
      );
    }

    // Get image details
    const images = await query<any[]>(
      `SELECT ci.*, c.name as classroom_name
       FROM captured_images ci
       LEFT JOIN classrooms c ON ci.classroom_id = c.id
       WHERE ci.id = ?`,
      [image_id]
    );

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    const image = images[0];
    const imagePath = join(process.cwd(), 'public', 'uploads', image.image_path);
    
    // Normalize path for Windows - replace backslashes with forward slashes for Python
    const normalizedImagePath = imagePath.replace(/\\/g, '/');

    // Call Python AI API
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
    console.log('Calling Python API:', pythonApiUrl);
    console.log('Image path:', imagePath);
    
    const aiResponse = await fetch(`${pythonApiUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_path: normalizedImagePath,
        classroom_id: image.classroom_name
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Python API error:', errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    console.log('AI Result:', aiResult);
    console.log('DEBUG: annotated_image_path from Python:', aiResult.annotated_image_path);

    // Check if analysis was successful
    if (!aiResult.success) {
      throw new Error(aiResult.error || 'Analysis failed');
    }

    // Extract scores with correct field names from Python API
    const floorScore = aiResult.scores?.floor ?? 0;
    const furnitureScore = aiResult.scores?.furniture ?? 0;
    const trashScore = aiResult.scores?.trash ?? 0;
    const wallScore = aiResult.scores?.wall ?? 0;
    const clutterScore = aiResult.scores?.clutter ?? 0;
    const totalScore = aiResult.total_score ?? 0;
    const rating = aiResult.rating || 'N/A';
    const detections = JSON.stringify(aiResult.detections || []);
    const annotatedImagePath = aiResult.annotated_image_path || null;  // NEW: Get annotated image path

    console.log('DEBUG: annotatedImagePath variable:', annotatedImagePath);
    console.log('Storing scores:', {
      image_id,
      classroom_id: image.classroom_id,
      floorScore,
      furnitureScore,
      trashScore,
      wallScore,
      clutterScore,
      totalScore,
      rating,
      annotatedImagePath
    });

    // Store scores in database
    await query(
      `INSERT INTO cleanliness_scores 
       (image_id, classroom_id, floor_score, furniture_score, trash_score, 
        wall_score, clutter_score, total_score, rating, detected_objects, annotated_image_path, analyzed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        image_id,
        image.classroom_id,
        floorScore,
        furnitureScore,
        trashScore,
        wallScore,
        clutterScore,
        totalScore,
        rating,
        detections,
        annotatedImagePath  // NEW: Store annotated image path
      ]
    );

    return NextResponse.json({
      success: true,
      data: aiResult,
      message: 'Image analyzed successfully'
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
