// test-db-connection.js
require('dotenv').config();
const { Pool } = require('pg');

console.log('Starting database connection test...');

// Log important environment variables (without sensitive data)
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Database Host: ${process.env.DATABASE_HOST}`);
console.log(`Database Name: ${process.env.DATABASE_NAME}`);
console.log(`Database User: ${process.env.DATABASE_USER}`);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
});

async function testConnection() {
    let client;
    try {
        console.log('Attempting to connect to database...');
        client = await pool.connect();
        console.log('Successfully connected to database!');

        console.log('Testing query execution...');
        const result = await client.query('SELECT NOW()');
        console.log(`Database server time: ${result.rows[0].now}`);

        console.log('Testing database permissions...');
        const schemas = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
        `);
        console.log('Available schemas:', schemas.rows.map(row => row.schema_name));

        console.log('All tests passed! Database connection is working correctly.');
        return true;
    } catch (err) {
        console.error('Database connection test failed:', err);
        console.log('\nTroubleshooting tips:');
        console.log('1. Check if the database server is running');
        console.log('2. Verify your database credentials');
        console.log('3. Check if your IP is allowed in the database firewall settings');
        console.log('4. Ensure SSL settings are correct');
        console.log('5. Check if the database exists and you have permission to access it');
        return false;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

// Run the test
testConnection().then(success => {
    process.exit(success ? 0 : 1);
});
