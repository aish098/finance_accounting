require('dotenv').config();
const mysql = require('mysql2/promise');

// Parse Railway DATABASE_URL if provided
let config;

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    const url = new URL(dbUrl);

    config = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading slash
        port: parseInt(url.port || '3306', 10),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    };
    console.log(`Using DATABASE_URL: ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
} else {
    // Fallback to individual environment variables
    config = {
        host: process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || 'railway',
        port: parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    };
    console.log(`Using MySQL config: ${config.host}:${config.port}/${config.database} as ${config.user}`);
}

const pool = mysql.createPool(config);

// Test connection on startup
pool.on('connection', (connection) => {
    console.log('✅ New database connection established');
});

pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
