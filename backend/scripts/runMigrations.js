const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../../database/migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir).sort();
    
    console.log('Running migrations...\n');
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        try {
          await pool.query(sql);
          console.log(`✓ ${file} completed successfully\n`);
        } catch (error) {
          console.error(`✗ ${file} failed:`, error.message, '\n');
        }
      }
    }
    
    console.log('All migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
