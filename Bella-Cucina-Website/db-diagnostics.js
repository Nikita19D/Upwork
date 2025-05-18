// db-diagnostics.js
require('dotenv').config();
const { Pool } = require('pg');

console.log('Starting database diagnostics...');

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

// Create a connection pool for diagnostics
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 15000, // 15 seconds
    max: 1
});

async function runDiagnostics() {
    let client;
    
    try {
        console.log('Attempting to connect to database...');
        client = await pool.connect();
        console.log('✅ Successfully connected to the database!');
        
        console.log('Testing basic query execution...');
        const result = await client.query('SELECT NOW() as current_time');
        console.log(`✅ Query executed successfully! Server time: ${result.rows[0].current_time}`);
        
        console.log('Checking database version...');
        const versionResult = await client.query('SELECT version()');
        console.log(`✅ Database version: ${versionResult.rows[0].version}`);
        
        console.log('Testing network latency...');
        const startTime = Date.now();
        await client.query('SELECT 1');
        const endTime = Date.now();
        console.log(`✅ Network latency: ${endTime - startTime}ms`);
        
        console.log('Checking for existing tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        if (tablesResult.rows.length === 0) {
            console.log('ℹ️ No tables found in the database.');
        } else {
            console.log('✅ Tables in database:');
            tablesResult.rows.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });
        }
        
        console.log('\n✅ ALL DIAGNOSTICS PASSED! Database connection is working properly.');
        
    } catch (err) {
        console.error('❌ DIAGNOSTICS FAILED!', err);
        console.log('\nTroubleshooting tips:');
        console.log('1. Check if the database server is running and accessible');
        console.log('2. Verify your database credentials are correct');
        console.log('3. Ensure your IP address is allowed in database firewall settings');
        console.log('4. Check if SSL is required and properly configured');
        
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

runDiagnostics();
