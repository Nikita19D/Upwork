// setup-database.js
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('Starting database setup script...');

// Log connection info without exposing credentials
const dbUrlParts = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : {};
if (dbUrlParts.hostname) {
    console.log(`Database host: ${dbUrlParts.hostname}`);
    console.log(`Database name: ${dbUrlParts.pathname ? dbUrlParts.pathname.substring(1) : 'unknown'}`);
    console.log(`Database user: ${dbUrlParts.username || 'unknown'}`);
} else {
    console.error('DATABASE_URL environment variable is not properly set');
    process.exit(1);
}

// Create a connection pool to the database with improved settings
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 seconds
    max: 5
});

async function setupDatabase(maxRetries = 5) {
    let client;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`Database connection attempt ${retryCount + 1}/${maxRetries}...`);
            
            // Test connection first
            client = await pool.connect();
            console.log('Successfully connected to the database.');
            
            // Test a simple query to verify connection is working
            console.log('Testing database connection with a simple query...');
            const testResult = await client.query('SELECT NOW()');
            console.log(`Database connection verified: ${testResult.rows[0].now}`);
            
            // Read the schema file
            console.log('Reading schema file...');
            const schemaPath = path.join(__dirname, 'db', 'schema.sql');
            
            if (!fs.existsSync(schemaPath)) {
                throw new Error(`Schema file not found at: ${schemaPath}`);
            }
            
            const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
            
            // Apply the schema
            console.log('Applying schema to database...');
            await client.query(schemaSQL);
            console.log('Schema applied successfully!');
            
            console.log('Database setup completed successfully.');
            return true;
        } catch (err) {
            retryCount++;
            console.error(`Database setup attempt ${retryCount} failed:`, err.message);
            
            if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('Maximum retry attempts reached. Database setup failed.');
                throw err;
            }
        } finally {
            if (client) {
                client.release();
                console.log('Database client released.');
            }
        }
    }
}

async function cleanup() {
    console.log('Cleaning up connections...');
    await pool.end();
    console.log('Pool ended. Database setup process complete.');
}

// Main execution
(async () => {
    try {
        await setupDatabase();
    } catch (err) {
        console.error('Fatal error during database setup:', err);
        process.exit(1);
    } finally {
        await cleanup();
    }
})();
