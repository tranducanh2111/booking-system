// db.js

require('dotenv').config();
const env = process.env;
const mysql = require('mysql2');

// MySQL connection setup
const db = mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT
  });
  
db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      return;
    }
    console.log('Connected to the database');
});

module.exports = db;