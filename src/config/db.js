const mysql = require('mysql2/promise');
require('dotenv').config();

// Prioritize Railway variables strictly
const config = {
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'accounting_db',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 20000
};

if (process.env.MYSQL_URL) {
    console.log('Using MYSQL_URL for connection');
} else if (process.env.MYSQLHOST) {
    console.log(`Connecting to Railway MySQL at ${process.env.MYSQLHOST}`);
} else {
    console.warn('WARNING: No Railway DB variables found, falling back to localhost');
}

const pool = mysql.createPool(process.env.MYSQL_URL || config);

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('Successfully connected to MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('MySQL Connection Error details:', {
            host: process.env.MYSQLHOST || 'localhost',
            user: process.env.MYSQLUSER || 'root',
            database: process.env.MYSQLDATABASE || 'accounting_db',
            port: process.env.MYSQLPORT || 3306,
            error: err.message
        });
    });

module.exports = pool;
