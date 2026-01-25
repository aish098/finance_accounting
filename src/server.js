const app = require('./app');
const initDb = require('./utils/init-db');
const seed = require('./utils/seed');
const db = require('./config/db');
const port = process.env.PORT || 3000;

async function startServer() {
    // 1. Check DB Connection
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
    }

    // 2. Initialize DB (Non-blocking)
    try {
        await initDb();
        console.log('✅ Database initialized');
    } catch (err) {
        console.error('⚠️ DB init skipped or failed:', err.message);
    }

    // 3. Seed Data (Non-blocking)
    try {
        await seed();
        console.log('✅ Database seeded');
    } catch (err) {
        console.error('⚠️ Seeding skipped or failed:', err.message);
    }

    // 4. Start listening
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

startServer().catch(err => {
    console.error('CRITICAL: Server failed to start:', err);
});
