
// This file will help us find the problem
const connection = require('./database');

console.log('=== DEBUGGING ===');
console.log('Type of connection:', typeof connection);
console.log('Connection object:', connection);
console.log('Does query exist?', typeof connection.query);
console.log('Connection keys:', Object.keys(connection));

// Try to see what's inside
if (connection.query) {
  console.log('✅ query method exists!');
} else {
  console.log('❌ query method does NOT exist!');
  console.log('Available methods:', Object.keys(connection));
}