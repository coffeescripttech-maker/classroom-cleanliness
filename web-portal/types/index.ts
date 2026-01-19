// Type definitions for the application

export interface School {
  id: number;
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GradeLevel {
  id: number;
  school_id: number;
  name: string;
  level: number;
  active: boolean;
  created_at: Date;
}

export interface Section {
  id: number;
  grade_level_id: number;
  name: string;
  room_number?: string;
  active: boolean;
  created_at: Date;
}

export interface Classroom {
  id: number;
  section_id: number;
  name: string;
  building?: string;
  floor?: number;
  capacity?: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined data
  section?: Section;
  grade_level?: GradeLevel;
}

export interface Camera {
  id: number;
  classroom_id: number;
  name: string;
  ip_address?: string;
  port: number;
  username?: string;
  password?: string;
  status: 'active' | 'inactive' | 'error';
  last_capture?: Date;
  last_error?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CaptureSchedule {
  id: number;
  camera_id: number;
  name: string;
  capture_time: string;
  days_of_week: string;
  alarm_enabled: boolean;
  alarm_duration_seconds: number;
  alarm_sound: string;
  pre_capture_delay_seconds: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined data
  camera?: Camera;
  classroom?: Classroom;
}

export interface CapturedImage {
  id: number;
  classroom_id: number;
  schedule_id?: number;
  image_path: string;
  thumbnail_path?: string;
  file_size?: number;
  width?: number;
  height?: number;
  captured_at: Date;
  uploaded_at: Date;
  // Joined data
  classroom?: Classroom;
  score?: CleanlinessScore;
}

export interface CleanlinessScore {
  id: number;
  image_id: number;
  classroom_id: number;
  floor_score: number;
  furniture_score: number;
  trash_score: number;
  wall_score: number;
  clutter_score: number;
  total_score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  detected_objects?: any;
  analysis_details?: any;
  analyzed_at: Date;
  // Joined data
  image?: CapturedImage;
  classroom?: Classroom;
}

export interface ImageComparison {
  id: number;
  before_image_id: number;
  after_image_id: number;
  classroom_id: number;
  improvement_score?: number;
  changes_detected?: any;
  comparison_notes?: string;
  created_at: Date;
  // Joined data
  before_image?: CapturedImage;
  after_image?: CapturedImage;
  classroom?: Classroom;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  role: 'admin' | 'class_president' | 'student';
  classroom_id: number | null;
  full_name: string;
  active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: any;
  ip_address?: string;
  created_at: Date;
  // Joined data
  user?: User;
}

export interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value?: string;
  description?: string;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  classroom_id: number;
  classroom_name: string;
  grade_level: string;
  section: string;
  total_score: number;
  rating: string;
  latest_capture: Date;
  improvement?: number;
}

// Dashboard stats
export interface DashboardStats {
  total_classrooms: number;
  active_cameras: number;
  today_captures: number;
  average_score: number;
  excellent_count: number;
  good_count: number;
  fair_count: number;
  poor_count: number;
}
