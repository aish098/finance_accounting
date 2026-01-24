const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initDb() {
    try {
        console.log('Database initialization started...');
        
        const schemaPath = path.join(__dirname, '../../schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Remove CREATE DATABASE and USE statements to be portable
        schema = schema.replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '');
        schema = schema.replace(/USE.*;/gi, '');
        
        await db.query(schema);
        
        console.log('Database schema initialized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initDb();
