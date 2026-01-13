import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/schedules - List all schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const camera_id = searchParams.get('camera_id');
    const active = searchParams.get('active');

    let scheduleQuery = `
      SELECT 
        cs.*,
        cam.name as camera_name,
        cam.ip_address,
        c.name as classroom_name,
        s.name as section_name,
        g.name as grade_level
      FROM capture_schedules cs
      LEFT JOIN cameras cam ON cs.camera_id = cam.id
      LEFT JOIN classrooms c ON cam.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (camera_id) {
      scheduleQuery += ' AND cs.camera_id = ?';
      params.push(camera_id);
    }

    if (active !== null && active !== undefined) {
      scheduleQuery += ' AND cs.active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    scheduleQuery += ' ORDER BY cs.capture_time ASC';

    const schedules = await query<any[]>(scheduleQuery, params);

    return NextResponse.json({
      success: true,
      data: schedules
    });

  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      camera_id,
      name,
      capture_time,
      days_of_week,
      alarm_enabled,
      alarm_duration_seconds,
      alarm_sound,
      pre_capture_delay_seconds,
      active
    } = body;

    if (!camera_id || !name || !capture_time) {
      return NextResponse.json(
        { success: false, error: 'camera_id, name, and capture_time are required' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO capture_schedules 
      (camera_id, name, capture_time, days_of_week, alarm_enabled, 
       alarm_duration_seconds, alarm_sound, pre_capture_delay_seconds, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(insertQuery, [
      camera_id,
      name,
      capture_time,
      days_of_week || '1,2,3,4,5', // Default: Monday-Friday
      alarm_enabled !== undefined ? alarm_enabled : true,
      alarm_duration_seconds || 10,
      alarm_sound || 'default.mp3',
      pre_capture_delay_seconds || 300, // Default: 5 minutes
      active !== undefined ? active : true
    ]);

    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      data: { id: (result as any).insertId }
    });

  } catch (error: any) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
