const app = require('./app');
const db = require('./config/db');

// Ensure we don't use the MySQL port (3306) for the web server
let port = process.env.PORT || 3000;
if (port === '3306' || port === 3306) {
    console.log('⚠️ PORT was set to 3306 (MySQL port). Defaulting to 3000 for the web server.');
    port = 3000;
}

async function startServer() {
    // 1. Database Connection Test
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
    } catch (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
        console.error('Check Railway Variables: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT');
    }

    // 2. Start Express Server
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

startServer().catch(err => {
    console.error('CRITICAL: Server failed to start:', err);
});
