import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query('SELECT * FROM sections WHERE id = ?', [params.id]);
    const sections = result as any[];
    
    if (sections.length === 0) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }
    
    return NextResponse.json(sections[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, grade_level_id, room_number } = body;

    await query(
      'UPDATE sections SET name = ?, grade_level_id = ?, room_number = ? WHERE id = ?',
      [name, grade_level_id, room_number || null, params.id]
    );

    return NextResponse.json({ success: true, message: 'Section updated' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM sections WHERE id = ?', [params.id]);
    return NextResponse.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
