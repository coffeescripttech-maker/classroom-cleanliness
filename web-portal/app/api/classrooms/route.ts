import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Classroom, ApiResponse, PaginatedResponse } from '@/types';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/classrooms - List all classrooms
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const grade_level_id = searchParams.get('grade_level_id');
    const active = searchParams.get('active');
    
    const offset = (page - 1) * limit;
    
    // Build query
    let whereConditions = [];
    let params: any[] = [];
    
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.building LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (grade_level_id) {
      whereConditions.push('s.grade_level_id = ?');
      params.push(grade_level_id);
    }
    
    if (active !== null && active !== undefined) {
      whereConditions.push('c.active = ?');
      params.push(active === 'true' ? 1 : 0);
    }
    
    // Class presidents can only see their own classroom
    if (user.role === 'class_president' && user.classroom_id) {
      whereConditions.push('c.id = ?');
      params.push(user.classroom_id);
    }
    
    // Students cannot access classroom details
    if (user.role === 'student') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM classrooms c
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      ${whereClause}
    `;
    
    const [countResult] = await query<any[]>(countQuery, params);
    const total = countResult.total;
    
    // Get paginated data
    const dataQuery = `
      SELECT 
        c.*,
        s.name as section_name,
        s.room_number,
        g.name as grade_level_name,
        g.level as grade_level
      FROM classrooms c
      LEFT JOIN sections s ON c.section_id = s.id
      LEFT JOIN grade_levels g ON s.grade_level_id = g.id
      ${whereClause}
      ORDER BY g.level, s.name, c.name
      LIMIT ? OFFSET ?
    `;
    
    const classrooms = await query<Classroom[]>(
      dataQuery,
      [...params, limit, offset]
    );
    
    const response: PaginatedResponse<Classroom> = {
      data: classrooms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/classrooms - Create new classroom
export async function POST(request: NextRequest) {
  try {
    // Only admin can create classrooms
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { section_id, name, building, floor, capacity, active } = body;
    
    // Validation
    if (!section_id || !name) {
      return NextResponse.json(
        { success: false, error: 'section_id and name are required' },
        { status: 400 }
      );
    }
    
    const insertQuery = `
      INSERT INTO classrooms (section_id, name, building, floor, capacity, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query<any>(insertQuery, [
      section_id,
      name,
      building || null,
      floor || null,
      capacity || null,
      active ? 1 : 0,
    ]);
    
    // Get the created classroom
    const classroom = await query<Classroom[]>(
      'SELECT * FROM classrooms WHERE id = ?',
      [result.insertId]
    );
    
    const response: ApiResponse<Classroom> = {
      success: true,
      data: classroom[0],
      message: 'Classroom created successfully',
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Error creating classroom:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
