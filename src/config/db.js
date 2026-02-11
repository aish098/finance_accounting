require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Database Environment Check:');
console.log(`   - Host: ${process.env.MYSQLHOST || 'not set'}`);
console.log(`   - Port: ${process.env.MYSQLPORT || 'not set (default 3306)'}`);
console.log(`   - User: ${process.env.MYSQLUSER || 'not set'}`);
console.log(`   - DB: ${process.env.MYSQLDATABASE || 'not set'}`);
console.log(`   - Password: ${process.env.MYSQLPASSWORD ? '********' : 'not set'}`);
console.log(`   - Connection String: ${process.env.MYSQL_URL || process.env.DATABASE_URL ? 'available' : 'not set'}`);

const connectionConfig = process.env.MYSQL_URL || process.env.DATABASE_URL || {
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
let connectionPromise = null;

async function createPoolWithRetry(retries = 10, delay = 5000) {
    if (pool) return pool;
    
    // If a connection attempt is already in progress, wait for it
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = (async () => {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`🔄 Connection attempt ${i + 1}/${retries}...`);
                const p = mysql.createPool(connectionConfig);
                
                // Test the connection immediately
                const connection = await p.getConnection();
                console.log('✅ Database connected successfully!');
                connection.release();
                
                pool = p;
                return p;
            } catch (err) {
                console.error(`❌ Attempt ${i + 1} failed: ${err.message}`);
                if (i === retries - 1) {
                    connectionPromise = null; // Allow future attempts if all retries fail
                    throw err;
                }
                console.log(`Waiting ${delay / 1000}s before next try...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    })();

    return connectionPromise;
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
        if (pool) {
            pool.on(event, callback);
        } else {
            // If pool doesn't exist yet, we might miss events, 
            // but usually we care about pool errors after it's created
            createPoolWithRetry().then(p => p.on(event, callback)).catch(() => {});
        }
    }
};
