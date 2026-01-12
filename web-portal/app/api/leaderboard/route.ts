import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all';
    const grade = searchParams.get('grade');
    
    // Build date filter
    let dateFilter = '';
    if (period === 'today') {
      dateFilter = 'AND DATE(cs.analyzed_at) = CURDATE()';
    } else if (period === 'week') {
      dateFilter = 'AND cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateFilter = 'AND cs.analyzed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }
    
    // Build grade filter
    let gradeFilter = '';
    let params: any[] = [];
    if (grade && grade !== 'all') {
      gradeFilter = 'AND g.name = ?';
      params.push(grade);
    }
    
    const leaderboardQuery = `
      WITH classroom_scores AS (
        SELECT 
          c.id as classroom_id,
          c.name as classroom_name,
          c.building,
          s.name as section_name,
          g.name as grade_level,
          AVG(cs.total_score) as average_score,
          COUNT(cs.id) as total_analyses,
          MAX(cs.total_score) as latest_score,
          (SELECT rating FROM cleanliness_scores 
           WHERE classroom_id = c.id 
           ORDER BY analyzed_at DESC LIMIT 1) as latest_rating,
          (SELECT total_score FROM cleanliness_scores 
           WHERE classroom_id = c.id 
           ORDER BY analyzed_at DESC LIMIT 1) as most_recent_score,
          (SELECT total_score FROM cleanliness_scores 
           WHERE classroom_id = c.id 
           ORDER BY analyzed_at DESC LIMIT 1 OFFSET 1) as previous_score
        FROM classrooms c
        LEFT JOIN sections s ON c.section_id = s.id
        LEFT JOIN grade_levels g ON s.grade_level_id = g.id
        LEFT JOIN cleanliness_scores cs ON c.id = cs.classroom_id
        WHERE c.active = 1 ${dateFilter} ${gradeFilter}
        GROUP BY c.id, c.name, c.building, s.name, g.name
        HAVING total_analyses > 0
      )
      SELECT 
        *,
        CASE 
          WHEN most_recent_score > previous_score THEN 'up'
          WHEN most_recent_score < previous_score THEN 'down'
          ELSE 'stable'
        END as trend,
        COALESCE(most_recent_score - previous_score, 0) as improvement
      FROM classroom_scores
      ORDER BY average_score DESC, total_analyses DESC
    `;
    
    const results = await query<any[]>(leaderboardQuery, params);
    
    // Add rank
    const rankedResults = results.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      average_score: parseFloat(entry.average_score) || 0,
      latest_score: parseFloat(entry.latest_score) || 0,
      most_recent_score: parseFloat(entry.most_recent_score) || 0,
      previous_score: parseFloat(entry.previous_score) || 0,
      improvement: parseFloat(entry.improvement) || 0
    }));
    
    return NextResponse.json(rankedResults);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
