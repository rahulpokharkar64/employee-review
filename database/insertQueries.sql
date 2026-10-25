INSERT INTO employees (employee_id, name, department, email, status) VALUES
('EMP101', 'Alice Smith', 'Engineering', 'alice.smith@example.com', 'Active'),
('EMP102', 'Bob Jones', 'Marketing', 'bob.jones@example.com', 'Active'),
('EMP103', 'Charlie Brown', 'Engineering', 'charlie.brown@example.com', 'Active'),
('EMP104', 'Diana Prince', 'Human Resources', 'diana.prince@example.com', 'Active'),
('EMP105', 'Evan Wright', 'Finance', 'evan.wright@example.com', 'Active'),
('EMP106', 'Fiona Gallagher', 'Marketing', 'fiona.gallagher@example.com', 'Inactive'),
('EMP107', 'George Clark', 'Engineering', 'george.clark@example.com', 'Active'),
('EMP108', 'Hannah Abbott', 'Customer Support', 'hannah.abbott@example.com', 'Active'),
('EMP109', 'Ian Malcolm', 'Research', 'ian.malcolm@example.com', 'Active'),
('EMP110', 'Julia Roberts', 'Sales', 'julia.roberts@example.com', 'Active'),
('EMP111', 'Kevin Bacon', 'Sales', 'kevin.bacon@example.com', 'Active'),
('EMP112', 'Laura Croft', 'Engineering', 'laura.croft@example.com', 'Active'),
('EMP113', 'Michael Scott', 'Management', 'michael.scott@example.com', 'Active'),
('EMP114', 'Pam Beesly', 'Human Resources', 'pam.beesly@example.com', 'Active'),
('EMP115', 'Jim Halpert', 'Sales', 'jim.halpert@example.com', 'Active'),
('EMP116', 'Dwight Schrute', 'Sales', 'dwight.schrute@example.com', 'Active'),
('EMP117', 'Angela Martin', 'Accounting', 'angela.martin@example.com', 'Active'),
('EMP118', 'Oscar Martinez', 'Accounting', 'oscar.martinez@example.com', 'Active'),
('EMP119', 'Stanley Hudson', 'Sales', 'stanley.hudson@example.com', 'Active'),
('EMP120', 'Ryan Howard', 'Management', 'ryan.howard@example.com', 'Inactive'),
('EMP121', 'Kelly Kapoor', 'Customer Support', 'kelly.kapoor@example.com', 'Active'),
('EMP122', 'Toby Flenderson', 'Human Resources', 'toby.flenderson@example.com', 'Inactive');



-----------
INSERT INTO review_periods (name, start_date, end_date, status) VALUES
('H1 2025', '2025-01-01', '2025-06-30', 'Closed'),
('H2 2025', '2025-07-01', '2025-12-31', 'Closed'),
('H1 2026', '2026-01-01', '2026-06-30', 'Open'),
('H2 2026', '2026-07-01', '2026-12-31', 'Open');


------

INSERT INTO performance_reviews (employee_id, period_id, quality_rating, delivery_rating, teamwork_rating, average_rating, comments) VALUES
(1, 1, 5, 4, 5, 4.67, 'Exceptional performance and leadership skills shown during H1.'),
(2, 1, 4, 3, 4, 3.67, 'Good campaign management, can improve on deadlines.'),
(3, 1, 5, 5, 4, 4.67, 'Delivered core backend features ahead of schedule.'),
(4, 1, 4, 4, 5, 4.33, 'Great initiatives taken in employee engagement.'),
(5, 1, 3, 4, 3, 3.33, 'Solid financial reporting with minimal errors.'),
(6, 1, 3, 3, 3, 3.00, 'Average output before transitioning out.'),
(7, 1, 5, 4, 4, 4.33, 'Strong technical aptitude and problem solver.'),
(8, 1, 4, 5, 5, 4.67, 'Customer satisfaction ratings are at an all-time high.'),
(9, 1, 4, 4, 3, 3.67, 'Innovative solutions brought to research tasks.'),
(10, 1, 5, 5, 5, 5.00, 'Exceeded sales quotas significantly.'),
(11, 2, 4, 4, 4, 4.00, 'Consistent performance across the board.'),
(12, 2, 5, 5, 4, 4.67, 'Key contributor to system architecture revamp.'),
(13, 2, 3, 3, 4, 3.33, 'Branch management has room for strategic growth.'),
(14, 2, 5, 4, 5, 4.67, 'Exemplary HR documentation and support.'),
(15, 2, 4, 5, 4, 4.33, 'Exceeded quarterly revenue targets consistently.'),
(16, 2, 5, 5, 3, 4.33, 'Top sales volume, but teamwork can be enhanced.'),
(17, 2, 4, 4, 3, 3.67, 'Accounting records are meticulously maintained.'),
(18, 2, 5, 4, 5, 4.67, 'Extremely thorough with financial audits.'),
(19, 2, 3, 3, 3, 3.00, 'Met baseline expectations.'),
(20, 2, 2, 3, 2, 2.33, 'Struggled with project deliverables.'),
(21, 3, 4, 4, 4, 4.00, 'Showing great responsiveness on support tickets.'),
(22, 3, 3, 3, 4, 3.33, 'Adequate handling of compliance documentation.');