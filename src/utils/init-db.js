const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initDb(retries = 10) {
    try {
        console.log('Database initialization started...');
        
        const schemaPath = path.join(__dirname, '../../schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Remove comments and handle multiple statements properly
        // This cleaning makes the schema more portable across different MySQL environments (like Railway)
        const cleanedSchema = schema
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
            .join('\n')
            .replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '')
            .replace(/USE.*;/gi, '')
            .trim();
        
        if (cleanedSchema) {
            console.log('Executing database schema...');
            await db.query(cleanedSchema);
            console.log('Database schema initialized successfully.');
        } else {
            console.log('Schema is empty after cleaning, skipping execution.');
        }
        
    } catch (error) {
        if (retries > 0) {
            console.log(`Database not ready or error occurred: ${error.message || error.code || error}`);
            console.log(`Retrying in 5 seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await initDb(retries - 1);
        } else {
            console.error('Database initialization failed after multiple retries:', error);
            // Don't throw here to allow the server to start if the DB is already initialized
            // and just connectivity was the issue during init
            console.log('Continuing server startup despite init-db failure...');
        }
    }
}

module.exports = initDb;
