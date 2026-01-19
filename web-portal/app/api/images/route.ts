import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const classroom_id = searchParams.get('classroom_id');
    
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params: any[] = [];
    
    // Filter by classroom_id if provided
    if (classroom_id) {
      whereConditions.push('ci.classroom_id = ?');
      params.push(classroom_id);
    }
    
    // Class presidents can only see their own classroom
    if (user.role === 'class_president' && user.classroom_id) {
      whereConditions.push('ci.classroom_id = ?');
      params.push(user.classroom_id);
    }
    
    // Students cannot access images
    if (user.role === 'student') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM captured_images ci
      ${whereClause}
    `;
    
    const [countResult] = await query<any[]>(countQuery, params);
    const total = countResult.total;
    
    const dataQuery = `
      SELECT 
        ci.*,
        c.name as classroom_name,
        c.building,
        s.name as section_name,
        g.name as grade_level,
        cs.id as score_id,
        cs.total_score,
        cs.rating
      FROM captured_images ci
      LEFT JOIN classrooms c ON ci.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      LEFT JOIN cleanliness_scores cs ON ci.id = cs.image_id
      ${whereClause}
      ORDER BY ci.captured_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const images = await query<any[]>(dataQuery, [...params, limit, offset]);
    
    const formattedImages = images.map(img => ({
      ...img,
      has_score: !!img.score_id
    }));
    
    return NextResponse.json({
      data: formattedImages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
