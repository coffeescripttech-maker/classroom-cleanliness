-- Classroom Cleanliness Monitoring System Database Schema
-- MySQL Database

-- Create Database
CREATE DATABASE IF NOT EXISTS classroom_cleanliness;
USE classroom_cleanliness;

-- Schools/Organizations
CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Grade Levels
CREATE TABLE grade_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  INDEX idx_school (school_id)
);

-- Sections
CREATE TABLE sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  grade_level_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  room_number VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
  INDEX idx_grade_level (grade_level_id)
);

-- Classrooms
CREATE TABLE classrooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  building VARCHAR(50),
  floor INT,
  capacity INT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  INDEX idx_section (section_id),
  INDEX idx_active (active)
);

-- Cameras
CREATE TABLE cameras (
  id INT PRIMARY KEY AUTO_INCREMENT,
  classroom_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  port INT DEFAULT 554,
  rtsp_path VARCHAR(255) DEFAULT '/cam/realmonitor?channel=1&subtype=0',
  username VARCHAR(100),
  password VARCHAR(255),
  status ENUM('active', 'inactive', 'error') DEFAULT 'active',
  last_capture TIMESTAMP NULL,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  INDEX idx_classroom (classroom_id),
  INDEX idx_status (status)
);

-- Capture Schedules
CREATE TABLE capture_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  camera_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  capture_time TIME NOT NULL,
  days_of_week VARCHAR(20) DEFAULT '1,2,3,4,5',
  alarm_enabled BOOLEAN DEFAULT TRUE,
  alarm_duration_seconds INT DEFAULT 10,
  alarm_sound VARCHAR(100) DEFAULT 'default.mp3',
  pre_capture_delay_seconds INT DEFAULT 300,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE,
  INDEX idx_camera (camera_id),
  INDEX idx_active (active),
  INDEX idx_time (capture_time)
);

-- Captured Images
CREATE TABLE captured_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  classroom_id INT NOT NULL,
  schedule_id INT,
  image_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_size INT,
  width INT,
  height INT,
  captured_at TIMESTAMP NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES capture_schedules(id) ON DELETE SET NULL,
  INDEX idx_classroom (classroom_id),
  INDEX idx_captured_at (captured_at),
  INDEX idx_schedule (schedule_id)
);

-- Cleanliness Scores
CREATE TABLE cleanliness_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  image_id INT NOT NULL,
  classroom_id INT NOT NULL,
  floor_score DECIMAL(4,2) DEFAULT 0,
  furniture_score DECIMAL(4,2) DEFAULT 0,
  trash_score DECIMAL(4,2) DEFAULT 0,
  wall_score DECIMAL(4,2) DEFAULT 0,
  clutter_score DECIMAL(4,2) DEFAULT 0,
  total_score DECIMAL(5,2) DEFAULT 0,
  rating ENUM('Excellent', 'Good', 'Fair', 'Poor') NOT NULL,
  detected_objects JSON,
  annotated_image_path VARCHAR(255) NULL,
  analysis_details JSON,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (image_id) REFERENCES captured_images(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  INDEX idx_classroom_date (classroom_id, analyzed_at),
  INDEX idx_total_score (total_score),
  INDEX idx_rating (rating)
);

-- Image Comparisons (Before/After)
CREATE TABLE image_comparisons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  before_image_id INT NOT NULL,
  after_image_id INT NOT NULL,
  classroom_id INT NOT NULL,
  improvement_score DECIMAL(5,2),
  changes_detected JSON,
  comparison_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (before_image_id) REFERENCES captured_images(id) ON DELETE CASCADE,
  FOREIGN KEY (after_image_id) REFERENCES captured_images(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  INDEX idx_classroom (classroom_id),
  INDEX idx_created_at (created_at)
);

-- Users (Admin)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'viewer') DEFAULT 'viewer',
  full_name VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Activity Logs
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action (action)
);

-- System Settings
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
);

-- Insert Default Data
INSERT INTO schools (name, address) VALUES 
('Sample High School', '123 Education Street, City, Country');

INSERT INTO users (username, email, password_hash, role, full_name) VALUES 
('admin', 'admin@school.com', '$2a$10$YourHashedPasswordHere', 'admin', 'System Administrator');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('alarm_default_sound', 'default.mp3', 'Default alarm sound file'),
('alarm_default_duration', '10', 'Default alarm duration in seconds'),
('pre_capture_delay', '300', 'Default pre-capture delay in seconds (5 minutes)'),
('image_retention_days', '90', 'Number of days to keep images'),
('leaderboard_update_interval', '300', 'Leaderboard update interval in seconds');
