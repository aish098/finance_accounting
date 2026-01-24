const mysql = require('mysql2/promise');
require('dotenv').config();

if (!process.env.MYSQLHOST && !process.env.MYSQL_URL && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Railway Database variables are missing! Make sure MySQL is added to this project.');
}

const config = process.env.MYSQL_URL || {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'accounting_db',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 15000
};

const pool = mysql.createPool(config);

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
