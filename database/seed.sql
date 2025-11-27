
-- Sample Employees
INSERT INTO employees (name, role, email) VALUES
('John Doe', 'Software Engineer', 'john.doe@company.com'),
('Jane Smith', 'Product Manager', 'jane.smith@company.com'),
('Mike Johnson', 'Designer', 'mike.johnson@company.com');

-- Sample Tasks
INSERT INTO tasks (title, description, status, employee_id, due_date) VALUES
('Setup Development Environment', 'Install all necessary tools', 'Completed', 1, '2024-01-15'),
('Design API Schema', 'Create database schema for task management', 'In Progress', 2, '2024-01-20'),
('Create UI Mockups', 'Design wireframes for dashboard', 'To Do', 3, '2024-01-25');

select * from employees;
select * from tasks;