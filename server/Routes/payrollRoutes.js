const express = require('express');
const router = express.Router();
const db = require('../database');
const verifyToken = require('../authMiddleware');

// Test route
router.get('/test', function(req, res) {
  res.json({ message: 'Payroll routes working!' });
});

// Get payroll for a specific month
router.get('/:month', verifyToken, function(req, res) {
  const month = req.params.month; // Format: YYYY-MM
  console.log('[GET] Fetching payroll for month:', month);
  
  // Validate month format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({
      error: 'Invalid month format. Use YYYY-MM'
    });
  }
  
  const sql = `
    SELECT p.*, e.name as employee_name, e.position
    FROM payroll p
    LEFT JOIN employees e ON p.employee_id = e.id
    WHERE p.month = ?
    ORDER BY e.name
  `;
  
  db.query(sql, [month], function(err, results) {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({
        error: 'Failed to get payroll',
        details: err.message
      });
    }
    
    console.log('[SUCCESS] Found', results.length, 'payroll records');
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// Save/Update payroll for a month
router.post('/', verifyToken, function(req, res) {
  const { month, records } = req.body;
  
  console.log('[POST] Processing payroll for month:', month);
  console.log('[INFO] Records count:', records?.length);
  
  // Validation
  if (!month) {
    return res.status(400).json({
      error: 'Month is required'
    });
  }
  
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      error: 'Records array is required and must not be empty'
    });
  }
  
  // Validate month format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({
      error: 'Invalid month format. Use YYYY-MM'
    });
  }
  
  // Validate each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record.employee_id || record.basic_salary === undefined) {
      return res.status(400).json({
        error: `Invalid record at index ${i}. employee_id and basic_salary are required`
      });
    }
  }
  
  // Delete existing payroll for this month - FIXED SQL
  const deleteSql = 'DELETE FROM payroll WHERE month = ?';
  
  console.log('[INFO] Deleting old payroll records for month:', month);
  
  db.query(deleteSql, [month], function(deleteErr, deleteResult) {
    if (deleteErr) {
      console.error('[ERROR] Delete error:', deleteErr);
      return res.status(500).json({
        error: 'Failed to delete old payroll records',
        details: deleteErr.message
      });
    }
    
    console.log('[INFO] Deleted', deleteResult.affectedRows, 'old payroll records');
    
    // Insert new payroll records
    const insertSql = `
      INSERT INTO payroll 
      (employee_id, month, basic_salary, allowances, deductions, net_salary, payment_status) 
      VALUES ?
    `;
    
    const values = records.map(r => [
      r.employee_id,
      month,
      r.basic_salary || 0,
      r.allowances || 0,
      r.deductions || 0,
      r.net_salary || (r.basic_salary + (r.allowances || 0) - (r.deductions || 0)),
      r.payment_status || 'pending'
    ]);
    
    console.log('[INFO] Inserting', values.length, 'new payroll records');
    
    db.query(insertSql, [values], function(insertErr, insertResult) {
      if (insertErr) {
        console.error('[ERROR] Insert error:', insertErr);
        return res.status(500).json({
          error: 'Failed to save payroll',
          details: insertErr.message,
          sqlState: insertErr.sqlState,
          code: insertErr.code
        });
      }
      
      console.log('[SUCCESS] Payroll saved successfully');
      
      res.status(201).json({
        success: true,
        message: 'Payroll saved successfully',
        recordsDeleted: deleteResult.affectedRows,
        recordsInserted: insertResult.affectedRows
      });
    });
  });
});

// Mark a payroll record as paid
router.put('/:id/pay', verifyToken, function(req, res) {
  const payrollId = req.params.id;
  
  console.log('[PUT] Marking payroll as paid:', payrollId);
  
  const sql = 'UPDATE payroll SET payment_status = ?, paid_date = NOW() WHERE id = ?';
  
  db.query(sql, ['paid', payrollId], function(err, result) {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({
        error: 'Failed to update payment status',
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Payroll record not found'
      });
    }
    
    console.log('[SUCCESS] Payment status updated');
    res.json({
      success: true,
      message: 'Payment marked as paid'
    });
  });
});

// Get payroll summary for a year
router.get('/summary/:year', verifyToken, function(req, res) {
  const year = req.params.year;
  
  console.log('[GET] Fetching payroll summary for year:', year);
  
  // Validate year format
  if (!/^\d{4}$/.test(year)) {
    return res.status(400).json({
      error: 'Invalid year format. Use YYYY'
    });
  }
  
  const sql = `
    SELECT 
      e.id,
      e.name,
      e.position,
      COUNT(p.id) as months_paid,
      SUM(p.basic_salary) as total_basic,
      SUM(p.allowances) as total_allowances,
      SUM(p.deductions) as total_deductions,
      SUM(p.net_salary) as total_net,
      SUM(CASE WHEN p.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_months
    FROM employees e
    LEFT JOIN payroll p ON e.id = p.employee_id 
      AND p.month LIKE ?
    GROUP BY e.id, e.name, e.position
    ORDER BY e.name
  `;
  
  db.query(sql, [`${year}-%`], function(err, results) {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({
        error: 'Failed to get summary',
        details: err.message
      });
    }
    
    console.log('[SUCCESS] Summary generated for', results.length, 'employees');
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

module.exports = router;