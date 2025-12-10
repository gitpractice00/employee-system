const connection = require('./database');

// Simple test query
console.log('🔍 Testing database connection...');

connection.query('SELECT * FROM employees', (error, results) => {
  if (error) {
    console.log('❌ Query failed:', error.message);
  } else {
    console.log('✅ Query successful!');
    console.log('📊 Number of employees:', results.length);
    console.log('📋 Employee data:', results);
  }
  
  // Close the connection
  connection.end();
});