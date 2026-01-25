const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to parse integer ports
const parsePort = (val) => {
    const port = parseInt(val, 10);
    return isNaN(port) ? undefined : port;
};

// Prioritize Railway variables then common alternatives
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID;
const defaultDb = isRailway ? 'railway' : 'accounting_db';

    const host = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || process.env.DB_HOSTNAME || process.env.MYSQL_INTERNAL_HOST || 'localhost';
    
    // Safety check for Railway
    if (isRailway && (host === 'localhost' || host === '127.0.0.1')) {
        console.error('WARNING: Running on Railway but MYSQLHOST is set to "localhost". This will likely fail.');
        console.error('Please update your Railway Variables to use ${{MySQL.MYSQLHOST}} instead of "localhost".');
    }

    const config = {
        host: host,
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || process.env.DB_USERNAME || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || process.env.DB_DATABASE || defaultDb,
    port: parsePort(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || process.env.MYSQL_INTERNAL_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

// Handle SSL for Railway/External connections
const isExternal = (host) => host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('internal');

if (process.env.MYSQL_URL || process.env.DATABASE_URL || isExternal(config.host)) {
    config.ssl = {
        rejectUnauthorized: false
    };
}

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_INTERNAL_URL || process.env.DATABASE_PRIVATE_URL;

let pool;
if (connectionUrl) {
    console.log('Using connection URL for MySQL');
    
    // Ensure URL has multipleStatements=true if it doesn't already
    let finalUrl = connectionUrl;
    if (!finalUrl.includes('multipleStatements=true')) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'multipleStatements=true';
    }
    
    const useSSL = !finalUrl.includes('localhost') && !finalUrl.includes('127.0.0.1');
    
    pool = mysql.createPool({
        uri: finalUrl,
        ssl: useSSL ? { rejectUnauthorized: false } : undefined,
        multipleStatements: true,
        waitForConnections: true,
        connectionLimit: 10,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
    });
} else {
    // Check if we are in Railway but missing variables
    if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_SERVICE_ID) {
        if (!process.env.MYSQLHOST && !process.env.MYSQL_HOST) {
            console.error('CRITICAL: Running in Railway but database environment variables are missing.');
            console.log('Available Env Keys (to help debug):', Object.keys(process.env).filter(k => 
                k.includes('MYSQL') || k.includes('DB') || k.includes('DATABASE') || k.includes('HOST')
            ).join(', '));
            console.log('Ensure you have linked your MySQL service to this app in Railway Settings -> Variables -> New Variable -> Reference Variable.');
        }
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
