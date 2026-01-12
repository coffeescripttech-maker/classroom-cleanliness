import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

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

    // Build RTSP URL
    const rtspUrl = `rtsp://${camera.username}:${camera.password}@${camera.ip_address}:${camera.port}${camera.rtsp_path}`;

    try {
      // Get the correct path to the Python script
      // When running from Next.js, cwd is the project root (CLEANLENESS folder)
      const scriptPath = path.join(process.cwd(), 'web-portal', 'python-api', 'rtsp_capture.py');
      
      // Call Python script to test RTSP connection
      const { stdout, stderr } = await execAsync(
        `python "${scriptPath}" test "${rtspUrl}"`,
        { timeout: 15000 } // 15 second timeout
      );

      const result = JSON.parse(stdout);

      if (result.success) {
        // Update camera status to active
        await query(
          'UPDATE cameras SET status = ?, last_capture = NOW() WHERE id = ?',
          ['active', params.id]
        );

        return NextResponse.json({
          success: true,
          message: 'RTSP stream test successful',
          data: {
            ...result.data,
            camera_id: camera.id,
            camera_name: camera.name
          }
        });
      } else {
        // Update camera status to error
        await query(
          'UPDATE cameras SET status = ? WHERE id = ?',
          ['error', params.id]
        );

        return NextResponse.json({
          success: false,
          error: result.error || 'RTSP stream test failed'
        });
      }

    } catch (execError: any) {
      // Update camera status to error
      await query(
        'UPDATE cameras SET status = ? WHERE id = ?',
        ['error', params.id]
      );

      return NextResponse.json({
        success: false,
        error: `Failed to test RTSP stream: ${execError.message}. Make sure OpenCV is installed (pip install opencv-python).`
      });
    }

  } catch (error: any) {
    console.error('Error testing camera stream:', error);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
