-- Move existing database.sql content here
-- ...existing database schema code...
-- Create database
CREATE DATABASE bella_cucina;
\c bella_cucina;

-- Create tables table
CREATE TABLE tables (
    table_id SERIAL PRIMARY KEY,
    table_number INTEGER NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    location VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add table status validation
ALTER TABLE tables 
ADD CONSTRAINT valid_status CHECK (status IN ('available', 'reserved', 'occupied', 'maintenance'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhance customers table
ALTER TABLE customers 
ADD COLUMN last_visit DATE,
ADD COLUMN preferences TEXT,
ADD COLUMN dietary_restrictions TEXT;

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create staff table
CREATE TABLE staff (
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

CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create reservations table
CREATE TABLE reservations (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_table FOREIGN KEY (table_id) REFERENCES tables(table_id),
    CONSTRAINT fk_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Add reservation status validation
ALTER TABLE reservations 
ADD CONSTRAINT valid_reservation_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
ADD CONSTRAINT valid_guest_count CHECK (num_guests > 0 AND num_guests <= 20),
ADD CONSTRAINT valid_reservation_time CHECK (
    reservation_time >= '11:00' AND 
    (EXTRACT(DOW FROM reservation_date) IN (0) AND reservation_time <= '21:00' OR
     EXTRACT(DOW FROM reservation_date) IN (1,2,3,4) AND reservation_time <= '22:00' OR
     EXTRACT(DOW FROM reservation_date) IN (5,6) AND reservation_time <= '23:00')
);

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create reservation history table for analytics
CREATE TABLE reservation_history (
    history_id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    table_id INTEGER NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    num_guests INTEGER NOT NULL,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (table_id) REFERENCES tables(table_id)
);

-- Create trigger for reservation history
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

CREATE TRIGGER reservation_history_trigger
AFTER INSERT OR UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION log_reservation_history();

-- Add index for reservation history queries
CREATE INDEX idx_reservation_history_date ON reservation_history(reservation_date);

-- Add indexes for better performance
CREATE INDEX idx_reservation_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_customer_phone ON customers(phone);

-- Insert sample data for tables
INSERT INTO tables (table_number, capacity, location) VALUES
(1, 2, 'Window'),
(2, 4, 'Window'),
(3, 4, 'Window'),
(4, 6, 'Window'),    -- Changed from Bar
(5, 6, 'Window'),     -- Changed from Bar
(6, 4, 'Patio'),
(7, 4, 'Patio'),
(8, 8, 'Private Room'),
(9, 2, 'Bar'),
(10, 2, 'Bar'),
(11, 4, 'Center'),
(12, 4, 'Center'),
(13, 6, 'Center'), -- Changed from Bar
(14, 6, 'Center'), -- Changed from Bar
(15, 4, 'Patio'),
(16, 4, 'Patio');

-- Insert sample staff data
INSERT INTO staff (first_name, last_name, email, phone, role) VALUES
('Marco', 'Romano', 'marco@bellacucina.com', '555-0101', 'Manager'),
('Sofia', 'Romano', 'sofia@bellacucina.com', '555-0102', 'Host'),
('Antonio', 'Ricci', 'antonio@bellacucina.com', '555-0103', 'Waiter'),
('Maria', 'Ferrari', 'maria@bellacucina.com', '555-0104', 'Waiter');
