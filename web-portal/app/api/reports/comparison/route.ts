import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grade_level_id = searchParams.get('grade_level_id');
    const days = parseInt(searchParams.get('days') || '30');

    let sql = `
      SELECT 
        c.id,
        c.name as classroom_name,
        g.name as grade_level,
        s.name as section_name,
        AVG(cs.total_score) as avg_score,
        AVG(cs.floor_score) as avg_floor,
        AVG(cs.furniture_score) as avg_furniture,
        AVG(cs.trash_score) as avg_trash,
        AVG(cs.wall_score) as avg_wall,
        AVG(cs.clutter_score) as avg_clutter,
        COUNT(*) as analysis_count,
        MAX(cs.total_score) as best_score,
        MIN(cs.total_score) as worst_score
      FROM classrooms c
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      LEFT JOIN cleanliness_scores cs ON c.id = cs.classroom_id 
        AND cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      WHERE c.active = TRUE
    `;

    const params: any[] = [days];

    if (grade_level_id) {
      sql += ' AND g.id = ?';
      params.push(grade_level_id);
    }

    sql += ' GROUP BY c.id, c.name, g.name, s.name ORDER BY avg_score DESC';

    const comparison = await query<any[]>(sql, params);

    return NextResponse.json({
      success: true,
      data: comparison
    });

  } catch (error: any) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
