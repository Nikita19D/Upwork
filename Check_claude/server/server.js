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
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// API Routes
app.post('/api/reservations', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { name, email, phone, table, date, time, guests, requests, occasion } = req.body;
        const tableNumber = table.replace('Table ', '');

        const customerResult = await client.query(
            `INSERT INTO customers (first_name, email, phone) 
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET customer_id = EXCLUDED.customer_id
             RETURNING customer_id`,
            [name, email, phone]
        );
        const customerId = customerResult.rows[0].customer_id;

        const tableResult = await client.query(
            'SELECT table_id FROM tables WHERE table_number = $1',
            [tableNumber]
        );
        const tableId = tableResult.rows[0].table_id;

        await client.query(
            `INSERT INTO reservations 
             (customer_id, table_id, reservation_date, reservation_time, num_guests, special_requests)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [customerId, tableId, date, time, guests, requests]
        );

        await client.query('COMMIT');
        res.json({ success: true, message: 'Reservation successful' });

    } catch (err) {
        await client.query('ROLLBACK');
        res.json({ success: false, message: err.message });
    } finally {
        client.release();
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
