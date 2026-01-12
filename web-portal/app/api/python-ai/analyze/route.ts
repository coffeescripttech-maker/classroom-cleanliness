import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types';

// POST /api/python-ai/analyze - Trigger AI analysis on an image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_id, image_path, classroom_id } = body;
    
    if (!image_path || !classroom_id) {
      return NextResponse.json(
        { success: false, error: 'image_path and classroom_id are required' },
        { status: 400 }
      );
    }
    
    // Call Python AI API
    const pythonApiUrl = process.env.PYTHON_AI_URL || 'http://localhost:5000';
    
    const aiResponse = await fetch(`${pythonApiUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_path,
        classroom_id,
        use_owlvit: true,
      }),
    });
    
    if (!aiResponse.ok) {
      throw new Error('Python AI analysis failed');
    }
    
    const aiResult = await aiResponse.json();
    
    // Save scores to database
    const insertQuery = `
      INSERT INTO cleanliness_scores (
        image_id, classroom_id, 
        floor_score, furniture_score, trash_score, wall_score, clutter_score,
        total_score, rating, detected_objects, analysis_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(insertQuery, [
      image_id,
      classroom_id,
      aiResult.scores.floor,
      aiResult.scores.furniture,
      aiResult.scores.trash,
      aiResult.scores.wall,
      aiResult.scores.clutter,
      aiResult.total_score,
      aiResult.rating,
      JSON.stringify(aiResult.detections || []),
      JSON.stringify(aiResult.scores),
    ]);
    
    // Get the created score
    const score = await query<any[]>(
      'SELECT * FROM cleanliness_scores WHERE id = ?',
      [result.insertId]
    );
    
    const response: ApiResponse = {
      success: true,
      data: {
        score: score[0],
        ai_result: aiResult,
      },
      message: 'Image analyzed successfully',
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
