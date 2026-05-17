const pool = require('../config/database');

// Get payment settings
async function getPaymentSettings(req, res) {
  try {
    const result = await pool.query(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key IN ('payment_transfer_method', 'payment_transfer_details', 'monthly_expected_total')`
    );
    
    const settings = {
      payment_transfer_method: 'IBAN',
      payment_transfer_details: 'TR00 0000 0000 0000 0000 0000 00',
      monthly_expected_total: '0'
    };
    
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json(settings);
    
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching payment settings'
      }
    });
  }
}

// Update monthly expected total only (Admin only)
async function updateMonthlyExpected(req, res) {
  try {
    const { monthly_expected_total } = req.body;
    const userId = req.user.user_id;
    
    if (monthly_expected_total === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'monthly_expected_total is required'
        }
      });
    }
    
    // Upsert monthly_expected_total
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at, updated_by)
       VALUES ('monthly_expected_total', $1, NOW(), $2)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = NOW(), updated_by = $2`,
      [monthly_expected_total, userId]
    );
    
    res.json({
      success: true,
      message: 'Monthly expected total updated successfully'
    });
    
  } catch (error) {
    console.error('Update monthly expected error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating monthly expected total'
      }
    });
  }
}

// Update payment settings (Admin only)
async function updatePaymentSettings(req, res) {
  try {
    const { payment_transfer_method, payment_transfer_details, monthly_expected_total } = req.body;
    const userId = req.user.user_id;
    
    if (!payment_transfer_method || !payment_transfer_details || monthly_expected_total === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'payment_transfer_method, payment_transfer_details, and monthly_expected_total are required'
        }
      });
    }
    
    // Upsert all settings (insert or update)
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at, updated_by)
       VALUES ('payment_transfer_method', $1, NOW(), $2)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = NOW(), updated_by = $2`,
      [payment_transfer_method, userId]
    );
    
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at, updated_by)
       VALUES ('payment_transfer_details', $1, NOW(), $2)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = NOW(), updated_by = $2`,
      [payment_transfer_details, userId]
    );
    
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at, updated_by)
       VALUES ('monthly_expected_total', $1, NOW(), $2)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = NOW(), updated_by = $2`,
      [monthly_expected_total, userId]
    );
    
    res.json({
      success: true,
      message: 'Payment settings updated successfully'
    });
    
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating payment settings'
      }
    });
  }
}

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
  updateMonthlyExpected
};
