const mysql = require('mysql2/promise');
require('dotenv').config();

// Prioritize Railway variables then common alternatives
const config = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS || process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'accounting_db',
    port: process.env.MYSQLPORT || process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 20000
};

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_INTERNAL_URL;

if (connectionUrl) {
    console.log('Using connection URL for MySQL');
} else if (process.env.MYSQLHOST || process.env.DB_HOST || process.env.MYSQL_HOST) {
    console.log(`Connecting to MySQL at ${config.host}`);
} else {
    console.warn('WARNING: No database environment variables found, falling back to defaults');
}

const pool = mysql.createPool(connectionUrl || config);

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('Successfully connected to MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('MySQL Connection Error details:', {
            host: config.host,
            user: config.user,
            database: config.database,
            port: config.port,
            error: err.message || err.code || err
        });
    });

module.exports = pool;
