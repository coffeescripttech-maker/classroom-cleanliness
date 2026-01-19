import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || 'month';
    const gradeLevel = searchParams.get('gradeLevel');

    // Calculate days based on time range
    let days = 30;
    if (timeRange === 'week') days = 7;
    else if (timeRange === 'year') days = 365;

    // Build grade filter
    let gradeFilter = '';
    let queryParams: any[] = [days];
    
    if (gradeLevel && gradeLevel !== 'all') {
      gradeFilter = 'AND g.name = ?';
      queryParams.push(gradeLevel);
    }

    // Overall statistics
    const stats = await query<any[]>(`
      SELECT 
        COUNT(*) as total_analyses,
        AVG(cs.total_score) as avg_score,
        AVG(cs.floor_score) as avg_floor,
        AVG(cs.furniture_score) as avg_furniture,
        AVG(cs.trash_score) as avg_trash,
        AVG(cs.wall_score) as avg_wall,
        AVG(cs.clutter_score) as avg_clutter
      FROM cleanliness_scores cs
      LEFT JOIN classrooms c ON cs.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      WHERE cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ${gradeFilter}
    `, queryParams);

    // Top classroom
    const topClassroom = await query<any[]>(`
      SELECT 
        c.name as classroom_name,
        AVG(cs.total_score) as avg_score
      FROM cleanliness_scores cs
      LEFT JOIN classrooms c ON cs.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      WHERE cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ${gradeFilter}
      GROUP BY c.id, c.name
      ORDER BY avg_score DESC
      LIMIT 1
    `, queryParams);

    // Calculate improvement rate (compare first half vs second half of period)
    const halfDays = Math.floor(days / 2);
    const improvement = await query<any[]>(`
      SELECT 
        (SELECT AVG(total_score) 
         FROM cleanliness_scores cs2
         LEFT JOIN classrooms c2 ON cs2.classroom_id = c2.id
         LEFT JOIN sections s2 ON c2.section_id = s2.id
         LEFT JOIN grade_levels g2 ON s2.grade_level_id = g2.id
         WHERE cs2.analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND cs2.analyzed_at < DATE_SUB(NOW(), INTERVAL ? DAY)
         ${gradeFilter.replace(/g\./g, 'g2.')}
        ) as earlier_avg,
        
        (SELECT AVG(total_score) 
         FROM cleanliness_scores cs3
         LEFT JOIN classrooms c3 ON cs3.classroom_id = c3.id
         LEFT JOIN sections s3 ON c3.section_id = s3.id
         LEFT JOIN grade_levels g3 ON s3.grade_level_id = g3.id
         WHERE cs3.analyzed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ${gradeFilter.replace(/g\./g, 'g3.')}
        ) as recent_avg
    `, gradeLevel && gradeLevel !== 'all' 
      ? [days, halfDays, gradeLevel, halfDays, gradeLevel]
      : [days, halfDays, halfDays]
    );

    const improvementRate = improvement[0]?.earlier_avg && improvement[0]?.recent_avg
      ? ((improvement[0].recent_avg - improvement[0].earlier_avg) / improvement[0].earlier_avg) * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalAnalyses: stats[0]?.total_analyses || 0,
        averageScore: stats[0]?.avg_score || 0,
        topClassroom: topClassroom[0]?.classroom_name || 'N/A',
        improvementRate: improvementRate,
        metrics: {
          floor: stats[0]?.avg_floor || 0,
          furniture: stats[0]?.avg_furniture || 0,
          trash: stats[0]?.avg_trash || 0,
          wall: stats[0]?.avg_wall || 0,
          clutter: stats[0]?.avg_clutter || 0,
        }
      }
    });

  } catch (error: any) {
    console.error('Statistics error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
