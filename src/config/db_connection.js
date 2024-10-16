const mysql = require('mysql2');
require('dotenv').config();

const pools = {};

function createPool(dbName) {
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env[`DB_NAME_${dbName}`],
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 10,
        maxIdle: 10,
        idleTimeout: 8000, // 8 seconds
    });
}

function getPool(dbName) {
    if (!pools[dbName]) {
        pools[dbName] = createPool(dbName);
        console.log(`Created pool for the ${dbName} Database`);
    }
    return pools[dbName].promise(); // Use promise() to get a promise-based pool
}

// For the connection to the connect database
function getConnectPool() {
    return getPool('CONNECT');
}

// For the connection to the advance notice database
function getAdvanceNoticePool() {
    return getPool('ADVANCE_NOTICE');
}

// For the connection to the petbooqz database
function getPetbooqzPool() {
    return getPool('PETBOOQZ');
}

// Function to query the database
async function queryDatabase(pool, sql, params = []) {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.query(sql, params);
        return results;
    } catch (error) {
        console.error('Error querying database:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Transaction functions
// async function withTransaction(pool, callback) {
//     const connection = await pool.getConnection();
//     await connection.beginTransaction();

//     try {
//         const result = await callback(connection);
//         await connection.commit();
//         return result;
//     } catch (error) {
//         await connection.rollback();
//         console.error('Error in transaction:', error);
//         throw error;
//     } finally {
//         connection.release();
//     }
// }

// Function to close all pools (use when shutting down the application)
function closeAllPools() {
    return Promise.all(Object.values(pools).map((pool) => pool.end()));
}

module.exports = {
    getConnectPool,
    getAdvanceNoticePool,
    getPetbooqzPool,
    queryDatabase,
    // withTransaction,
    closeAllPools,
};
