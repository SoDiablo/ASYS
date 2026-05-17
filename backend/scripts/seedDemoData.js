const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function seedDemoData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Seeding demo data...');
    
    // Check if demo data already exists
    const existingUsers = await client.query('SELECT COUNT(*) FROM users WHERE email LIKE $1', ['%demo%']);
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log('✅ Demo data already exists. Skipping...');
      await client.query('ROLLBACK');
      return;
    }
    
    // Create demo residents
    const password = await bcrypt.hash('Demo1234', 10);
    
    const resident1 = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, 'resident', $4, TRUE)
       RETURNING user_id`,
      ['Alexander Wright', 'alexander.demo@asys.com', password, '+1-555-0101']
    );
    
    const resident2 = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, 'resident', $4, TRUE)
       RETURNING user_id`,
      ['Sarah Johnson', 'sarah.demo@asys.com', password, '+1-555-0102']
    );
    
    const resident3 = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, 'resident', $4, TRUE)
       RETURNING user_id`,
      ['Michael Chen', 'michael.demo@asys.com', password, '+1-555-0103']
    );
    
    console.log('✅ Created 3 demo residents');
    
    // Assign apartments to residents
    const apartments = await client.query('SELECT apartment_id FROM apartments LIMIT 3');
    
    if (apartments.rows.length >= 3) {
      await client.query(
        'UPDATE apartments SET user_id = $1, is_occupied = TRUE WHERE apartment_id = $2',
        [resident1.rows[0].user_id, apartments.rows[0].apartment_id]
      );
      
      await client.query(
        'UPDATE apartments SET user_id = $1, is_occupied = TRUE WHERE apartment_id = $2',
        [resident2.rows[0].user_id, apartments.rows[1].apartment_id]
      );
      
      await client.query(
        'UPDATE apartments SET user_id = $1, is_occupied = TRUE WHERE apartment_id = $2',
        [resident3.rows[0].user_id, apartments.rows[2].apartment_id]
      );
      
      console.log('✅ Assigned apartments to residents');
      
      // Create dues for each apartment
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5);
      
      for (let i = 0; i < 3; i++) {
        const status = i === 0 ? 'paid' : i === 1 ? 'pending' : 'overdue';
        const penalty = i === 2 ? 10.00 : 0;
        
        const dueResult = await client.query(
          `INSERT INTO dues (apartment_id, due_date, amount, penalty, status, period_month)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING due_id`,
          [apartments.rows[i].apartment_id, dueDate, 500.00, penalty, status, currentMonth]
        );
        
        // Create payment for paid dues
        if (status === 'paid') {
          await client.query(
            `INSERT INTO payments (due_id, user_id, paid_amount, payment_method, receipt_no)
             VALUES ($1, $2, $3, 'credit_card', $4)`,
            [dueResult.rows[0].due_id, [resident1, resident2, resident3][i].rows[0].user_id, 500.00, `RCP-DEMO-${Date.now()}`]
          );
        }
      }
      
      console.log('✅ Created dues and payments');
      
      // Create maintenance requests
      await client.query(
        `INSERT INTO maintenance_requests (apartment_id, user_id, category, priority, description, status, created_at)
         VALUES ($1, $2, 'electric', 'high', 'Light fixture not working in living room', 'pending', NOW() - INTERVAL '2 days')`,
        [apartments.rows[0].apartment_id, resident1.rows[0].user_id]
      );
      
      await client.query(
        `INSERT INTO maintenance_requests (apartment_id, user_id, category, priority, description, status, created_at, resolved_at, rating)
         VALUES ($1, $2, 'water', 'urgent', 'Kitchen sink leaking', 'done', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 5)`,
        [apartments.rows[1].apartment_id, resident2.rows[0].user_id]
      );
      
      await client.query(
        `INSERT INTO maintenance_requests (apartment_id, user_id, category, priority, description, status, created_at)
         VALUES ($1, $2, 'elevator', 'medium', 'Elevator making strange noise', 'in_progress', NOW() - INTERVAL '1 day')`,
        [apartments.rows[2].apartment_id, resident3.rows[0].user_id]
      );
      
      console.log('✅ Created maintenance requests');
      
      // Create reservations
      const commonAreas = await client.query('SELECT area_id FROM common_areas LIMIT 2');
      
      if (commonAreas.rows.length >= 2) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);
        
        const endTime = new Date(tomorrow);
        endTime.setHours(16, 0, 0, 0);
        
        await client.query(
          `INSERT INTO reservations (area_id, user_id, start_time, end_time, status)
           VALUES ($1, $2, $3, $4, 'active')`,
          [commonAreas.rows[0].area_id, resident1.rows[0].user_id, tomorrow, endTime]
        );
        
        console.log('✅ Created reservations');
      }
      
      // Assign parking spots
      const parkingSpots = await client.query('SELECT spot_id FROM parking_spots WHERE type = $1 LIMIT 2', ['standard']);
      
      if (parkingSpots.rows.length >= 2) {
        await client.query(
          'UPDATE parking_spots SET apartment_id = $1, is_occupied = TRUE WHERE spot_id = $2',
          [apartments.rows[0].apartment_id, parkingSpots.rows[0].spot_id]
        );
        
        await client.query(
          'UPDATE parking_spots SET apartment_id = $1, is_occupied = TRUE WHERE spot_id = $2',
          [apartments.rows[1].apartment_id, parkingSpots.rows[1].spot_id]
        );
        
        console.log('✅ Assigned parking spots');
      }
      
      // Create announcements
      const adminResult = await client.query('SELECT user_id FROM users WHERE role = $1 LIMIT 1', ['admin']);
      
      if (adminResult.rows.length > 0) {
        await client.query(
          `INSERT INTO announcements (admin_id, title, content, published_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '2 hours')`,
          [
            adminResult.rows[0].user_id,
            'Building Maintenance Notice',
            'Water will be shut off on April 1st from 9 AM to 12 PM for pipe maintenance. Please plan accordingly.'
          ]
        );
        
        await client.query(
          `INSERT INTO announcements (admin_id, title, content, published_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '1 day')`,
          [
            adminResult.rows[0].user_id,
            'New Gym Equipment',
            'We have installed new cardio equipment in the gym. Enjoy your workouts!'
          ]
        );
        
        console.log('✅ Created announcements');
      }
    }
    
    await client.query('COMMIT');
    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Email: alexander.demo@asys.com');
    console.log('   Email: sarah.demo@asys.com');
    console.log('   Email: michael.demo@asys.com');
    console.log('   Password: Demo1234\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDemoData };