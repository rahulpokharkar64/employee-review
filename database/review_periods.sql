CREATE TABLE review_periods (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    status     VARCHAR(20) DEFAULT 'Open'
);

INSERT INTO review_periods (name, start_date, end_date, status) VALUES
    ('H2 2025', '2025-07-01', '2025-12-31', 'Closed'),
    ('H1 2026', '2026-01-01', '2026-06-30', 'Closed'),
    ('H2 2026', '2026-07-01', '2026-12-31', 'Open');
