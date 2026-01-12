-- Seed data for testing the classroom management system

-- Insert a default school
INSERT INTO schools (id, name, address) VALUES 
(1, 'Sample High School', '123 Education Street, City, State');

-- Insert grade levels
INSERT INTO grade_levels (id, school_id, name, level) VALUES
(1, 1, 'Grade 7', 7),
(2, 1, 'Grade 8', 8),
(3, 1, 'Grade 9', 9),
(4, 1, 'Grade 10', 10);

-- Insert sections
INSERT INTO sections (id, grade_level_id, name, room_number) VALUES
(1, 1, 'Section A', '101'),
(2, 1, 'Section B', '102'),
(3, 1, 'Section C', '103'),
(4, 2, 'Section A', '201'),
(5, 2, 'Section B', '202'),
(6, 2, 'Section C', '203'),
(7, 3, 'Section A', '301'),
(8, 3, 'Section B', '302'),
(9, 3, 'Section C', '303'),
(10, 4, 'Section A', '401'),
(11, 4, 'Section B', '402');

-- Insert sample classrooms
INSERT INTO classrooms (section_id, name, building, floor, capacity, active) VALUES
(1, 'Room 101', 'Main Building', 1, 40, TRUE),
(2, 'Room 102', 'Main Building', 1, 40, TRUE),
(3, 'Room 103', 'Main Building', 1, 35, TRUE),
(4, 'Room 201', 'Main Building', 2, 40, TRUE),
(5, 'Room 202', 'Main Building', 2, 40, TRUE),
(6, 'Room 203', 'Main Building', 2, 35, TRUE),
(7, 'Room 301', 'Science Building', 3, 45, TRUE),
(8, 'Room 302', 'Science Building', 3, 45, TRUE),
(9, 'Room 303', 'Science Building', 3, 40, TRUE),
(10, 'Room 401', 'Arts Building', 4, 30, TRUE),
(11, 'Room 402', 'Arts Building', 4, 30, TRUE);

-- Insert sample cameras (using actual classroom IDs from above inserts)
INSERT INTO cameras (classroom_id, name, ip_address, port, status) VALUES
((SELECT id FROM classrooms WHERE name = 'Room 101'), 'Camera 101', '192.168.1.101', 8080, 'active'),
((SELECT id FROM classrooms WHERE name = 'Room 102'), 'Camera 102', '192.168.1.102', 8080, 'active'),
((SELECT id FROM classrooms WHERE name = 'Room 201'), 'Camera 201', '192.168.1.201', 8080, 'active'),
((SELECT id FROM classrooms WHERE name = 'Room 301'), 'Camera 301', '192.168.1.301', 8080, 'active');

-- Insert sample schedules (using actual camera IDs)
INSERT INTO capture_schedules (camera_id, name, capture_time, days_of_week, alarm_enabled, pre_capture_delay_seconds, active) VALUES
((SELECT id FROM cameras WHERE name = 'Camera 101'), 'Morning Capture', '08:00:00', '1,2,3,4,5', TRUE, 300, TRUE),
((SELECT id FROM cameras WHERE name = 'Camera 101'), 'Afternoon Capture', '14:00:00', '1,2,3,4,5', TRUE, 300, TRUE),
((SELECT id FROM cameras WHERE name = 'Camera 102'), 'Morning Capture', '08:00:00', '1,2,3,4,5', TRUE, 300, TRUE),
((SELECT id FROM cameras WHERE name = 'Camera 201'), 'Morning Capture', '08:00:00', '1,2,3,4,5', TRUE, 300, TRUE);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, full_name, active) VALUES
('admin', 'admin@school.com', '$2a$10$rKZvVqVvVqVvVqVvVqVvVeVqVvVqVvVqVvVqVvVqVvVqVvVqVvVqV', 'admin', 'System Administrator', TRUE);

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('alarm_sound', 'default.mp3', 'Default alarm sound file'),
('alarm_duration', '10', 'Alarm duration in seconds'),
('image_retention_days', '90', 'Number of days to keep images'),
('analysis_auto_trigger', 'true', 'Automatically trigger AI analysis on capture');
