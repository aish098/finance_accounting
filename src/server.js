const app = require('./app');
const db = require('./config/db');
const port = process.env.PORT || 3000;

async function startServer() {
    // 1. Clear Connection Test
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
    } catch (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
        console.error('Check your Railway environment variables (MYSQLHOST, MYSQLUSER, etc.)');
    }

    // 2. Start Server
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${port}`);
        console.log(`Health check: http://0.0.0.0:${port}/health`);
    });
}

startServer().catch(err => {
    console.error('CRITICAL: Server failed to start:', err);
});
