require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Database configuration for Render
const pool = new Pool({
    connectionString: 'postgresql://schema_uez0_user:BVwbEKyvGYwKht8lJj0kncVbpTDA154p@dpg-cvslha6uk2gs73bpfohg-a.frankfurt-postgres.render.com/schema_uez0',
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit if cannot connect to database
    } else {
        console.log('Connected to Render PostgreSQL database');
    }
});

// Reservation endpoint
app.post('/api/reservations', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { name, email, phone, table, date, time, guests, requests } = req.body;
        const tableNumber = table.replace('Table ', '');

        // Insert customer
        const customerResult = await client.query(
            `INSERT INTO customers (first_name, email, phone)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET phone = $3
             RETURNING customer_id`,
            [name, email, phone]
        );
        const customerId = customerResult.rows[0].customer_id;

        // Create reservation
        await client.query(
            `INSERT INTO reservations (customer_id, table_id, reservation_date, 
             reservation_time, num_guests, special_requests)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [customerId, tableNumber, date, time, guests, requests]
        );

        await client.query('COMMIT');
        res.json({ 
            success: true, 
            message: 'You have successfully reserved your table!' 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ 
            success: false, 
            message: 'Error making reservation: ' + err.message 
        });
    } finally {
        client.release();
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});
