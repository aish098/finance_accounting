const mysql = require('mysql2/promise');

// Strict Railway configuration
const config = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: parseInt(process.env.MYSQLPORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};

console.log(`Attempting to connect to MySQL at ${config.host}:${config.port} as ${config.user}`);

const pool = mysql.createPool(config);

module.exports = pool;
