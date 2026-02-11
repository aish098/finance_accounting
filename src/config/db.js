require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Database Environment Check:');
console.log(`   - Host: ${process.env.MYSQLHOST || 'not set'}`);
console.log(`   - Port: ${process.env.MYSQLPORT || 'not set (default 3306)'}`);
console.log(`   - User: ${process.env.MYSQLUSER || 'not set'}`);
console.log(`   - DB: ${process.env.MYSQLDATABASE || 'not set'}`);
console.log(`   - Connection String: ${process.env.MYSQL_URL || process.env.DATABASE_URL ? 'available' : 'not set'}`);

// Check if we are on Railway to enforce SSL
const host = process.env.MYSQLHOST || '';
const url = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
const isRailway = host.includes('railway') || url.includes('railway');

const connectionConfig = process.env.MYSQL_URL || process.env.DATABASE_URL || {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
    port: parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10),
    ssl: isRailway ? { rejectUnauthorized: false } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    enableKeepAlive: true,
    multipleStatements: true
};

let pool;
let connectionPromise = null;

async function createPoolWithRetry(retries = 15, delay = 5000) {
    if (pool) return pool;
    
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = (async () => {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`🔄 Connection attempt ${i + 1}/${retries}...`);
                const p = mysql.createPool(connectionConfig);
                
                const connection = await p.getConnection();
                console.log('✅ Database connected successfully!');
                connection.release();
                
                pool = p;
                return p;
            } catch (err) {
                console.error(`❌ Attempt ${i + 1} failed: ${err.message}`);
                if (i === retries - 1) {
                    connectionPromise = null;
                    throw err;
                }
                console.log(`Waiting ${delay / 1000}s before next try...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    })();

    return connectionPromise;
}

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
        if (pool) {
            pool.on(event, callback);
        } else {
            createPoolWithRetry().then(p => p.on(event, callback)).catch(() => {});
        }
    }
};
