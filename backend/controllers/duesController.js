const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get dues for an apartment
async function getDuesByApartment(req, res) {
  try {
    const { apartmentId } = req.params;
    const { startDate, endDate, status } = req.query;
    
    let query = 'SELECT d.*, a.block, a.floor, a.number FROM dues d JOIN apartments a ON d.apartment_id = a.apartment_id WHERE d.apartment_id = $1';
    const params = [apartmentId];
    let paramCount = 1;
    
    if (startDate) {
      paramCount++;
      query += ' AND d.period_month >= $' + paramCount;
      params.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ' AND d.period_month <= $' + paramCount;
      params.push(endDate);
    }
    
    if (status) {
      paramCount++;
      query += ' AND d.status = $' + paramCount;
      params.push(status);
    }
    
    query += ' ORDER BY d.period_month DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ dues: result.rows });
    
  } catch (error) {
    console.error('Get dues error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching dues'
      }
    });
  }
}

// Create dues (Admin only)
async function createDues(req, res) {
  try {
    const { apartment_id, amount, period_month, due_date } = req.body;
    
    if (!apartment_id || !amount || !period_month || !due_date) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'apartment_id, amount, period_month, and due_date are required'
        }
      });
    }
    
    // Handle apartment_id in "Block-Number" format
    let finalApartmentId = apartment_id;
    const parts = apartment_id.trim().split('-');
    if (parts.length === 2) {
      const block = parts[0].toUpperCase().trim();
      const number = parts[1].trim();
      
      // Validate block and number length
      if (block.length === 0 || block.length > 3 || number.length === 0 || number.length > 3) {
        return res.status(400).json({
          error: {
            code: 'INVALID_FORMAT',
            message: 'Apartment format: Block-Number (max 3 chars each, e.g., B-202)'
          }
        });
      }
      
      // Find or create apartment
      let aptResult = await pool.query(
        'SELECT apartment_id FROM apartments WHERE block = $1 AND number = $2',
        [block, number]
      );
      
      if (aptResult.rows.length === 0) {
        // Create apartment
        const floor = number.length === 1 ? 0 : parseInt(number.charAt(0));
        aptResult = await pool.query(
          'INSERT INTO apartments (block, floor, number, monthly_due, is_occupied) VALUES ($1, $2, $3, $4, FALSE) RETURNING apartment_id',
          [block, floor, number, 500.00]
        );
      }
      
      finalApartmentId = aptResult.rows[0].apartment_id;
    }
    
    // Check if dues already exist for this apartment and period
    const existing = await pool.query(
      'SELECT due_id FROM dues WHERE apartment_id = $1 AND period_month = $2',
      [finalApartmentId, period_month]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_DUES',
          message: 'Dues already exist for this apartment and period'
        }
      });
    }
    
    const result = await pool.query(
      'INSERT INTO dues (apartment_id, amount, period_month, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [finalApartmentId, amount, period_month, due_date]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Dues created successfully'
    });
    
  } catch (error) {
    console.error('Create dues error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while creating dues'
      }
    });
  }
}

// Pay dues
async function payDues(req, res) {
  const client = await pool.connect();
  
  try {
    const { dueId } = req.params;
    const { paid_amount, payment_method } = req.body;
    const userId = req.user.user_id;
    
    // Validate required fields
    if (!paid_amount || !payment_method) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REQUIRED_FIELD',
          message: 'paid_amount and payment_method are required'
        }
      });
    }
    
    // Validate payment method
    if (!['credit_card', 'bank_transfer'].includes(payment_method)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'payment_method must be credit_card or bank_transfer'
        }
      });
    }
    
    await client.query('BEGIN');
    
    // Get due information
    const dueResult = await client.query(
      'SELECT * FROM dues WHERE due_id = $1',
      [dueId]
    );
    
    if (dueResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Due not found'
        }
      });
    }
    
    const due = dueResult.rows[0];
    
    if (due.status === 'paid') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: {
          code: 'CONSTRAINT_VIOLATION',
          message: 'This due has already been paid'
        }
      });
    }
    
    // Generate unique receipt number
    const receiptNo = 'RCP-' + Date.now() + '-' + uuidv4().substring(0, 8).toUpperCase();
    
    // Create payment record
    const paymentResult = await client.query(
      'INSERT INTO payments (due_id, user_id, paid_amount, payment_method, receipt_no) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [dueId, userId, paid_amount, payment_method, receiptNo]
    );
    
    // Update due status to paid
    await client.query(
      'UPDATE dues SET status = $1 WHERE due_id = $2',
      ['paid', dueId]
    );
    
    await client.query('COMMIT');
    
    res.json({
      payment_id: paymentResult.rows[0].payment_id,
      receipt_no: receiptNo,
      paid_at: paymentResult.rows[0].paid_at,
      message: 'Payment processed successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Pay dues error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while processing payment'
      }
    });
  } finally {
    client.release();
  }
}

// Get all apartments with dues status (Manager only)
async function getAllDues(req, res) {
  try {
    const { status, overdue } = req.query;
    
    let query = `
      SELECT 
        a.apartment_id,
        CONCAT(a.block, '-', a.number) as apartment_number,
        a.block,
        a.floor,
        a.number,
        u.name as resident_name,
        d.due_id,
        d.amount,
        d.penalty,
        d.status,
        d.due_date,
        d.period_month
      FROM apartments a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN LATERAL (
        SELECT * FROM dues 
        WHERE apartment_id = a.apartment_id 
        ORDER BY period_month DESC 
        LIMIT 1
      ) d ON true
      WHERE a.is_occupied = true
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ' AND d.status = $' + paramCount;
      params.push(status);
    }
    
    if (overdue === 'true') {
      query += ' AND d.status = \'overdue\'';
    }
    
    query += ' ORDER BY a.block, a.floor, a.number';
    
    const result = await pool.query(query, params);
    
    res.json({ apartments: result.rows });
    
  } catch (error) {
    console.error('Get all dues error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching dues'
      }
    });
  }
}

// Get payment history
async function getPaymentHistory(req, res) {
  try {
    const { apartmentId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT p.*, d.period_month, d.amount as due_amount FROM payments p JOIN dues d ON p.due_id = d.due_id WHERE d.apartment_id = $1';
    const params = [apartmentId];
    let paramCount = 1;
    
    if (startDate) {
      paramCount++;
      query += ' AND p.paid_at >= $' + paramCount;
      params.push(startDate);
    }
    
    if (endDate) {
      paramCount++;
      query += ' AND p.paid_at <= $' + paramCount;
      params.push(endDate);
    }
    
    query += ' ORDER BY p.paid_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ payments: result.rows });
    
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching payment history'
      }
    });
  }
}

// Update due status (Admin only)
async function updateDueStatus(req, res) {
  try {
    const { dueId } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'paid', 'overdue'].includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VALUE',
          message: 'Invalid status. Must be pending, paid, or overdue'
        }
      });
    }
    
    const result = await pool.query(
      'UPDATE dues SET status = $1 WHERE due_id = $2 RETURNING *',
      [status, dueId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Due not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Due status updated successfully'
    });
    
  } catch (error) {
    console.error('Update due status error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating due status'
      }
    });
  }
}

module.exports = {
  getDuesByApartment,
  createDues,
  payDues,
  getAllDues,
  getPaymentHistory,
  updateDueStatus
};
