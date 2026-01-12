import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { LeaderboardEntry, ApiResponse } from '@/types';

// GET /api/scores/leaderboard - Get leaderboard rankings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today'; // today, week, month, all
    const grade_level_id = searchParams.get('grade_level_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build date filter
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = `AND DATE(cs.analyzed_at) = CURDATE()`;
        break;
      case 'week':
        dateFilter = `AND cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        break;
      case 'month':
        dateFilter = `AND cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        break;
      case 'all':
      default:
        dateFilter = '';
    }
    
    // Build grade level filter
    let gradeFilter = '';
    if (grade_level_id) {
      gradeFilter = `AND g.id = ${parseInt(grade_level_id)}`;
    }
    
    const leaderboardQuery = `
      SELECT 
        c.id as classroom_id,
        c.name as classroom_name,
        g.name as grade_level,
        s.name as section,
        AVG(cs.total_score) as avg_score,
        MAX(cs.total_score) as max_score,
        COUNT(cs.id) as capture_count,
        MAX(cs.analyzed_at) as latest_capture,
        (
          SELECT rating 
          FROM cleanliness_scores 
          WHERE classroom_id = c.id 
          ORDER BY analyzed_at DESC 
          LIMIT 1
        ) as latest_rating
      FROM classrooms c
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      LEFT JOIN cleanliness_scores cs ON c.id = cs.classroom_id ${dateFilter}
      WHERE c.active = 1 ${gradeFilter}
      GROUP BY c.id, c.name, g.name, s.name
      HAVING capture_count > 0
      ORDER BY avg_score DESC, max_score DESC
      LIMIT ?
    `;
    
    const results = await query<any[]>(leaderboardQuery, [limit]);
    
    // Add rank
    const leaderboard: LeaderboardEntry[] = results.map((row, index) => ({
      rank: index + 1,
      classroom_id: row.classroom_id,
      classroom_name: row.classroom_name,
      grade_level: row.grade_level,
      section: row.section,
      total_score: parseFloat(row.avg_score),
      rating: row.latest_rating,
      latest_capture: row.latest_capture,
      capture_count: row.capture_count,
    }));
    
    const response: ApiResponse<LeaderboardEntry[]> = {
      success: true,
      data: leaderboard,
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
