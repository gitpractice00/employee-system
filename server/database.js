const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Nitesh@123',
  database: 'employee_system'
});

connection.connect(function(err) {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database!');
});

// Test connection function
const testConnection = async () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT 1', function(err) {
      if (err) {
        console.error('❌ Database connection test failed:', err.message);
        reject(err);
      } else {
        console.log('✅ Database connection test successful');
        resolve();
      }
    });
  });
};

module.exports = connection;
module.exports.testConnection = testConnection;