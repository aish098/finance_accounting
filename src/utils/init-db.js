const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initDb(retries = 5) {
    try {
        console.log('Database initialization started...');
        
        const schemaPath = path.join(__dirname, '../../schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Remove CREATE DATABASE and USE statements to be portable
        schema = schema.replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '');
        schema = schema.replace(/USE.*;/gi, '');
        
        await db.query(schema);
        
        console.log('Database schema initialized successfully.');
    } catch (error) {
        if (retries > 0) {
            console.log(`Database not ready: ${error.message || error.code || error}`);
            console.log(`Retrying in 5 seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await initDb(retries - 1);
        } else {
            console.error('Database initialization failed after multiple retries:', error);
            throw error;
        }
    }
}

module.exports = initDb;
