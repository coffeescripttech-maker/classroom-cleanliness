/**
 * Alter existing users table to add authentication columns
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'classroom_cleanliness'
};

async function alterUsersTable() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ Connected to database\n');
    
    // Check existing columns
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [DB_CONFIG.database]);
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    console.log('Existing columns:', existingColumns.join(', '));
    console.log('');
    
    // Add missing columns
    const columnsToAdd = [
      {
        name: 'classroom_id',
        sql: 'ADD COLUMN classroom_id INT NULL AFTER role'
      },
      {
        name: 'active',
        sql: 'ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER email'
      },
      {
        name: 'last_login',
        sql: 'ADD COLUMN last_login TIMESTAMP NULL AFTER active'
      }
    ];
    
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adding column: ${col.name}...`);
        await connection.query(`ALTER TABLE users ${col.sql}`);
        console.log(`✓ Added ${col.name}`);
      } else {
        console.log(`✓ Column ${col.name} already exists`);
      }
    }
    
    // Modify role column if needed
    console.log('\nUpdating role column...');
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'class_president', 'student') DEFAULT 'student'
    `);
    console.log('✓ Role column updated');
    
    console.log('\n========================================');
    console.log('Users Table Updated Successfully!');
    console.log('========================================\n');
    console.log('Next step: Run seed-auth.js to create default users');
    console.log('Command: node database/seed-auth.js\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  alterUsersTable();
}

module.exports = { alterUsersTable };
