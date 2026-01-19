import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'class_president' | 'student';
  classroom_id: number | null;
  full_name: string;
  email: string | null;
  active: boolean;
  last_login: Date | null;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
}

/**
 * Generate a secure random session ID
 */
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get user by username (includes password_hash for authentication)
 */
async function getUserByUsernameWithPassword(username: string): Promise<any | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? AND active = TRUE',
      [username]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0];
  } finally {
    connection.release();
  }
}

/**
 * Get user by username (without password_hash)
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT id, username, role, classroom_id, full_name, email, active, last_login, created_at FROM users WHERE username = ? AND active = TRUE',
      [username]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0] as User;
  } finally {
    connection.release();
  }
}

/**
 * Get user by ID (without password_hash)
 */
export async function getUserById(userId: number): Promise<User | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT id, username, role, classroom_id, full_name, email, active, last_login, created_at FROM users WHERE id = ? AND active = TRUE',
      [userId]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0] as User;
  } finally {
    connection.release();
  }
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number): Promise<string> {
  const connection = await pool.getConnection();
  try {
    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    await connection.query(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, userId, expiresAt]
    );
    
    return sessionId;
  } finally {
    connection.release();
  }
}

/**
 * Get user by session ID (without password_hash)
 */
export async function getUserBySession(sessionId: string): Promise<User | null> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT u.id, u.username, u.role, u.classroom_id, u.full_name, u.email, u.active, u.last_login, u.created_at 
       FROM users u
       JOIN sessions s ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > NOW() AND u.active = TRUE`,
      [sessionId]
    );
    
    if (rows.length === 0) return null;
    
    return rows[0] as User;
  } finally {
    connection.release();
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM sessions WHERE id = ?', [sessionId]);
  } finally {
    connection.release();
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: number): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userId]
    );
  } finally {
    connection.release();
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query('DELETE FROM sessions WHERE expires_at < NOW()');
  } finally {
    connection.release();
  }
}

/**
 * Login user with username and password
 */
export async function login(username: string, password: string): Promise<User | null> {
  const userWithPassword = await getUserByUsernameWithPassword(username);
  if (!userWithPassword) return null;
  
  // Get password hash from user object
  const passwordHash = userWithPassword.password_hash;
  if (!passwordHash) return null;
  
  // Verify password
  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) return null;
  
  // Create session
  const sessionId = await createSession(userWithPassword.id);
  
  // Update last login
  await updateLastLogin(userWithPassword.id);
  
  // Set cookie
  cookies().set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
  
  // Return user without password_hash
  const user = await getUserByUsername(username);
  return user;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const sessionId = cookies().get('session')?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  cookies().delete('session');
}

/**
 * Get current logged-in user
 */
export async function getCurrentUser(): Promise<User | null> {
  const sessionId = cookies().get('session')?.value;
  if (!sessionId) return null;
  
  return await getUserBySession(sessionId);
}

/**
 * Check if user has permission to access a classroom
 */
export async function canAccessClassroom(user: User | null, classroomId: number): Promise<boolean> {
  if (!user) return false;
  
  // Admin can access all
  if (user.role === 'admin') return true;
  
  // Class president can only access their classroom
  if (user.role === 'class_president') {
    return user.classroom_id === classroomId;
  }
  
  // Students cannot access classroom details
  return false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user is class president
 */
export function isClassPresident(user: User | null): boolean {
  return user?.role === 'class_president';
}

/**
 * Hash password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
