import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const classroom_id = formData.get('classroom_id') as string;

    if (!file || !classroom_id) {
      return NextResponse.json(
        { success: false, error: 'Image and classroom_id are required' },
        { status: 400 }
      );
    }

    // Get classroom info for folder structure
    const classrooms = await query<any[]>(
      `SELECT c.*, s.name as section_name, g.name as grade_level
       FROM classrooms c
       LEFT JOIN sections s ON c.section_id = s.id
       LEFT JOIN grade_levels g ON s.grade_level_id = g.id
       WHERE c.id = ?`,
      [classroom_id]
    );

    if (classrooms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Classroom not found' },
        { status: 404 }
      );
    }

    const classroom = classrooms[0];
    
    // Create folder structure: Grade-X/Section-Y/YYYY-MM-DD/
    const gradeFolder = classroom.grade_level.replace(/\s+/g, '-');
    const sectionFolder = classroom.section_name.replace(/\s+/g, '-');
    const now = new Date();
    const dateFolder = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const filename = `original_${timeStr}.jpg`;
    
    const relativePath = `${gradeFolder}/${sectionFolder}/${dateFolder}/${filename}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', gradeFolder, sectionFolder, dateFolder);
    const filePath = join(uploadDir, filename);

    // Create directories if they don't exist
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get image dimensions (simplified - you might want to use sharp library)
    const fileSize = buffer.length;

    // Insert into database
    const result = await query<any>(
      `INSERT INTO captured_images 
       (classroom_id, image_path, captured_at, file_size, width, height)
       VALUES (?, ?, NOW(), ?, 0, 0)`,
      [classroom_id, relativePath, fileSize]
    );

    const imageId = result.insertId;

    // Process face detection asynchronously (don't wait for it)
    const absolutePath = filePath;
    processFaceDetection(imageId, absolutePath, relativePath).catch(err => {
      console.error('Face detection error:', err);
    });

    return NextResponse.json({
      success: true,
      data: {
        id: imageId,
        image_path: relativePath
      },
      message: 'Image uploaded successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Process face detection in background
async function processFaceDetection(imageId: number, imagePath: string, relativePath: string) {
  try {
    // Call Python API to process face detection
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${pythonApiUrl}/detect-faces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_id: imageId,
        image_path: imagePath,
        relative_path: relativePath
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`Face detection completed for image ${imageId}: ${result.faces_detected} faces`);
    } else {
      console.error(`Face detection failed for image ${imageId}`);
    }
  } catch (error) {
    console.error('Face detection request failed:', error);
  }
}
