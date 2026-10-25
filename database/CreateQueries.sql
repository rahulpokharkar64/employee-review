-- 1. Employees Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active'
);
CREATE TABLE employees (
    id          SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NULL,
    status      VARCHAR(20) DEFAULT 'Active'
);

-- 2. Review Periods Table
CREATE TABLE review_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Open'
);

-- 3. Performance Reviews Table
CREATE TABLE performance_reviews (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    period_id INTEGER NOT NULL,
    quality_rating INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
    delivery_rating INTEGER NOT NULL CHECK (delivery_rating BETWEEN 1 AND 5),
    teamwork_rating INTEGER NOT NULL CHECK (teamwork_rating BETWEEN 1 AND 5),
    average_rating DECIMAL(3,2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_period FOREIGN KEY (period_id) REFERENCES review_periods(id) ON DELETE CASCADE
);
CREATE TABLE performance_reviews (
    id              SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(id),
    period_id       INTEGER NOT NULL REFERENCES review_periods(id),
    quality_rating  INTEGER NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
    delivery_rating INTEGER NOT NULL CHECK (delivery_rating BETWEEN 1 AND 5),
    teamwork_rating INTEGER NOT NULL CHECK (teamwork_rating BETWEEN 1 AND 5),
    average_rating  DECIMAL(3,2) NOT NULL,
    comments        TEXT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);