require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'https://bellacucina-g0b9.onrender.com',
            'null'  // Allow requests with no origin for testing
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Configure email transporter with enhanced error handling and logging
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gusarenkonikita1@gmail.com',
        pass: 'cmgi ybsj vxjm lmwx'
    }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

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

// Database initialization function
async function initializeDatabase(pool) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating database tables...');
        
        // Create tables with IF NOT EXISTS to handle idempotency
        await client.query(`
            CREATE TABLE IF NOT EXISTS tables (
                table_id SERIAL PRIMARY KEY,
                table_number INTEGER NOT NULL UNIQUE,
                capacity INTEGER NOT NULL,
                location VARCHAR(50),
                status VARCHAR(20) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS customers (
                customer_id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE,
                phone VARCHAR(20),
                last_visit DATE,
                preferences TEXT,
                dietary_restrictions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS staff (
                staff_id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE,
                phone VARCHAR(20),
                role VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reservations (
                reservation_id SERIAL PRIMARY KEY,
                customer_id INTEGER NOT NULL,
                table_id INTEGER NOT NULL,
                staff_id INTEGER,
                reservation_date DATE NOT NULL,
                reservation_time TIME NOT NULL,
                num_guests INTEGER NOT NULL,
                special_requests TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS reservation_history (
                history_id SERIAL PRIMARY KEY,
                reservation_id INTEGER NOT NULL,
                customer_id INTEGER NOT NULL,
                table_id INTEGER NOT NULL,
                reservation_date DATE NOT NULL,
                reservation_time TIME NOT NULL,
                num_guests INTEGER NOT NULL,
                status VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating functions and triggers...');
        
        // Create functions and triggers
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
            CREATE TRIGGER update_tables_updated_at
                BEFORE UPDATE ON tables
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
            CREATE TRIGGER update_customers_updated_at
                BEFORE UPDATE ON customers
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
            CREATE TRIGGER update_staff_updated_at
                BEFORE UPDATE ON staff
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
            CREATE TRIGGER update_reservations_updated_at
                BEFORE UPDATE ON reservations
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE OR REPLACE FUNCTION log_reservation_history()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO reservation_history (
                    reservation_id, customer_id, table_id, 
                    reservation_date, reservation_time, num_guests, status
                ) VALUES (
                    NEW.reservation_id, NEW.customer_id, NEW.table_id,
                    NEW.reservation_date, NEW.reservation_time, NEW.num_guests, NEW.status
                );
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS reservation_history_trigger ON reservations;
            CREATE TRIGGER reservation_history_trigger
            AFTER INSERT OR UPDATE ON reservations
            FOR EACH ROW EXECUTE FUNCTION log_reservation_history();
        `);

        console.log('Adding constraints...');
        
        // Add constraints
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE tables ADD CONSTRAINT valid_status 
                    CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance'));
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                ALTER TABLE reservations ADD CONSTRAINT valid_reservation_status 
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                ALTER TABLE reservations ADD CONSTRAINT valid_guest_count 
                    CHECK (num_guests > 0 AND num_guests <= 20);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                ALTER TABLE reservations ADD CONSTRAINT valid_reservation_time 
                    CHECK (
                        reservation_time >= '11:00' AND 
                        (EXTRACT(DOW FROM reservation_date) IN (0) AND reservation_time <= '21:00' OR
                         EXTRACT(DOW FROM reservation_date) IN (1,2,3,4) AND reservation_time <= '22:00' OR
                         EXTRACT(DOW FROM reservation_date) IN (5,6) AND reservation_time <= '23:00')
                    );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                ALTER TABLE reservations
                    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
                    ADD CONSTRAINT fk_table FOREIGN KEY (table_id) REFERENCES tables(table_id),
                    ADD CONSTRAINT fk_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

            DO $$ BEGIN
                ALTER TABLE reservation_history
                    ADD CONSTRAINT fk_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
                    ADD CONSTRAINT fk_customer_history FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
                    ADD CONSTRAINT fk_table_history FOREIGN KEY (table_id) REFERENCES tables(table_id);
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        console.log('Creating indexes...');
        
        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_reservation_history_date ON reservation_history(reservation_date);
            CREATE INDEX IF NOT EXISTS idx_reservation_date_time ON reservations(reservation_date, reservation_time);
            CREATE INDEX IF NOT EXISTS idx_customer_email ON customers(email);
            CREATE INDEX IF NOT EXISTS idx_customer_phone ON customers(phone);
        `);

        console.log('Checking for existing data...');
        
        // Insert sample data if tables are empty
        const tablesCount = await client.query('SELECT COUNT(*) FROM tables');
        if (tablesCount.rows[0].count === '0') {
            console.log('Inserting sample table data...');
            await client.query(`
                INSERT INTO tables (table_number, capacity, location) VALUES
                (1, 2, 'Window'),
                (2, 4, 'Window'),
                (3, 4, 'Window'),
                (4, 6, 'Window'),
                (5, 6, 'Window'),
                (6, 4, 'Patio'),
                (7, 4, 'Patio'),
                (8, 8, 'Private Room'),
                (9, 2, 'Bar'),
                (10, 2, 'Bar'),
                (11, 4, 'Center'),
                (12, 4, 'Center'),
                (13, 6, 'Center'),
                (14, 6, 'Center'),
                (15, 4, 'Patio'),
                (16, 4, 'Patio')
            `);
        }

        const staffCount = await client.query('SELECT COUNT(*) FROM staff');
        if (staffCount.rows[0].count === '0') {
            console.log('Inserting sample staff data...');
            await client.query(`
                INSERT INTO staff (first_name, last_name, email, phone, role) VALUES
                ('Marco', 'Romano', 'marco@bellacucina.com', '555-0101', 'Manager'),
                ('Sofia', 'Romano', 'sofia@bellacucina.com', '555-0102', 'Host'),
                ('Antonio', 'Ricci', 'antonio@bellacucina.com', '555-0103', 'Waiter'),
                ('Maria', 'Ferrari', 'maria@bellacucina.com', '555-0104', 'Waiter')
            `);
        }

        await client.query('COMMIT');
        console.log('Database initialization completed successfully');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Failed to initialize database:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Add after initializeDatabase function
async function initializeDatabaseWithRetry(maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Database initialization attempt ${attempt}/${maxRetries}`);
            await initializeDatabase(pool);
            return true;
        } catch (err) {
            console.error(`Database initialization attempt ${attempt} failed:`, err);
            if (attempt === maxRetries) {
                throw new Error('Failed to initialize database after maximum retries');
            }
            // Exponential backoff with max 30 second delay
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
}

