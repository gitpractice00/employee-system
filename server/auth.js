const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const router = express.Router();

// SIGNUP
router.post('/signup', function(req, res) {
  console.log('📝 Signup request received:', req.body);
  
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    console.log('❌ Missing fields');
    return res.status(400).json({ 
      error: 'Please provide username, email and password' 
    });
  }
  
  // Check if email exists
  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(checkEmailSql, [email], function(err, results) {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }
    
    if (results.length > 0) {
      console.log('❌ Email already exists');
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }
    
    // Hash password
    bcrypt.hash(password, 10, function(err, hashedPassword) {
      if (err) {
        console.error('❌ Hashing error:', err);
        return res.status(500).json({ 
          error: 'Error encrypting password' 
        });
      }
      
      console.log('✅ Password hashed successfully');
      
      // Insert user
      const insertSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      
      db.query(insertSql, [username, email, hashedPassword], function(err, result) {
        if (err) {
          console.error('❌ Insert error:', err);
          return res.status(500).json({ 
            error: 'Failed to create user',
            details: err.message 
          });
        }
        
        console.log('✅ User created successfully, ID:', result.insertId);
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully!',
          userId: result.insertId
        });
      });
    });
  });
});

// LOGIN
router.post('/login', function(req, res) {
  console.log('🔐 Login request received:', { email: req.body.email });
  
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ 
      error: 'Please provide email and password' 
    });
  }
  
  // Find user
  const sql = 'SELECT * FROM users WHERE email = ?';
  
  db.query(sql, [email], function(err, results) {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ 
        error: 'Database error',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const user = results[0];
    console.log('✅ User found:', user.id, user.email);
    
    // Compare password
    bcrypt.compare(password, user.password, function(err, isMatch) {
      if (err) {
        console.error('❌ Password comparison error:', err);
        return res.status(500).json({ 
          error: 'Error checking password' 
        });
      }
      
      if (!isMatch) {
        console.log('❌ Password does not match');
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }
      
      console.log('✅ Password matched!');
      
      // Check JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not found in .env file!');
        return res.status(500).json({ 
          error: 'Server configuration error' 
        });
      }
      
      // Create token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('✅ Token created successfully');
      
      res.json({
        success: true,
        message: 'Login successful!',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    });
  });
});

module.exports = router;