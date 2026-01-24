const app = require('./app');
const initDb = require('./utils/init-db');
const seed = require('./utils/seed');
const port = process.env.PORT || 3000;

async function startServer() {
    try {
        // Initialize and seed database before starting server
        await initDb();
        await seed();
        
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
