import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    console.log('[LOGIN] Attempt for username:', username);
    
    // Validate input
    if (!username || !password) {
      console.log('[LOGIN] Missing credentials');
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Attempt login
    console.log('[LOGIN] Calling login function...');
    const user = await login(username, password);
    
    if (!user) {
      console.log('[LOGIN] Invalid credentials');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    console.log('[LOGIN] Success for user:', user.username);
    
    // Return user info (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        classroom_id: user.classroom_id
      }
    });
    
  } catch (error: any) {
    console.error('[LOGIN] Error:', error);
    console.error('[LOGIN] Stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
