-- ============================================================
-- LPG Restaurant Management System — Database Schema
-- DBMS Mini Project
-- ============================================================

-- NOTE: Hibernate (ddl-auto=update) creates tables automatically.
-- This file is provided for reference, manual setup, and to
-- demonstrate the relational design clearly.

-- Run this manually in psql if you prefer manual setup:
--   psql -U postgres -d lpg_db -f schema.sql

-- ============================================================
-- DROP (safe re-run order — children before parents)
-- ============================================================
DROP TABLE IF EXISTS gas_usage         CASCADE;
DROP TABLE IF EXISTS cylinder_orders   CASCADE;
DROP TABLE IF EXISTS inventory         CASCADE;
DROP TABLE IF EXISTS cylinders         CASCADE;
DROP TABLE IF EXISTS suppliers         CASCADE;
DROP TABLE IF EXISTS restaurants       CASCADE;

-- ============================================================
-- TABLE: restaurants
-- Stores the client restaurants managed by this system.
-- ============================================================
CREATE TABLE restaurants (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    city             VARCHAR(100) NOT NULL,
    address          TEXT,
    owner_name       VARCHAR(255) NOT NULL,
    phone            VARCHAR(20),
    email            VARCHAR(255),
    license_number   VARCHAR(100),
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
    notes            TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: suppliers
-- LPG cylinder suppliers / distributors.
-- ============================================================
CREATE TABLE suppliers (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    city             VARCHAR(100) NOT NULL,
    address          TEXT,
    contact          VARCHAR(50) NOT NULL,
    email            VARCHAR(255),
    license_number   VARCHAR(100),
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','INACTIVE')),
    notes            TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: cylinders
-- Cylinder types/specifications (e.g. Commercial 19kg).
-- ============================================================
CREATE TABLE cylinders (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(100) NOT NULL UNIQUE,
    weight_kg   DOUBLE PRECISION NOT NULL CHECK (weight_kg > 0),
    brand       VARCHAR(100),
    description TEXT
);

-- ============================================================
-- TABLE: inventory
-- Tracks full/empty cylinder stock per restaurant per type.
-- Unique constraint ensures one row per (restaurant, cylinder).
-- ============================================================
CREATE TABLE inventory (
    id                   BIGSERIAL PRIMARY KEY,
    restaurant_id        BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    cylinder_id          BIGINT NOT NULL REFERENCES cylinders(id)   ON DELETE RESTRICT,
    full_cylinders       INT NOT NULL DEFAULT 0 CHECK (full_cylinders >= 0),
    empty_cylinders      INT NOT NULL DEFAULT 0 CHECK (empty_cylinders >= 0),
    on_order_cylinders   INT NOT NULL DEFAULT 0 CHECK (on_order_cylinders >= 0),
    minimum_stock_level  INT NOT NULL DEFAULT 3  CHECK (minimum_stock_level >= 0),
    last_updated         TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_inventory_restaurant_cylinder UNIQUE (restaurant_id, cylinder_id)
);

-- ============================================================
-- TABLE: cylinder_orders
-- Purchase orders from restaurants to suppliers.
-- ============================================================
CREATE TABLE cylinder_orders (
    id                     BIGSERIAL PRIMARY KEY,
    restaurant_id          BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    supplier_id            BIGINT NOT NULL REFERENCES suppliers(id)   ON DELETE RESTRICT,
    cylinder_id            BIGINT          REFERENCES cylinders(id)   ON DELETE SET NULL,
    quantity               INT NOT NULL CHECK (quantity > 0),
    price_per_unit         NUMERIC(12,2),
    total_amount           NUMERIC(12,2),
    order_date             DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    delivered_date         DATE,
    status                 VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                               CHECK (status IN ('PENDING','CONFIRMED','DISPATCHED','DELIVERED','CANCELLED')),
    notes                  TEXT,
    created_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: gas_usage
-- Daily gas consumption records logged by each restaurant.
-- ============================================================
CREATE TABLE gas_usage (
    id              BIGSERIAL PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    cylinder_id     BIGINT          REFERENCES cylinders(id)   ON DELETE SET NULL,
    cylinders_used  INT NOT NULL CHECK (cylinders_used >= 0),
    usage_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_period     VARCHAR(20) CHECK (meal_period IN ('BREAKFAST','LUNCH','DINNER','ALL_DAY')),
    covers_served   INT NOT NULL DEFAULT 0 CHECK (covers_served >= 0),
    notes           TEXT,
    recorded_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for common query patterns
-- ============================================================
CREATE INDEX idx_inventory_restaurant   ON inventory(restaurant_id);
CREATE INDEX idx_inventory_critical     ON inventory(restaurant_id) WHERE full_cylinders <= minimum_stock_level;
CREATE INDEX idx_orders_restaurant      ON cylinder_orders(restaurant_id);
CREATE INDEX idx_orders_status          ON cylinder_orders(status);
CREATE INDEX idx_orders_date            ON cylinder_orders(order_date DESC);
CREATE INDEX idx_gas_usage_restaurant   ON gas_usage(restaurant_id);
CREATE INDEX idx_gas_usage_date         ON gas_usage(usage_date DESC);

-- ============================================================
-- VIEWS for useful summaries (DBMS showcase)
-- ============================================================

-- View: current stock status per restaurant per cylinder
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT
    r.name                           AS restaurant,
    r.city,
    c.type                           AS cylinder_type,
    i.full_cylinders,
    i.empty_cylinders,
    i.on_order_cylinders,
    i.minimum_stock_level,
    CASE
        WHEN i.full_cylinders = 0               THEN 'OUT OF STOCK'
        WHEN i.full_cylinders <= i.minimum_stock_level THEN 'CRITICAL'
        ELSE 'OK'
    END                              AS stock_status,
    i.last_updated
FROM inventory i
JOIN restaurants r ON r.id = i.restaurant_id
JOIN cylinders   c ON c.id = i.cylinder_id
ORDER BY stock_status, r.name;

-- View: monthly gas usage summary
CREATE OR REPLACE VIEW v_monthly_usage AS
SELECT
    TO_CHAR(usage_date, 'YYYY-MM')   AS month,
    r.name                           AS restaurant,
    SUM(g.cylinders_used)            AS cylinders_used,
    SUM(g.covers_served)             AS covers_served
FROM gas_usage g
JOIN restaurants r ON r.id = g.restaurant_id
GROUP BY TO_CHAR(usage_date, 'YYYY-MM'), r.name
ORDER BY month DESC, cylinders_used DESC;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

INSERT INTO restaurants (name, city, address, owner_name, phone, email, license_number, status) VALUES
('Spice Garden',     'Bengaluru', '12 MG Road, Bengaluru',        'Ravi Kumar',   '9876543210', 'ravi@spicegarden.in',   'LIC-BLR-001', 'ACTIVE'),
('Royal Biryani',    'Bengaluru', '45 Brigade Road, Bengaluru',   'Salim Khan',   '9876543211', 'salim@royalbiryani.in', 'LIC-BLR-002', 'ACTIVE'),
('Coastal Flavours', 'Mangaluru', '8 Lighthouse Hill, Mangaluru', 'Anita Shenoy', '9876543212', 'anita@coastal.in',      'LIC-MNG-001', 'ACTIVE'),
('Udupi Dhaba',      'Mysuru',   '22 Devaraja Urs Road, Mysuru', 'Ganesh Rao',   '9876543213', 'ganesh@udupi.in',       'LIC-MYS-001', 'ACTIVE');

INSERT INTO suppliers (name, city, address, contact, email, license_number, status) VALUES
('HP Gas Distributors',    'Bengaluru', '5 Industrial Area',     '9900112233', 'hp@dist.in',    'SUP-HP-001',  'ACTIVE'),
('Indane LPG Suppliers',   'Bengaluru', '17 Ring Road',          '9900112244', 'ind@dist.in',   'SUP-IND-001', 'ACTIVE'),
('Bharat Gas Traders',     'Mangaluru', '3 Port Road, Mangaluru','9900112255', 'bgt@dist.in',   'SUP-BG-001',  'ACTIVE');

INSERT INTO cylinders (type, weight_kg, brand, description) VALUES
('Commercial 19kg',  19.0, 'HP Gas',    'Standard commercial LPG cylinder for restaurants'),
('Commercial 47.5kg',47.5, 'Indane',    'Large commercial cylinder for high-usage kitchens'),
('Domestic 14.2kg',  14.2, 'Bharat Gas','Domestic cylinder sometimes used for backup');

INSERT INTO inventory (restaurant_id, cylinder_id, full_cylinders, empty_cylinders, on_order_cylinders, minimum_stock_level) VALUES
(1, 1, 8,  2, 0, 3),
(1, 2, 2,  1, 0, 2),
(2, 1, 3,  4, 5, 3),  -- exactly at minimum → critical
(2, 2, 1,  2, 0, 2),  -- below minimum → critical
(3, 1, 10, 1, 0, 3),
(4, 1, 2,  3, 4, 3);  -- below minimum → critical

INSERT INTO cylinder_orders (restaurant_id, supplier_id, cylinder_id, quantity, price_per_unit, total_amount, order_date, expected_delivery_date, status) VALUES
(2, 1, 1, 5, 950.00, 4750.00, CURRENT_DATE - 3, CURRENT_DATE + 1, 'CONFIRMED'),
(2, 1, 2, 2, 2200.00, 4400.00, CURRENT_DATE - 1, CURRENT_DATE + 2, 'PENDING'),
(4, 2, 1, 4, 960.00, 3840.00, CURRENT_DATE - 2, CURRENT_DATE,     'DISPATCHED'),
(1, 1, 1, 6, 950.00, 5700.00, CURRENT_DATE - 7, CURRENT_DATE - 2, 'DELIVERED');

INSERT INTO gas_usage (restaurant_id, cylinder_id, cylinders_used, usage_date, meal_period, covers_served, notes) VALUES
(1, 1, 2, CURRENT_DATE,     'ALL_DAY',   120, 'Normal weekday'),
(1, 1, 3, CURRENT_DATE - 1, 'ALL_DAY',   180, 'Busy Saturday'),
(2, 1, 2, CURRENT_DATE,     'LUNCH',      90, NULL),
(2, 1, 1, CURRENT_DATE,     'DINNER',     70, NULL),
(3, 1, 1, CURRENT_DATE,     'ALL_DAY',    60, NULL),
(4, 1, 2, CURRENT_DATE - 1, 'ALL_DAY',   100, 'Weekend rush'),
(1, 1, 2, CURRENT_DATE - 2, 'ALL_DAY',   110, NULL),
(2, 1, 3, CURRENT_DATE - 2, 'ALL_DAY',   200, 'Event catering'),
(3, 1, 1, CURRENT_DATE - 3, 'LUNCH',      55, NULL),
(4, 1, 1, CURRENT_DATE - 3, 'DINNER',     80, NULL);
