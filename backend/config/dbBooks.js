const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'artvpp_books',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✓ Books Database connection successful');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Books Database connection failed:', err.message);
  });

module.exports = pool;
