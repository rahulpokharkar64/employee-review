CREATE TABLE employees (
    id          SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NULL,
    status      VARCHAR(20) DEFAULT 'Active'
);

INSERT INTO employees (employee_id, name, department, email, status) VALUES
    ('EMP101', 'Asha Raman',    'Engineering', 'asha.raman@example.com',    'Active'),
    ('EMP102', 'Ravi Kumar',    'Engineering', 'ravi.kumar@example.com',    'Active'),
    ('EMP103', 'Meera Nair',    'Quality',     'meera.nair@example.com',    'Active'),
    ('EMP104', 'John Peters',   'Operations',  'john.peters@example.com',   'Active'),
    ('EMP105', 'Sara Thomas',   'HR',          NULL,                        'Inactive');
