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

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_reservation_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_customer_phone ON customers(phone);

-- Insert sample data for tables
INSERT INTO tables (table_number, capacity, location) VALUES
(1, 2, 'Window'),
(2, 4, 'Window'),
(3, 4, 'Window'),
(4, 6, 'Center'),
(5, 6, 'Center'),
(6, 4, 'Patio'),
(7, 4, 'Patio'),
(8, 8, 'Private Room'),
(9, 2, 'Bar'),
(10, 2, 'Bar'),
(11, 4, 'Center'),
(12, 4, 'Center'),
(13, 6, 'Window'),
(14, 6, 'Window'),
(15, 4, 'Patio'),
(16, 4, 'Patio');

-- Insert sample staff data
INSERT INTO staff (first_name, last_name, email, phone, role) VALUES
('Marco', 'Romano', 'marco@bellacucina.com', '555-0101', 'Manager'),
('Sofia', 'Romano', 'sofia@bellacucina.com', '555-0102', 'Host'),
('Antonio', 'Ricci', 'antonio@bellacucina.com', '555-0103', 'Waiter'),
('Maria', 'Ferrari', 'maria@bellacucina.com', '555-0104', 'Waiter');
