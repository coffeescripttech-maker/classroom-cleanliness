import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, DashboardStats } from '@/types';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Get total classrooms
    const [classroomsResult] = await query<any[]>(
      'SELECT COUNT(*) as total FROM classrooms WHERE active = 1'
    );
    
    // Get active cameras
    const [camerasResult] = await query<any[]>(
      "SELECT COUNT(*) as total FROM cameras WHERE status = 'active'"
    );
    
    // Get today's captures
    const [capturesResult] = await query<any[]>(
      'SELECT COUNT(*) as total FROM captured_images WHERE DATE(captured_at) = CURDATE()'
    );
    
    // Get average score
    const [avgScoreResult] = await query<any[]>(
      `SELECT AVG(total_score) as avg_score 
       FROM cleanliness_scores 
       WHERE DATE(analyzed_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    
    // Get rating counts
    const ratingCounts = await query<any[]>(
      `SELECT 
        rating,
        COUNT(*) as count
       FROM cleanliness_scores
       WHERE DATE(analyzed_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY rating`
    );
    
    // Build stats object
    const stats: DashboardStats = {
      total_classrooms: classroomsResult.total || 0,
      active_cameras: camerasResult.total || 0,
      today_captures: capturesResult.total || 0,
      average_score: parseFloat(avgScoreResult.avg_score) || 0,
      excellent_count: 0,
      good_count: 0,
      fair_count: 0,
      poor_count: 0,
    };
    
    // Map rating counts
    ratingCounts.forEach((row: any) => {
      switch (row.rating) {
        case 'Excellent':
          stats.excellent_count = row.count;
          break;
        case 'Good':
          stats.good_count = row.count;
          break;
        case 'Fair':
          stats.fair_count = row.count;
          break;
        case 'Poor':
          stats.poor_count = row.count;
          break;
      }
    });
    
    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
