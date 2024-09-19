const mysql = require('mysql2');
require('dotenv').config();

let connections = {};

function connectDatabase(dbName) {
  if (!connections[dbName]) {
    connections[dbName] = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env[`DB_NAME_${dbName}`],
      port: process.env.DB_PORT,
    });

    connections[dbName].connect((err) => {
      if (err) {
        console.error(`Error connecting to the ${dbName} database:`, err.stack);
        return;
      }
      console.log(`Connected to the ${dbName} Database`);
    });
  }
  return connections[dbName];
}

function closeDatabaseConnection(dbName) {
  if (connections[dbName]) {
    connections[dbName].end((err) => {
      if (err) {
        console.error(`Error closing the ${dbName} database connection:`, err.stack);
        return;
      }
      console.log(`Closed the ${dbName} database connection`);
      connections[dbName] = null; // Clear the connection
    });
  }
}

// For the connection to the connect database
function connectConnectDatabase() {
  return connectDatabase('CONNECT');
}

function closeConnectDatabaseConnection() {
  closeDatabaseConnection('CONNECT');
}

// For the connection to the advance notice database
function connectAdvanceNoticeDatabase() {
  return connectDatabase('ADVANCE_NOTICE');
}

function closeAdvanceNoticeDatabaseConnection() {
  closeDatabaseConnection('ADVANCE_NOTICE');
}

// For the connection to the petbooqz database
function connectPetbooqzDatabase() {
  return connectDatabase('PETBOOQZ');
}

function closePetbooqzDatabaseConnection() {
  closeDatabaseConnection('PETBOOQZ');
}

// Function to send query the database
async function queryDatabase(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Transaction functions
async function beginTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

async function commitTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.commit((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

async function rollbackTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.rollback(() => {
      resolve(); // No error handling needed for rollback
    });
  });
}

// Export the transaction functions
module.exports = {
  connectConnectDatabase,
  closeConnectDatabaseConnection,
  connectAdvanceNoticeDatabase,
  closeAdvanceNoticeDatabaseConnection,
  connectPetbooqzDatabase,
  closePetbooqzDatabaseConnection,
  queryDatabase,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
};