const app = require('./app');
const db = require('./config/db');
const initDb = require('./utils/init-db');
const seed = require('./utils/seed');

let port = process.env.PORT || 3000;
if (port === '3306' || port === 3306) {
    port = 3000;
}

async function startServer() {
    // Start Express Server immediately
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on http://127.0.0.1:${port}`);
        console.log(`🚀 Access via localhost: http://localhost:${port}`);
    });

    // Try database connection in background (non-blocking)
    setTimeout(async () => {
        try {
            console.log('🔄 Attempting database connection...');
            const connection = await db.getConnection();
            console.log('✅ MySQL connected successfully');
            connection.release();

            // Initialize and Seed (Only if connected)
            await initDb();
            console.log('✅ Database tables checked/created');

            await seed();
            console.log('✅ Initial data seeded');

        } catch (err) {
            console.error('❌ Database Startup Error:', err.message);
            console.error('⚠️  Server is running but database is not connected');
            console.error('Please check your DATABASE_URL or MYSQL environment variables');
        }
    }, 1000); // Wait 1 second before trying DB connection
}

startServer().catch(err => {
    console.error('CRITICAL: Server failed to start:', err);
    process.exit(1);
});
