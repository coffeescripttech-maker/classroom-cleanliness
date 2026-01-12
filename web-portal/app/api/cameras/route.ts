import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const camerasQuery = `
      SELECT 
        cam.*,
        c.name as classroom_name,
        s.name as section_name,
        g.name as grade_level
      FROM cameras cam
      LEFT JOIN classrooms c ON cam.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      ORDER BY cam.created_at DESC
    `;
    
    const cameras = await query<any[]>(camerasQuery);
    
    return NextResponse.json(cameras);
  } catch (error: any) {
    console.error('Error fetching cameras:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classroom_id, name, ip_address, port, rtsp_path, username, password, status } = body;

    if (!classroom_id || !name || !ip_address) {
      return NextResponse.json(
        { success: false, error: 'classroom_id, name, and ip_address are required' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO cameras 
      (classroom_id, name, ip_address, port, rtsp_path, username, password, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query<any>(insertQuery, [
      classroom_id,
      name,
      ip_address,
      port || 554,
      rtsp_path || '/cam/realmonitor?channel=1&subtype=0',
      username || null,
      password || null,
      status || 'active'
    ]);

    return NextResponse.json({
      success: true,
      data: { id: result.insertId },
      message: 'Camera created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating camera:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
