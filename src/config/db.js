require('dotenv').config();
const mysql = require('mysql2/promise');

// Debugging: Log available environment variables (values masked for security)
console.log('🔍 Database Environment Check:');
console.log(`   - MYSQLHOST: ${process.env.MYSQLHOST || 'not set'}`);
console.log(`   - MYSQLPORT: ${process.env.MYSQLPORT || 'not set'}`);
console.log(`   - MYSQLUSER: ${process.env.MYSQLUSER || 'not set'}`);
console.log(`   - MYSQLDATABASE: ${process.env.MYSQLDATABASE || 'not set'}`);
console.log(`   - MYSQLPASSWORD: ${process.env.MYSQLPASSWORD ? '********' : 'not set'}`);
console.log(`   - DATABASE_URL/MYSQL_URL/MYSQL_PRIVATE_URL: ${(process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL) ? 'set' : 'not set'}`);

// Parse Railway Connection String if provided (Most reliable method)
let config;
const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL;

if (connectionString) {
    try {
        const url = new URL(connectionString);
        config = {
            host: url.hostname,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            port: parseInt(url.port || '3306', 10),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 60000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            multipleStatements: true
        };
        console.log(`✅ Using connection string: ${url.hostname}:${url.port}/${url.pathname.slice(1)}`);
    } catch (e) {
        console.error('❌ Error parsing connection string:', e.message);
    }
}

// Fallback to individual variables if no string or parsing failed
if (!config) {
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
        keepAliveInitialDelay: 0,
        multipleStatements: true
    };
    console.log(`✅ Using individual config: ${config.host}:${config.port}/${config.database} as ${config.user}`);
}

const pool = mysql.createPool(config);

// Test connection handle
pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
});

module.exports = pool;
