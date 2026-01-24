const mysql = require('mysql2/promise');
require('dotenv').config();

// Prioritize Railway variables then common alternatives
const config = {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.DB_DATABASE || 'accounting_db',
    port: process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 20000,
    ssl: (process.env.MYSQL_URL || process.env.DATABASE_URL || '').includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
};

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_INTERNAL_URL;

let pool;
if (connectionUrl) {
    console.log('Using connection URL for MySQL');
    pool = mysql.createPool(connectionUrl + (connectionUrl.includes('?') ? '&' : '?') + 'multipleStatements=true');
} else {
    // Check if we are in Railway but missing variables
    if (process.env.RAILWAY_ENVIRONMENT && !process.env.MYSQLHOST) {
        console.error('CRITICAL: Running in Railway but MYSQLHOST is missing. Check your Service Variables.');
    }
    console.log(`Connecting to MySQL at ${config.host}:${config.port}`);
    pool = mysql.createPool(config);
}

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
