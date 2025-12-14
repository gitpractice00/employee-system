const express = require('express');
const router = express.Router();
const db = require('../database');
const verifyToken = require('../authMiddleware');

// Test database connection
router.get('/test', function(req, res) {
  db.query('SELECT 1 + 1 AS result', function(err, results) {
    if (err) {
      return res.status(500).json({
        error: 'Database connection failed',
        details: err.message
      });
    }
    res.json({
      success: true,
      message: 'Database connected',
      result: results
    });
  });
});

// Get attendance for a specific date
router.get('/:date', verifyToken, function(req, res) {
  const date = req.params.date;
  console.log('[GET] Fetching attendance for date:', date);
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  const sql = `
    SELECT a.*, e.name as employee_name 
    FROM attendance a
    LEFT JOIN employees e ON a.employee_id = e.id
    WHERE a.attendance_date = ?
  `;
  
  db.query(sql, [date], function(err, results) {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({
        error: 'Failed to get attendance',
        details: err.message
      });
    }
    
    console.log('[SUCCESS] Found', results.length, 'attendance records');
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// Mark attendance (create or update)
router.post('/', verifyToken, function(req, res) {
  const { date, records } = req.body;
  
  console.log('[POST] Request body:', JSON.stringify(req.body, null, 2));
  console.log('[POST] Marking attendance for date:', date);
  console.log('[INFO] Records count:', records?.length);
  
  // Validation
  if (!date) {
    return res.status(400).json({
      error: 'Date is required'
    });
  }
  
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      error: 'Records array is required and must not be empty'
    });
  }
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  // Validate each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record.employee_id || !record.status) {
      return res.status(400).json({
        error: `Invalid record at index ${i}. employee_id and status are required`
      });
    }
    
    if (!['present', 'absent', 'leave'].includes(record.status)) {
      return res.status(400).json({
        error: `Invalid status at index ${i}. Must be 'present', 'absent', or 'leave'`
      });
    }
  }
  
  // Delete existing attendance for this date
  const deleteSql = 'DELETE FROM attendance WHERE attendance_date = ?';
  
  db.query(deleteSql, [date], function(deleteErr, deleteResult) {
    if (deleteErr) {
      console.error('[ERROR] Delete error:', deleteErr);
      return res.status(500).json({
        error: 'Failed to delete old records',
        details: deleteErr.message
      });
    }
    
    console.log('[INFO] Deleted', deleteResult.affectedRows, 'old records');
    
    // Insert new attendance records
    const insertSql = 'INSERT INTO attendance (employee_id, attendance_date, status) VALUES ?';
    const values = records.map(r => [r.employee_id, date, r.status]);
    
    console.log('[INFO] Inserting values:', JSON.stringify(values, null, 2));
    
    db.query(insertSql, [values], function(insertErr, insertResult) {
      if (insertErr) {
        console.error('[ERROR] Insert error:', insertErr);
        return res.status(500).json({
          error: 'Failed to mark attendance',
          details: insertErr.message,
          sqlState: insertErr.sqlState,
          code: insertErr.code
        });
      }
      
      console.log('[SUCCESS] Attendance marked successfully');
      console.log('[INFO] Insert result:', insertResult);
      
      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        recordsDeleted: deleteResult.affectedRows,
        recordsInserted: insertResult.affectedRows
      });
    });
  });
});

// Get attendance summary by date range
router.get('/summary/:startDate/:endDate', verifyToken, function(req, res) {
  const { startDate, endDate } = req.params;
  
  console.log('[GET] Fetching attendance summary from', startDate, 'to', endDate);
  
  // Validate date formats
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  const sql = `
    SELECT 
      e.id, 
      e.name, 
      e.position,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
      COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as leave_days,
      COUNT(a.id) as total_days
    FROM employees e
    LEFT JOIN attendance a ON e.id = a.employee_id 
      AND a.attendance_date BETWEEN ? AND ?
    GROUP BY e.id, e.name, e.position
    ORDER BY e.name
  `;
  
  db.query(sql, [startDate, endDate], function(err, results) {
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