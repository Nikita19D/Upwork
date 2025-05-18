// setup-database.js
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Starting database setup script...');
console.log(`Connecting to database: ${process.env.DATABASE_NAME} at ${process.env.DATABASE_HOST}`);

// Create a connection pool to the database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    let client;
    try {
        // Connect to the database
        client = await pool.connect();
        console.log('Successfully connected to the database.');
        
        // Read the schema file
        console.log('Reading schema file...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
        
        // Apply the schema
        console.log('Applying schema to database...');
        await client.query(schemaSQL);
        console.log('Schema applied successfully!');
        
        console.log('Database setup completed successfully.');
    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

setupDatabase();
