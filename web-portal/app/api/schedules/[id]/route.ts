import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/schedules/[id] - Get schedule details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleQuery = `
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
      WHERE cs.id = ?
    `;

    const schedules = await query<any[]>(scheduleQuery, [params.id]);

    if (schedules.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedules[0]
    });

  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updateQuery = `
      UPDATE capture_schedules
      SET 
        camera_id = ?,
        name = ?,
        capture_time = ?,
        days_of_week = ?,
        alarm_enabled = ?,
        alarm_duration_seconds = ?,
        alarm_sound = ?,
        pre_capture_delay_seconds = ?,
        active = ?
      WHERE id = ?
    `;

    await query(updateQuery, [
      camera_id,
      name,
      capture_time,
      days_of_week,
      alarm_enabled,
      alarm_duration_seconds,
      alarm_sound,
      pre_capture_delay_seconds,
      active,
      params.id
    ]);

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM capture_schedules WHERE id = ?', [params.id]);

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
