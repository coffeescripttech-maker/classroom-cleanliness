import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sections = await query(`
      SELECT s.id, s.name, s.grade_level_id, s.room_number,
             gl.name as grade_level_name, gl.level
      FROM sections s
      LEFT JOIN grade_levels gl ON s.grade_level_id = gl.id
      ORDER BY gl.level ASC, s.name ASC
    `);

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grade_level_id, room_number } = body;

    const result = await query(
      'INSERT INTO sections (name, grade_level_id, room_number) VALUES (?, ?, ?)',
      [name, grade_level_id, room_number || null]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      name,
      grade_level_id,
      room_number
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    );
  }
}
