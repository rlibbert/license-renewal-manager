const db = require('./database/db');

async function checkDatabase() {
  try {
    console.log('Checking database...');
    
    // Check users table
    const users = await db.query('SELECT * FROM users');
    console.log('Users:', users.rows);
    
    // Check licenses table
    const licenses = await db.query('SELECT * FROM licenses LIMIT 2');
    console.log('Licenses (sample):', licenses.rows);
    
    // Close database connection
    await db.end();
    
    console.log('Database check completed');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check
checkDatabase();
