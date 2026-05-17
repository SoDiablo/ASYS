const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    console.log('Creating admin user...');
    
    // Hash the password properly
    const password = 'Admin123456';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert or update admin user
    const query = `
      INSERT INTO users (name, email, password_hash, role, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, is_active = $6
      RETURNING user_id, email, name, role;
    `;
    
    const values = [
      'System Administrator',
      'admin@asys.com',
      passwordHash,
      'admin',
      '+1234567890',
      true
    ];
    
    const result = await client.query(query, values);
    
    console.log('✅ Admin user created/updated successfully!');
    console.log('Email: admin@asys.com');
    console.log('Password: Admin123456');
    
    return { 
      success: true, 
      message: 'Admin user created successfully',
      user: result.rows[0]
    };
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { createAdminUser };
