const app = require('./app');
const db = require('./config/db');
const port = process.env.PORT || 3000;

async function startServer() {
    // 1. Simple Connection Test
    db.getConnection()
        .then(connection => {
            console.log('✅ MySQL connected successfully');
            connection.release();
        })
        .catch(err => {
            console.error('❌ MySQL connection failed:', err.message);
        });

    // 2. Temporarily disabled init-db and seed to isolate connection
    /*
    const initDb = require('./utils/init-db');
    const seed = require('./utils/seed');
    try {
        await initDb();
        console.log('✅ Database initialized');
        await seed();
        console.log('✅ Database seeded');
    } catch (err) {
        console.error('⚠️ DB startup tasks failed:', err.message);
    }
    */

    // 3. Start listening
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
}

startServer().catch(err => {
    console.error('CRITICAL: Server failed to start:', err);
});
