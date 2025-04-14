const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://schema_uez0_user:BVwbEKyvGYwKht8lJj0kncVbpTDA154p@dpg-cvslha6uk2gs73bpfohg-a.frankfurt-postgres.render.com/schema_uez0',
    ssl: {
        rejectUnauthorized: false
    }
});

async function initializeDatabase() {
    try {
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const client = await pool.connect();
        try {
            console.log('Connected to database, applying schema...');
            await client.query(schemaSQL);
            console.log('Schema applied successfully!');
        } finally {
            client.release();
            await pool.end();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initializeDatabase();