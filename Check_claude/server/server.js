require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', message: 'Server is running' });
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(503).json({ status: 'unhealthy', message: err.message });
    }
});

// Reservation endpoint
app.post('/api/reservations', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
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
        console.error('Reservation error:', err);
        if (!client) {
            return res.status(503).json({
                success: false,
                message: 'Database connection failed'
            });
        }
        await client?.query('ROLLBACK');
        res.status(500).json({ 
            success: false, 
            message: 'Error making reservation: ' + err.message 
        });
    } finally {
        client?.release();
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Add error logging middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});
