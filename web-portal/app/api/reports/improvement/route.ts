import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classroom_id = searchParams.get('classroom_id');

    // Get first week average vs last week average for each classroom
    let sql = `
      SELECT 
        c.id,
        c.name as classroom_name,
        g.name as grade_level,
        s.name as section_name,
        
        -- First week average (oldest 7 days of data)
        (SELECT AVG(total_score) 
         FROM cleanliness_scores 
         WHERE classroom_id = c.id 
         AND analyzed_at >= (
           SELECT MIN(analyzed_at) 
           FROM cleanliness_scores 
           WHERE classroom_id = c.id
         )
         AND analyzed_at < DATE_ADD(
           (SELECT MIN(analyzed_at) FROM cleanliness_scores WHERE classroom_id = c.id),
           INTERVAL 7 DAY
         )
        ) as first_week_avg,
        
        -- Last week average (most recent 7 days)
        (SELECT AVG(total_score) 
         FROM cleanliness_scores 
         WHERE classroom_id = c.id 
         AND analyzed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ) as last_week_avg,
        
        -- Overall average
        AVG(cs.total_score) as overall_avg,
        
        -- Count
        COUNT(cs.id) as total_analyses
        
      FROM classrooms c
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      LEFT JOIN cleanliness_scores cs ON c.id = cs.classroom_id
      WHERE c.active = TRUE
    `;

    const params: any[] = [];

    if (classroom_id) {
      sql += ' AND c.id = ?';
      params.push(classroom_id);
    }

    sql += ' GROUP BY c.id, c.name, g.name, s.name HAVING total_analyses > 0';

    const results = await query<any[]>(sql, params);

    // Calculate improvement percentage
    const improvement = results.map(row => ({
      ...row,
      improvement: row.first_week_avg && row.last_week_avg 
        ? ((row.last_week_avg - row.first_week_avg) / row.first_week_avg * 100).toFixed(2)
        : null,
      improvement_points: row.first_week_avg && row.last_week_avg
        ? (row.last_week_avg - row.first_week_avg).toFixed(2)
        : null
    }));

    return NextResponse.json({
      success: true,
      data: improvement
    });

  } catch (error: any) {
    console.error('Improvement error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
