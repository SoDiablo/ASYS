const cron = require('node-cron');
const pool = require('../config/database');

// FR-08, BR-01: Generate monthly dues on 1st of each month at 00:01
function scheduleMonthlyDuesGeneration() {
  cron.schedule('1 0 1 * *', async () => {
    console.log('Running monthly dues generation job...');
    
    try {
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5);
      
      // Get all occupied apartments
      const apartmentsResult = await pool.query(
        'SELECT * FROM apartments WHERE is_occupied = true'
      );
      
      let generatedCount = 0;
      
      for (const apartment of apartmentsResult.rows) {
        // Check if dues already exist for this month
        const existingDues = await pool.query(
          'SELECT * FROM dues WHERE apartment_id = $1 AND period_month = $2',
          [apartment.apartment_id, currentMonth]
        );
        
        if (existingDues.rows.length === 0) {
          await pool.query(
            `INSERT INTO dues (apartment_id, due_date, amount, status, period_month)
             VALUES ($1, $2, $3, 'pending', $4)`,
            [apartment.apartment_id, dueDate, apartment.monthly_due, currentMonth]
          );
          generatedCount++;
        }
      }
      
      console.log(`Monthly dues generation completed. Generated ${generatedCount} dues records.`);
      
    } catch (error) {
      console.error('Error in monthly dues generation:', error);
    }
  });
  
  console.log('Monthly dues generation job scheduled (1st of each month at 00:01)');
}

// FR-12, BR-02: Calculate late fees daily at 00:30
function scheduleLateFeeCalculation() {
  cron.schedule('30 0 * * *', async () => {
    console.log('Running late fee calculation job...');
    
    try {
      const currentDate = new Date();
      
      // Get all pending dues past their due date
      const overdueDuesResult = await pool.query(
        `SELECT * FROM dues 
         WHERE status = 'pending' 
         AND due_date < $1`,
        [currentDate]
      );
      
      let updatedCount = 0;
      
      for (const due of overdueDuesResult.rows) {
        // Calculate 2% late fee
        const lateFee = due.amount * 0.02;
        
        await pool.query(
          `UPDATE dues 
           SET status = 'overdue', penalty = penalty + $1
           WHERE due_id = $2`,
          [lateFee, due.due_id]
        );
        
        // TODO: Send notification to resident
        console.log(`Late fee applied to due ${due.due_id}: $${lateFee}`);
        
        updatedCount++;
      }
      
      console.log(`Late fee calculation completed. Updated ${updatedCount} dues records.`);
      
      // BR-03: Check for 3 consecutive months overdue
      await checkConsecutiveOverdue();
      
    } catch (error) {
      console.error('Error in late fee calculation:', error);
    }
  });
  
  console.log('Late fee calculation job scheduled (daily at 00:30)');
}

// BR-03: Check for 3 consecutive months overdue and notify manager
async function checkConsecutiveOverdue() {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const result = await pool.query(
      `SELECT 
        a.apartment_id,
        a.block,
        a.floor,
        a.number,
        u.name as resident_name,
        COUNT(*) as overdue_count
       FROM apartments a
       LEFT JOIN users u ON a.user_id = u.user_id
       JOIN dues d ON a.apartment_id = d.apartment_id
       WHERE d.status = 'overdue'
       AND d.period_month >= $1
       GROUP BY a.apartment_id, a.block, a.floor, a.number, u.name
       HAVING COUNT(*) >= 3`,
      [threeMonthsAgo]
    );
    
    if (result.rows.length > 0) {
      console.log(`Warning: ${result.rows.length} apartments have 3+ consecutive overdue months`);
      // TODO: Send notification to manager
      result.rows.forEach(apt => {
        console.log(`  - ${apt.block}-${apt.floor}-${apt.number} (${apt.resident_name}): ${apt.overdue_count} overdue months`);
      });
    }
    
  } catch (error) {
    console.error('Error checking consecutive overdue:', error);
  }
}

// BR-07: Check for maintenance requests pending > 7 days
function scheduleMaintenanceEscalation() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running maintenance escalation check...');
    
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const result = await pool.query(
        `SELECT mr.*, a.block, a.floor, a.number, u.name as requester_name
         FROM maintenance_requests mr
         JOIN apartments a ON mr.apartment_id = a.apartment_id
         JOIN users u ON mr.user_id = u.user_id
         WHERE mr.status = 'pending'
         AND mr.created_at < $1`,
        [sevenDaysAgo]
      );
      
      if (result.rows.length > 0) {
        console.log(`Escalation: ${result.rows.length} maintenance requests pending > 7 days`);
        // TODO: Send escalation notification to manager
        result.rows.forEach(req => {
          console.log(`  - Request ${req.request_id}: ${req.category} (${req.priority}) - ${req.block}-${req.floor}-${req.number}`);
        });
      }
      
    } catch (error) {
      console.error('Error in maintenance escalation check:', error);
    }
  });
  
  console.log('Maintenance escalation check scheduled (daily at 09:00)');
}

// Initialize all scheduled jobs
function initializeJobs() {
  scheduleMonthlyDuesGeneration();
  scheduleLateFeeCalculation();
  scheduleMaintenanceEscalation();
  console.log('All scheduled jobs initialized');
}

module.exports = { initializeJobs };
