// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MYSQL@PASSWORD1',
  database: 's3_like_service',
  connectionLimit: 10 // Adjust according to your needs
});

module.exports = pool;
