import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataQuery = `
      SELECT 
        ci.*,
        c.name as classroom_name,
        c.building,
        s.name as section_name,
        g.name as grade_level,
        cs.floor_score,
        cs.furniture_score,
        cs.trash_score,
        cs.wall_score,
        cs.clutter_score,
        cs.total_score,
        cs.rating,
        cs.detected_objects,
        cs.annotated_image_path,
        cs.analyzed_at
      FROM captured_images ci
      LEFT JOIN classrooms c ON ci.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      LEFT JOIN cleanliness_scores cs ON ci.id = cs.image_id
      WHERE ci.id = ?
    `;
    
    const images = await query<any[]>(dataQuery, [params.id]);
    
    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }
    
    const image = images[0];
    const result = {
      ...image,
      score: image.total_score ? {
        floor_score: image.floor_score,
        furniture_score: image.furniture_score,
        trash_score: image.trash_score,
        wall_score: image.wall_score,
        clutter_score: image.clutter_score,
        total_score: image.total_score,
        rating: image.rating,
        detected_objects: image.detected_objects,
        annotated_image_path: image.annotated_image_path,
        analyzed_at: image.analyzed_at
      } : null
    };
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM captured_images WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Image deleted' });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
