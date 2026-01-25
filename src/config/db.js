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

// Clean helper to remove quotes if they were accidentally added in Railway UI
const cleanEnv = (val) => {
    if (!val) return val;
    return val.replace(/^["']|["']$/g, '').trim();
};

const rawHost = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || process.env.DB_HOSTNAME || process.env.MYSQL_INTERNAL_HOST;
let host = cleanEnv(rawHost) || 'localhost';

const rawPort = process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT;
const port = parsePort(cleanEnv(rawPort)) || 3306;

const user = cleanEnv(process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER) || 'root';
const password = cleanEnv(process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD) || '';
const database = cleanEnv(process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE) || defaultDb;

const config = {
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 20000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

// Handle SSL for Railway/External connections
const isExternal = (h) => h && h !== 'localhost' && h !== '127.0.0.1' && !h.includes('internal') && !h.includes('.local');

if (process.env.MYSQL_URL || process.env.DATABASE_URL || isExternal(config.host)) {
    config.ssl = {
        rejectUnauthorized: false
    };
}

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_INTERNAL_URL || process.env.DATABASE_PRIVATE_URL;

let pool;
if (connectionUrl) {
    const cleanedUrl = cleanEnv(connectionUrl);
    console.log('Using connection URL for MySQL');
    
    let finalUrl = cleanedUrl;
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
    console.log(`Connecting to MySQL at ${config.host}:${config.port} as ${config.user}`);
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