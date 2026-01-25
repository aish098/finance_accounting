const mysql = require('mysql2/promise');

const parsePort = (val) => {
    const port = parseInt(val, 10);
    return isNaN(port) ? 3306 : port;
};

// Clean helper to remove quotes if they were accidentally added in Railway UI
const cleanEnv = (val) => {
    if (!val) return val;
    return val.toString().replace(/^["']|["']$/g, '').trim();
};

const config = {
    host: cleanEnv(process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST),
    user: cleanEnv(process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER),
    password: cleanEnv(process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD),
    database: cleanEnv(process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE),
    port: parsePort(cleanEnv(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT)),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 20000
};

// Log only host and user for security
console.log(`Attempting to connect to MySQL at ${config.host}:${config.port} as ${config.user}`);

const pool = mysql.createPool(config);

module.exports = pool;
