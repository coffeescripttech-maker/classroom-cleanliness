import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classroom_id = searchParams.get('classroom_id');
    const grade_level_id = searchParams.get('grade_level_id');
    const days = parseInt(searchParams.get('days') || '30');

    let sql = `
      SELECT 
        DATE(cs.analyzed_at) as date,
        AVG(cs.total_score) as avg_score,
        AVG(cs.floor_score) as avg_floor,
        AVG(cs.furniture_score) as avg_furniture,
        AVG(cs.trash_score) as avg_trash,
        AVG(cs.wall_score) as avg_wall,
        AVG(cs.clutter_score) as avg_clutter,
        COUNT(*) as analysis_count
      FROM cleanliness_scores cs
      LEFT JOIN classrooms c ON cs.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      WHERE cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const params: any[] = [days];

    if (classroom_id) {
      sql += ' AND cs.classroom_id = ?';
      params.push(classroom_id);
    }

    if (grade_level_id) {
      sql += ' AND g.id = ?';
      params.push(grade_level_id);
    }

    sql += ' GROUP BY DATE(cs.analyzed_at) ORDER BY date ASC';

    const trends = await query<any[]>(sql, params);

    return NextResponse.json({
      success: true,
      data: trends
    });

  } catch (error: any) {
    console.error('Trends error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
