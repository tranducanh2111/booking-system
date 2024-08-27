require('dotenv').config();
const mysql = require('mysql2');

let db_advance_notice;

function connectAdvanceNoticeDatabase() {
  if (!db_advance_notice) {
    db_advance_notice = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_ADVANCE_NOTICE,
      port: process.env.DB_PORT,
    });

    db_advance_notice.connect((err) => {
      if (err) {
        console.error('Error connecting to the Advance Notice database:', err.stack);
        return;
      }
      console.log('Connected to the Advance Notice Database');
    });
  }
  return db_advance_notice;
}

function closeAdvanceNoticeDatabaseConnection() {
  if (db_advance_notice) {
    db_advance_notice.end((err) => {
      if (err) {
        console.error('Error closing the Advance Notice database connection:', err.stack);
        return;
      }
      console.log('Closed the Advance Notice database connection');
      db_advance_notice = null; // Clear the connection
    });
  }
}

module.exports = {
  connectAdvanceNoticeDatabase,
  closeAdvanceNoticeDatabaseConnection,
};