// Enhanced startup sequence
async function startServer() {
    try {
        console.log('Starting server initialization...');
        
        // Initialize database with retry
        await initializeDatabaseWithRetry();
        console.log('Database initialization completed');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV);
        });

        // Set up graceful shutdown
        process.on('SIGTERM', handleShutdown);
        process.on('SIGINT', handleShutdown);
    } catch (err) {
        console.error('Server startup failed:', err);
        process.exit(1);
    }
}

async function handleShutdown(signal) {
    console.log(`${signal} received. Starting graceful shutdown...`);
    try {
        await pool.end();
        console.log('Database connections closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
}

// Health check endpoint with database validation
app.get('/api/health', async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            await client.query('SELECT 1');
            
            // Check if tables exist and have data
            const tablesExist = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'tables'
                ) as has_tables,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'customers'
                ) as has_customers,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'staff'
                ) as has_staff,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'reservations'
                ) as has_reservations
            `);

            const status = {
                status: 'healthy',
                message: 'Server is running',
                database: {
                    connected: true,
                    tables: tablesExist.rows[0]
                },
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            };

            // If tables don't exist, try to initialize the database
            if (!Object.values(tablesExist.rows[0]).every(val => val)) {
                try {
                    await initializeDatabase(pool);
                    status.message = 'Server is running, database initialized';
                } catch (initError) {
                    status.database.initializationError = initError.message;
                }
            }

            res.json(status);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Health check failed:', err);
        res.status(503).json({ 
            status: 'unhealthy', 
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Add database check endpoint with basic auth
app.get('/api/debug/db-check', async (req, res) => {
    // Basic auth check
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = credentials[0];
        const password = credentials[1];

        // Simple check - you should use environment variables for these values
        if (username !== 'admin' || password !== 'bellacucina2025') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const client = await pool.connect();
        try {
            // Get table information
            const tables = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);

            const dbState = {};
            
            // Get row counts for each table
            for (const { table_name } of tables.rows) {
                const countResult = await client.query(`SELECT COUNT(*) FROM ${table_name}`);
                dbState[table_name] = {
                    count: parseInt(countResult.rows[0].count),
                    rows: []
                };

                // Get actual data
                const dataResult = await client.query(`SELECT * FROM ${table_name}`);
                dbState[table_name].rows = dataResult.rows;
            }

            res.json({
                timestamp: new Date().toISOString(),
                tables: tables.rows.map(r => r.table_name),
                state: dbState
            });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Database check failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add table availability check function
async function checkTableAvailability(client, tableNumber, date, time) {
    const result = await client.query(
        `SELECT COUNT(*) FROM reservations 
         WHERE table_id = $1 
         AND reservation_date = $2 
         AND reservation_time = $3 
         AND status NOT IN ('cancelled', 'completed')`,
        [tableNumber, date, time]
    );
    return parseInt(result.rows[0].count) === 0;
}

// Add table availability endpoint
app.get('/api/tables/availability', async (req, res) => {
    const { date, time } = req.query;
    
    if (!date || !time) {
        return res.status(400).json({ 
            success: false, 
            message: 'Date and time are required' 
        });
    }

    let client;
    try {
        client = await pool.connect();
        
        // Get all tables that are booked for the specified date and time
        const result = await client.query(
            `SELECT DISTINCT t.table_number 
             FROM tables t 
             JOIN reservations r ON t.table_id = r.table_id 
             WHERE r.reservation_date = $1 
             AND r.reservation_time = $2 
             AND r.status NOT IN ('cancelled', 'completed')`,
            [date, time]
        );

        res.json({
            success: true,
            bookedTables: result.rows.map(row => row.table_number)
        });
    } catch (err) {
        console.error('Error checking table availability:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking table availability'
        });
    } finally {
        client?.release();
    }
});

// Update reservation endpoint with improved error handling
app.post('/api/reservations', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const { name, email, phone, table, date, time, guests, requests } = req.body;
        
        if (!name || !email || !phone || !table || !date || !time || !guests) {
            throw new Error('Missing required fields');
        }

        // Split full name into first and last name
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

        const tableNumber = parseInt(table.replace('Table ', ''));
        if (isNaN(tableNumber)) {
            throw new Error('Invalid table number format');
        }

        // Verify table exists
        const tableExists = await client.query(
            'SELECT capacity FROM tables WHERE table_number = $1',
            [tableNumber]
        );
        
        if (tableExists.rows.length === 0) {
            throw new Error('Table does not exist');
        }

        // Check if table capacity matches guest count
        if (guests > tableExists.rows[0].capacity) {
            throw new Error(`Table ${tableNumber} only seats ${tableExists.rows[0].capacity} guests`);
        }

        // Check table availability
        const isAvailable = await checkTableAvailability(client, tableNumber, date, time);
        if (!isAvailable) {
            throw new Error('This table is already booked for the selected time');
        }

        // Insert or update customer with both first and last name
        const customerResult = await client.query(
            `INSERT INTO customers (first_name, last_name, email, phone)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO UPDATE 
             SET phone = $4,
                 first_name = $1,
                 last_name = $2
             RETURNING customer_id`,
            [firstName, lastName, email, phone]
        );
        const customerId = customerResult.rows[0].customer_id;

        // Create reservation
        await client.query(
            `INSERT INTO reservations (customer_id, table_id, reservation_date, 
             reservation_time, num_guests, special_requests, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')`,
            [customerId, tableNumber, date, time, guests, requests]
        );

        // Update table status
        await client.query(
            `UPDATE tables SET status = 'reserved' 
             WHERE table_number = $1`,
            [tableNumber]
        );

        await client.query('COMMIT');
        res.json({ 
            success: true, 
            message: 'You have successfully reserved your table!',
            data: {
                reservationDate: date,
                reservationTime: time,
                tableNumber,
                guests
            }
        });

    } catch (err) {
        await client?.query('ROLLBACK');
        console.error('Reservation error:', err);

        let statusCode = 500;
        let errorMessage = 'Error processing reservation';

        if (err.message.includes('Missing required fields')) {
            statusCode = 400;
            errorMessage = err.message;
        } else if (err.message.includes('already booked') || err.message.includes('capacity')) {
            statusCode = 409;
            errorMessage = err.message;
        } else if (err.message.includes('does not exist')) {
            statusCode = 404;
            errorMessage = err.message;
        }

        res.status(statusCode).json({ 
            success: false, 
            message: errorMessage
        });
    } finally {
        client?.release();
    }
});

// Add contact form endpoint with improved error handling
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        // Enhanced validation
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid name (minimum 2 characters)' 
            });
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a message (minimum 10 characters)' 
            });
        }

        try {
            // Send email with timeout and detailed error logging
            await Promise.race([
                transporter.sendMail({
                    from: 'gusarenkonikita1@gmail.com', // Use the same email as auth.user
                    to: 'gusarenkonikita1@gmail.com',   // Send to yourself for testing
                    subject: `New Contact Form Message: ${subject || 'General Inquiry'}`,
                    text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject || 'General Inquiry'}

Message:
${message}
                    `,
                    replyTo: email
                }).catch(error => {
                    console.error('Detailed email error:', {
                        code: error.code,
                        command: error.command,
                        response: error.response,
                        responseCode: error.responseCode,
                        stack: error.stack
                    });
                    throw error;
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email sending timed out')), 30000)
                )
            ]);
            
            console.log('Email sent successfully to:', email);
            res.json({ 
                success: true,
                message: 'Thank you for your message. We will get back to you soon!'
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            throw new Error('Failed to send email. Please try again later.');
        }
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error sending message. Please try again later.'
        });
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
startServer();
