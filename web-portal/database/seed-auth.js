/**
 * Seed Authentication Data
 * Creates default admin user and sample users for testing
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'classroom_cleanliness'
};

async function seedAuthData() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ Connected to database\n');
    
    // Hash passwords
    console.log('Hashing passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const presidentPassword = await bcrypt.hash('president123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    console.log('✓ Passwords hashed\n');
    
    // Get a classroom ID for class president
    const [classrooms] = await connection.query(
      'SELECT id FROM classrooms LIMIT 1'
    );
    const classroomId = classrooms.length > 0 ? classrooms[0].id : null;
    
    // Insert users
    console.log('Creating users...');
    
    // Admin user
    await connection.query(`
      INSERT INTO users (username, password_hash, role, full_name, email)
      VALUES (?, ?, 'admin', 'System Administrator', 'admin@school.edu')
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        full_name = VALUES(full_name),
        email = VALUES(email)
    `, ['admin', adminPassword]);
    console.log('✓ Admin user created (username: admin, password: admin123)');
    
    // Class President user (if classroom exists)
    if (classroomId) {
      await connection.query(`
        INSERT INTO users (username, password_hash, role, full_name, email, classroom_id)
        VALUES (?, ?, 'class_president', 'Juan Dela Cruz', 'juan@school.edu', ?)
        ON DUPLICATE KEY UPDATE 
          password_hash = VALUES(password_hash),
          full_name = VALUES(full_name),
          email = VALUES(email),
          classroom_id = VALUES(classroom_id)
      `, ['president1', presidentPassword, classroomId]);
      console.log('✓ Class President user created (username: president1, password: president123)');
    }
    
    // Student user
    await connection.query(`
      INSERT INTO users (username, password_hash, role, full_name, email)
      VALUES (?, ?, 'student', 'Maria Santos', 'maria@school.edu')
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        full_name = VALUES(full_name),
        email = VALUES(email)
    `, ['student1', studentPassword]);
    console.log('✓ Student user created (username: student1, password: student123)');
    
    console.log('\n========================================');
    console.log('Authentication Data Seeded Successfully!');
    console.log('========================================');
    console.log('\nDefault Credentials:');
    console.log('-------------------');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    if (classroomId) {
      console.log('Class President:');
      console.log('  Username: president1');
      console.log('  Password: president123');
      console.log('');
    }
    console.log('Student:');
    console.log('  Username: student1');
    console.log('  Password: student123');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('Error seeding auth data:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  seedAuthData();
}

module.exports = { seedAuthData };
