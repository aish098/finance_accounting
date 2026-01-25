const app = require('./app');
const db = require('./config/db');
const initDb = require('./utils/init-db');
const seed = require('./utils/seed');

let port = process.env.PORT || 3000;
if (port === '3306' || port === 3306) {
    port = 3000;
}

async function startServer() {
    // 1. Database Connection Test
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release();
        
        // 2. Initialize and Seed (Only if connected)
        await initDb();
        console.log('✅ Database tables checked/created');
        
        await seed();
        console.log('✅ Initial data seeded');
        
    } catch (err) {
        console.error('❌ Database Startup Error:', err.message);
    }

    // 3. Start Express Server
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

startServer().catch(err => {
    console.error('CRITICAL: Server failed to start:', err);
});
