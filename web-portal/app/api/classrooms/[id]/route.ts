import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Classroom, ApiResponse } from '@/types';

// GET /api/classrooms/[id] - Get classroom by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const classroomQuery = `
      SELECT 
        c.*,
        s.name as section_name,
        s.room_number,
        g.name as grade_level_name,
        g.level as grade_level,
        (SELECT COUNT(*) FROM cameras WHERE classroom_id = c.id) as camera_count,
        (SELECT COUNT(*) FROM captured_images WHERE classroom_id = c.id) as image_count
      FROM classrooms c
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      WHERE c.id = ?
    `;
    
    const classrooms = await query<Classroom[]>(classroomQuery, [id]);
    
    if (classrooms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Classroom not found' },
        { status: 404 }
      );
    }
    
    const response: ApiResponse<Classroom> = {
      success: true,
      data: classrooms[0],
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/classrooms/[id] - Update classroom
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { section_id, name, building, floor, capacity, active } = body;
    
    const updateQuery = `
      UPDATE classrooms
      SET 
        section_id = ?,
        name = ?,
        building = ?,
        floor = ?,
        capacity = ?,
        active = ?
      WHERE id = ?
    `;
    
    await query(updateQuery, [
      section_id,
      name,
      building || null,
      floor || null,
      capacity || null,
      active ? 1 : 0,
      id,
    ]);
    
    // Get updated classroom
    const classroom = await query<Classroom[]>(
      'SELECT * FROM classrooms WHERE id = ?',
      [id]
    );
    
    const response: ApiResponse<Classroom> = {
      success: true,
      data: classroom[0],
      message: 'Classroom updated successfully',
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating classroom:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/classrooms/[id] - Delete classroom
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    await query('DELETE FROM classrooms WHERE id = ?', [id]);
    
    const response: ApiResponse = {
      success: true,
      message: 'Classroom deleted successfully',
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
