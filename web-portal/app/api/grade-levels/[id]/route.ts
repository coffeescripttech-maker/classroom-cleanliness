import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query('SELECT * FROM grade_levels WHERE id = ?', [params.id]);
    const grades = result as any[];
    
    if (grades.length === 0) {
      return NextResponse.json({ error: 'Grade level not found' }, { status: 404 });
    }
    
    return NextResponse.json(grades[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch grade level' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, level, school_id } = body;

    await query(
      'UPDATE grade_levels SET name = ?, level = ?, school_id = ? WHERE id = ?',
      [name, level, school_id || 1, params.id]
    );

    return NextResponse.json({ success: true, message: 'Grade level updated' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update grade level' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM grade_levels WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Grade level deleted' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete grade level' }, { status: 500 });
  }
}
