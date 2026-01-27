const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initDb() {
    try {
        console.log('🚀 Starting Database Initialization...');
        
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon to execute statements one by one if needed, 
        // but with multipleStatements: true, we can try executing the cleaned block.
        const cleanedSchema = schema
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
            .join('\n')
            .replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '')
            .replace(/USE.*;/gi, '')
            .trim();
        
        if (cleanedSchema) {
            console.log('📜 Executing SQL Schema...');
            await db.query(cleanedSchema);
            console.log('✅ Database tables created/verified successfully.');
        }
    } catch (error) {
        console.error('❌ Database Init Error:', error.message);
        throw error; // Re-throw so server.js knows it failed
    }
}

module.exports = initDb;
