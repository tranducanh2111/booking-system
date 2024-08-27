require('dotenv').config();
const mysql = require('mysql2');

let db_advance_notice;

function connectConnectDatabase() {
  if (!db_advance_notice) {
    db_advance_notice = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_CONNECT,
      port: process.env.DB_PORT,
    });

    db_advance_notice.connect((err) => {
      if (err) {
        console.error('Error connecting to the Connect database:', err.stack);
        return;
      }
      console.log('Connected to the Connect Database');
    });
  }
  return db_advance_notice;
}

function closeConnectDatabaseConnection() {
  if (db_advance_notice) {
    db_advance_notice.end((err) => {
      if (err) {
        console.error('Error closing the Connect database connection:', err.stack);
        return;
      }
      console.log('Closed the Connect database connection');
      db_advance_notice = null; // Clear the connection
    });
  }
}

module.exports = {
  connectConnectDatabase,
  closeConnectDatabaseConnection,
};