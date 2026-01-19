/**
 * Run Authentication Migration
 * Creates users and sessions tables
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'classroom_cleanliness',
  multipleStatements: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ Connected to database\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'create_auth_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    await connection.query(sql);
    console.log('✓ Migration completed\n');
    
    // Check if tables were created
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      console.log('✓ users table created');
    }
    
    const [sessionTables] = await connection.query("SHOW TABLES LIKE 'sessions'");
    if (sessionTables.length > 0) {
      console.log('✓ sessions table created');
    }
    
    console.log('\n========================================');
    console.log('Migration Completed Successfully!');
    console.log('========================================\n');
    console.log('Next step: Run seed-auth.js to create default users');
    console.log('Command: node database/seed-auth.js\n');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
