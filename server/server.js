
/* Before creating a database
// Import express package
const express = require('express');

// Create an express application
const app = express();

// Tell express to understand JSON data
app.use(express.json());

// Create a simple route - when someone visits the homepage
app.get('/', (req, res) => {
  res.send('Hello! Employee Management System is running!');
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Congratulation Server is running on http://localhost:${PORT}`);
});
*/

/*

//After Creating a database

const express = require('express');
const connection = require('./database.js');  // Import our database connection

// Create express app
const app = express();

// Middleware to understand JSON
app.use(express.json());

// Route 1: Homepage
app.get('/', (req, res) => {
  res.send('Hello! Employee Management System is running! ');
});

// Route 2: Get all employees from database
app.get('/employees', (req, res) => {
  // SQL query to get all employees
  const sql = 'SELECT * FROM employees';
  
  // Ask database to run this query
  connection.query(sql, (error, results) => {
    if (error) {
      // If something went wrong
      console.log('Error:', error);
      res.status(500).json({ error: 'Failed to get employees' });
    } else {
      // If successful, send the results
      res.json({
        message: 'Employees retrieved successfully',
        data: results
      });
    }
  });
});

// Route 3: Get one employee by ID
app.get('/employees/:id', (req, res) => {
  const employeeId = req.params.id;  // Get ID from URL
  const sql = 'SELECT * FROM employees WHERE id = ?';
  
  connection.query(sql, [employeeId], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Failed to get employee' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.json({
        message: 'Employee found',
        data: results[0]
      });
    }
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Great Job Server is running on http://localhost:${PORT}`);
});
*/


/*
// After the CRUD Operation
require('dotenv').config();
const express = require('express');
const db = require('./database');
const cors = require('cors');
const authRoutes = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());


// Homepage
app.get('/', function(req, res) {
  res.send('Employee System is Running! 🎉');
});

// Get all employees
app.get('/employees', function(req, res) {
  const sql = 'SELECT * FROM employees';
  
  db.query(sql, function(err, results) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: 'Failed to get employees',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  });
});

// Get one employee by ID
app.get('/employees/:id', function(req, res) {
  const id = req.params.id;
  const sql = 'SELECT * FROM employees WHERE id = ?';
  
  db.query(sql, [id], function(err, results) {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// CREATE - Add new employee
app.post('/employees', function(req, res) {
  // Get data from request body
  const { name, email, phone, position, salary, hire_date } = req.body;
  
  // Check if required fields are provided
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }
  
  // SQL query to insert new employee
  const sql = 'INSERT INTO employees (name, email, phone, position, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, position, salary, hire_date];
  
  db.query(sql, values, function(err, result) {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ 
        error: 'Failed to add employee',
        details: err.message 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Employee added successfully!',
      employeeId: result.insertId
    });
  });
});

// UPDATE - Edit existing employee
app.put('/employees/:id', function(req, res) {
  const id = req.params.id;
  const { name, email, phone, position, salary, hire_date } = req.body;
  
  // SQL query to update employee
  const sql = 'UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, salary = ?, hire_date = ? WHERE id = ?';
  const values = [name, email, phone, position, salary, hire_date, id];
  
  db.query(sql, values, function(err, result) {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ 
        error: 'Failed to update employee',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully!'
    });
  });
});

// DELETE - Remove employee
app.delete('/employees/:id', function(req, res) {
  const id = req.params.id;
  
  // SQL query to delete employee
  const sql = 'DELETE FROM employees WHERE id = ?';
  
  db.query(sql, [id], function(err, result) {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ 
        error: 'Failed to delete employee',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deleted successfully!'
    });
  });
});

const PORT = 5000;
app.listen(PORT, function() {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


//IMPORTANT: Save that token! You'll use it for protected routes!

//"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqb2huQHRlc3QuY29tIiwiaWF0IjoxNzY1MjY5MTg1LCJleHAiOjE3NjUzNTU1ODV9.-0sWfhYqugeo7vISJw8Q4kIs2j4R8tOwrotqphn-05g","user":{"id":2,"username":"john","email":"john@test.com"}}

*/

// After the authMiddleware
// const cors = require("cors");
// const express = require('express');
// const db = require('./database.js');

require('dotenv').config();
const express = require('express');
const db = require('./database');
const cors = require('cors');
const verifyToken = require('./authMiddleware.js'); //importing from the module.export from the authMiddleware.js file
const authRoutes = require('./auth');

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(express.json());
app.use('/auth', authRoutes);

// Homepage
app.get('/', function(req, res) {
  res.send('Employee System is Running! 🎉');
});

// Get all employees (PROTECTED)
app.get('/employees', verifyToken, function(req, res) {
  // Only logged-in users can reach here!
  const sql = 'SELECT * FROM employees';
  
  db.query(sql, function(err, results) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: 'Failed to get employees',
        details: err.message 
      });
    }
    
    res.json({
      success: true,
      count: results.length,
      data: results,
      requestedBy: req.user.email  // We can access user info!
    });
  });
});

// Get one employee by ID (PROTECTED)
app.get('/employees/:id', verifyToken, function(req, res) {
  const id = req.params.id;
  const sql = 'SELECT * FROM employees WHERE id = ?';
  
  db.query(sql, [id], function(err, results) {
    if (err) {
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// CREATE - Add new employee (PROTECTED)
app.post('/employees', verifyToken, function(req, res) {
  // Get data from request body
  const { name, email, phone, position, salary, hire_date } = req.body;
  
  // Check if required fields are provided
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }
  
  // SQL query to insert new employee
  const sql = 'INSERT INTO employees (name, email, phone, position, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, position, salary, hire_date];
  
  db.query(sql, values, function(err, result) {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ 
        error: 'Failed to add employee',
        details: err.message 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Employee added successfully!',
      employeeId: result.insertId
    });
  });
});

// UPDATE - Edit existing employee (PROTECTED)
app.put('/employees/:id', verifyToken, function(req, res) {
  const id = req.params.id;
  const { name, email, phone, position, salary, hire_date } = req.body;
  
  // SQL query to update employee
  const sql = 'UPDATE employees SET name = ?, email = ?, phone = ?, position = ?, salary = ?, hire_date = ? WHERE id = ?';
  const values = [name, email, phone, position, salary, hire_date, id];
  
  db.query(sql, values, function(err, result) {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ 
        error: 'Failed to update employee',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee updated successfully!'
    });
  });
});

// DELETE - Remove employee (PROTECTED)
app.delete('/employees/:id', verifyToken, function(req, res) {
  const id = req.params.id;
  
  // SQL query to delete employee
  const sql = 'DELETE FROM employees WHERE id = ?';
  
  db.query(sql, [id], function(err, result) {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ 
        error: 'Failed to delete employee',
        details: err.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: 'Employee not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Employee deleted successfully!'
    });
  });
});

const PORT = 5000;
app.listen(PORT, function() {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});