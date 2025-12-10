
// Import mysql2 package
const mysql = require('mysql2');

// Create connection to database
const connection = mysql.createConnection({
    host: 'localhost',      // Where is MySQL? On your computer (localhost)
    user: 'root',           // MySQL username (default is 'root')
    password: 'Nitesh@123',           // Your MySQL password (leave empty if no password)
    database: 'employee_system'  // Which database to use
});

// Try to connect
connection.connect((error) => {
    if (error) {
        console.log('Oh no!! Database connection failed:', error.message);
    } else {
        console.log('Succesfully Connected to MySQL database!');
    }
});
module.exports = connection;



