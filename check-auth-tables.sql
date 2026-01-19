-- Check if authentication tables exist
USE classroom_cleanliness;

SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'sessions';

-- If tables exist, show their structure
DESCRIBE users;
DESCRIBE sessions;

-- Show existing users
SELECT id, username, role, full_name, active, created_at FROM users;
