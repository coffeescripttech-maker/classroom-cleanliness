-- User Authentication Tables
-- Run this migration to add user authentication support

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'class_president', 'student') DEFAULT 'student',
  classroom_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_classroom (classroom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (username, password_hash, role, full_name, email) 
VALUES (
  'admin', 
  '$2a$10$rKZLQqZqZqZqZqZqZqZqZeJ5vXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  'admin', 
  'System Administrator',
  'admin@school.edu'
) ON DUPLICATE KEY UPDATE username=username;

-- Note: The actual password hash will be generated properly in the seed script
