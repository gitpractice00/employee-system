const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../authMiddleware');

// Get all employees (PROTECTED)
router.get('/', verifyToken, function(req, res) {
  console.log('📋 Get all employees');
  
  const sql = 'SELECT * FROM employees';
  
  db.query(sql, function(err, results) {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ 
        error: 'Failed to get employees',
        details: err.message 
      });
    }
    
    console.log('✅ Found', results.length, 'employees');
    res.json({
      success: true,
      count: results.length,
      data: results,
      requestedBy: req.user.email
    });
  });
});

// Get one employee by ID (PROTECTED)
router.get('/:id', verifyToken, function(req, res) {
  const id = req.params.id;
  console.log('🔍 Get employee:', id);
  
  const sql = 'SELECT * FROM employees WHERE id = ?';
  
  db.query(sql, [id], function(err, results) {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('❌ Employee not found');
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    console.log('✅ Employee found');
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// CREATE - Add new employee (PROTECTED)
router.post('/', verifyToken, function(req, res) {
  console.log('➕ Add employee:', req.body);
  
  const { name, email, phone, position, salary, hire_date } = req.body;
  
  if (!name || !email) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }
  
  const sql = 'INSERT INTO employees (name, email, phone, position, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, position, salary, hire_date];
  
  db.query(sql, values, function(err, result) {
    if (err) {
      console.error('❌ Insert error:', err);
      return res.status(500).json({ 
        error: 'Failed to add employee',
        details: err.message 
      });
    }
    
    console.log('✅ Employee added, ID:', result.insertId);
    res.status(201).json({
      success: true,
      message: 'Employee added successfully!',
      employeeId: result.insertId
    });
  });
});

// UPDATE - Edit existing employee (PROTECTED)
router.put('/:id', verifyToken, function(req, res) {
  const id = req.params.id;
  console.log('✏️ Update employee:', id, req.body);
  
  const { name, email, phone, position, salary, hire_date } = req.body;
  
  const sql = 'UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, salary = ?, hire_date = ? WHERE id = ?';
  const values = [name, email, phone, position, salary, hire_date, id];
  
  db.query(sql, values, function(err, result) {
    if (err) {
      console.error('❌ Update error:', err);
      return res.status(500).json({ 
        error: 'Failed to update employee',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      console.log('❌ Employee not found');
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    console.log('✅ Employee updated');
    res.json({
      success: true,
      message: 'Employee updated successfully!'
    });
  });
});

// DELETE - Remove employee (PROTECTED)
router.delete('/:id', verifyToken, function(req, res) {
  const id = req.params.id;
  console.log('🗑️ Delete employee:', id);
  
  const sql = 'DELETE FROM employees WHERE id = ?';
  
  db.query(sql, [id], function(err, result) {
    if (err) {
      console.error('❌ Delete error:', err);
      return res.status(500).json({ 
        error: 'Failed to delete employee',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      console.log('❌ Employee not found');
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    console.log('✅ Employee deleted');
    res.json({
      success: true,
      message: 'Employee deleted successfully!'
    });
  });
});

module.exports = router;