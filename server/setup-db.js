// setup-db.js
const db = require('./database');

console.log('🚀 Starting database setup...\n');

const tables = [
  {
    name: 'employees',
    sql: `
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  {
    name: 'attendance',
    sql: `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM('present', 'absent', 'leave') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (employee_id, attendance_date)
      )
    `
  }
];

const sampleData = `
  INSERT INTO employees (name, position, email) VALUES 
    ('John Doe', 'Developer', 'john@example.com'),
    ('Jane Smith', 'Manager', 'jane@example.com'),
    ('Bob Johnson', 'Designer', 'bob@example.com')
`;

async function setupTables() {
  for (const table of tables) {
    try {
      await new Promise((resolve, reject) => {
        db.query(table.sql, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`✅ Table '${table.name}' created/verified`);
    } catch (err) {
      console.error(`❌ Error creating table '${table.name}':`, err.message);
      process.exit(1);
    }
  }
}

async function insertSampleData() {
  try {
    await new Promise((resolve, reject) => {
      db.query(sampleData, function(err, result) {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️  Sample employees already exist');
            resolve();
          } else {
            reject(err);
          }
        } else {
          console.log(`✅ Inserted ${result.affectedRows} sample employees`);
          resolve();
        }
      });
    });
  } catch (err) {
    console.error('❌ Error inserting sample data:', err.message);
  }
}

async function verifySetup() {
  console.log('\n📊 Verifying setup...\n');
  
  const queries = [
    { name: 'Employees count', sql: 'SELECT COUNT(*) as count FROM employees' },
    { name: 'Employees list', sql: 'SELECT * FROM employees' }
  ];
  
  for (const query of queries) {
    try {
      const result = await new Promise((resolve, reject) => {
        db.query(query.sql, function(err, results) {
          if (err) reject(err);
          else resolve(results);
        });
      });
      console.log(`${query.name}:`, JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(`❌ Error in ${query.name}:`, err.message);
    }
  }
}

async function main() {
  try {
    await setupTables();
    await insertSampleData();
    await verifySetup();
    
    console.log('\n✨ Database setup completed successfully!\n');
    console.log('You can now run your application.');
    
  } catch (err) {
    console.error('\n❌ Setup failed:', err);
  } finally {
    db.end();
    process.exit(0);
  }
}

main();