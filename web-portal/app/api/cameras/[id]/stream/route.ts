import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cameraId = params.id;

    // Get camera details
    const cameras = await query<any[]>(
      `SELECT c.*, cl.name as classroom_name
       FROM cameras c
       LEFT JOIN classrooms cl ON c.classroom_id = cl.id
       WHERE c.id = ?`,
      [cameraId]
    );

    if (cameras.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Camera not found' },
        { status: 404 }
      );
    }

    const camera = cameras[0];

    // Call Python API to get stream URL
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
    const streamUrl = `${pythonApiUrl}/api/camera/stream/${cameraId}`;

    // Return stream proxy info
    return NextResponse.json({
      success: true,
      data: {
        streamUrl,
        camera: {
          id: camera.id,
          name: camera.name,
          classroom: camera.classroom_name,
          rtspUrl: `rtsp://${camera.username}:***@${camera.ip_address}:${camera.port}${camera.rtsp_path || '/cam/realmonitor?channel=1&subtype=0'}`
        }
      }
    });

  } catch (error: any) {
    console.error('Stream error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
