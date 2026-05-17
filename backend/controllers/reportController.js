const pool = require('../config/database');

// FR-36: Get dashboard data (Manager only)
async function getDashboard(req, res) {
  try {
    // Get total collected for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const totalCollectedResult = await pool.query(
      `SELECT COALESCE(SUM(paid_amount), 0) as total
       FROM payments
       WHERE paid_at >= $1`,
      [currentMonth]
    );
    
    // Get open maintenance requests count
    const openRequestsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM maintenance_requests
       WHERE status IN ('pending', 'in_progress')`
    );
    
    // Get occupancy rate
    const occupancyResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_occupied THEN 1 ELSE 0 END) as occupied
       FROM apartments`
    );
    
    const total = parseInt(occupancyResult.rows[0].total);
    const occupied = parseInt(occupancyResult.rows[0].occupied);
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(2) : 0;
    
    // FR-39: Get payment trend for last 12 months
    const paymentTrendResult = await pool.query(
      `SELECT 
        DATE_TRUNC('month', paid_at) as month,
        SUM(paid_amount) as amount
       FROM payments
       WHERE paid_at >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', paid_at)
       ORDER BY month`
    );
    
    // Get total expected from settings
    const totalExpectedResult = await pool.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'monthly_expected_total'`
    );
    
    const totalExpected = totalExpectedResult.rows.length > 0 
      ? parseFloat(totalExpectedResult.rows[0].setting_value) 
      : 0;
    
    // FR-38: Get request categories distribution
    const requestCategoriesResult = await pool.query(
      `SELECT 
        category,
        COUNT(*) as count
       FROM maintenance_requests
       GROUP BY category
       ORDER BY count DESC`
    );
    
    res.json({
      total_collected: parseFloat(totalCollectedResult.rows[0].total),
      total_expected: totalExpected,
      open_requests: parseInt(openRequestsResult.rows[0].count),
      occupancy_rate: parseFloat(occupancyRate),
      payment_trend: paymentTrendResult.rows,
      request_categories: requestCategoriesResult.rows
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching dashboard data'
      }
    });
  }
}

// FR-37: Generate PDF report (Manager only)
async function generateDuesReport(req, res) {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'month and year are required'
        }
      });
    }
    
    // Get dues collection data for the month
    const periodMonth = new Date(year, month - 1, 1);
    
    const result = await pool.query(
      `SELECT 
        a.block,
        a.floor,
        a.number,
        u.name as resident_name,
        d.amount,
        d.penalty,
        d.status,
        p.paid_amount,
        p.paid_at,
        p.payment_method
       FROM apartments a
       LEFT JOIN users u ON a.user_id = u.user_id
       LEFT JOIN dues d ON a.apartment_id = d.apartment_id AND d.period_month = $1
       LEFT JOIN payments p ON d.due_id = p.due_id
       WHERE a.is_occupied = true
       ORDER BY a.block, a.floor, a.number`,
      [periodMonth]
    );
    
    // TODO: Generate actual PDF using pdfkit
    // For now, return JSON data
    res.json({
      report_month: `${year}-${month}`,
      apartments: result.rows,
      message: 'PDF generation not yet implemented'
    });
    
  } catch (error) {
    console.error('Generate dues report error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while generating report'
      }
    });
  }
}

module.exports = {
  getDashboard,
  generateDuesReport
};
