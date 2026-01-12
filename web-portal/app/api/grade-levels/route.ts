import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const gradeLevels = await query(`
      SELECT id, name, level, school_id
      FROM grade_levels
      ORDER BY level ASC
    `);

    return NextResponse.json(gradeLevels);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade levels' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, level, school_id } = body;

    const result = await query(
      'INSERT INTO grade_levels (name, level, school_id) VALUES (?, ?, ?)',
      [name, level, school_id || 1]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      name,
      level,
      school_id: school_id || 1
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create grade level' },
      { status: 500 }
    );
  }
}
