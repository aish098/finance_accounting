require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Database Environment Check:');
console.log(`   - Host: ${process.env.MYSQLHOST || 'not set'}`);
console.log(`   - User: ${process.env.MYSQLUSER || 'not set'}`);
console.log(`   - DB: ${process.env.MYSQLDATABASE || 'not set'}`);
console.log(`   - Password: ${process.env.MYSQLPASSWORD ? '********' : 'not set'}`);

const config = {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
    port: parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000, // 30 seconds
    enableKeepAlive: true,
    multipleStatements: true
};

let pool;

async function createPoolWithRetry(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔄 Connection attempt ${i + 1}/${retries}...`);
            const p = mysql.createPool(config);
            // Test the connection immediately
            await p.query('SELECT 1');
            console.log('✅ Database connected successfully!');
            pool = p;
            return p;
        } catch (err) {
            console.error(`❌ Attempt ${i + 1} failed: ${err.message}`);
            if (i === retries - 1) throw err;
            console.log(`Waiting ${delay / 1000}s before next try...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Export a proxy or a promise-based getter
module.exports = {
    async query(sql, params) {
        if (!pool) await createPoolWithRetry();
        return pool.query(sql, params);
    },
    async getConnection() {
        if (!pool) await createPoolWithRetry();
        return pool.getConnection();
    },
    on(event, callback) {
        // Simple event forwarder for pool events
        if (pool) pool.on(event, callback);
    }
};
