import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cameraQuery = `
      SELECT 
        cam.*,
        c.name as classroom_name,
        s.name as section_name,
        g.name as grade_level
      FROM cameras cam
      LEFT JOIN classrooms c ON cam.classroom_id = c.id
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      WHERE cam.id = ?
    `;
    
    const cameras = await query<any[]>(cameraQuery, [params.id]);
    
    if (cameras.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Camera not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: cameras[0] });
  } catch (error: any) {
    console.error('Error fetching camera:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { classroom_id, name, ip_address, port, username, password, rtsp_path, status } = body;

    const updateQuery = `
      UPDATE cameras
      SET 
        classroom_id = ?,
        name = ?,
        ip_address = ?,
        port = ?,
        username = ?,
        password = ?,
        rtsp_path = ?,
        status = ?
      WHERE id = ?
    `;

    await query(updateQuery, [
      classroom_id,
      name,
      ip_address,
      port || 554,
      username || 'admin',
      password || null,
      rtsp_path || '/cam/realmonitor?channel=1&subtype=0',
      status || 'active',
      params.id
    ]);

    return NextResponse.json({
      success: true,
      message: 'Camera updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating camera:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM cameras WHERE id = ?', [params.id]);
    
    return NextResponse.json({
      success: true,
      message: 'Camera deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting camera:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
