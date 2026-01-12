import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get camera details
    const cameras = await query<any[]>(
      'SELECT * FROM cameras WHERE id = ?',
      [params.id]
    );

    if (cameras.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Camera not found' },
        { status: 404 }
      );
    }

    const camera = cameras[0];

    // Validate IP address format
    const isValidIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(camera.ip_address);
    
    if (!isValidIP) {
      await query(
        'UPDATE cameras SET status = ? WHERE id = ?',
        ['error', params.id]
      );

      return NextResponse.json({
        success: false,
        error: 'Invalid IP address format'
      });
    }

    // Validate port range
    if (camera.port < 1 || camera.port > 65535) {
      await query(
        'UPDATE cameras SET status = ? WHERE id = ?',
        ['error', params.id]
      );

      return NextResponse.json({
        success: false,
        error: 'Invalid port number (must be 1-65535)'
      });
    }

    // Validate RTSP path
    if (!camera.rtsp_path || camera.rtsp_path.trim() === '') {
      await query(
        'UPDATE cameras SET status = ? WHERE id = ?',
        ['error', params.id]
      );

      return NextResponse.json({
        success: false,
        error: 'RTSP path is required'
      });
    }

    // Validate credentials
    if (!camera.username || !camera.password) {
      await query(
        'UPDATE cameras SET status = ? WHERE id = ?',
        ['error', params.id]
      );

      return NextResponse.json({
        success: false,
        error: 'Username and password are required for Dahua cameras'
      });
    }

    // Build RTSP URL
    const rtspUrl = `rtsp://${camera.username}:${camera.password}@${camera.ip_address}:${camera.port}${camera.rtsp_path}`;

    // NOTE: Actual RTSP connection testing requires additional libraries like ffmpeg or opencv
    // For now, we validate the configuration and provide the RTSP URL
    // In production, you would use Python script with opencv-python or ffmpeg to test the stream
    
    // Update status to active since configuration is valid
    await query(
      'UPDATE cameras SET status = ?, last_capture = NOW() WHERE id = ?',
      ['active', params.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Camera configuration validated successfully',
      data: {
        ip_address: camera.ip_address,
        port: camera.port,
        rtsp_path: camera.rtsp_path,
        rtsp_url: rtspUrl.replace(camera.password, '****'), // Hide password in response
        status: 'active',
        note: 'Configuration validated. To test actual RTSP stream, use Python script with OpenCV or FFmpeg.'
      }
    });

  } catch (error: any) {
    console.error('Error testing camera:', error);
    
    // Update status to error
    await query(
      'UPDATE cameras SET status = ? WHERE id = ?',
      ['error', params.id]
    );

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
