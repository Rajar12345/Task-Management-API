const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const taskRoutes = require('./routes/tasks');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Task Management API with JWT Authentication (MySQL)',
        version: '1.0.0',
        status: 'Active',
        database: 'MySQL',
        authentication: 'JWT Token Required',
        endpoints: {
            public: {
                root: 'GET /',
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                getTasks: 'GET /api/tasks'
            },
            protected: {
                employees: 'GET /api/employees (requires auth)',
                createEmployee: 'POST /api/employees (requires auth)',
                createTask: 'POST /api/tasks (requires auth)',
                updateTask: 'PUT /api/tasks/:id (requires auth)',
                deleteTask: 'DELETE /api/tasks/:id (requires auth)'
            }
        },
        testCredentials: {
            email: 'john.doe@company.com',
            password: 'password123'
        }
    });
});

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
app.use('/api/auth', authRoutes);

// Public route - anyone can view tasks
router = express.Router();
router.get('/', async (req, res) => {
    const { pool } = require('./config/database');
    const { status, employee_id } = req.query;
    
    let query = `
        SELECT 
            t.*,
            e.name as employee_name,
            e.email as employee_email,
            e.role as employee_role
        FROM tasks t
        LEFT JOIN employees e ON t.employee_id = e.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        query += ' AND t.status = ?';
        params.push(status);
    }

    if (employee_id) {
        query += ' AND t.employee_id = ?';
        params.push(employee_id);
    }

    query += ' ORDER BY t.created_at DESC';

    try {
        const [rows] = await pool.promise().query(query, params);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
});
app.use('/api/tasks', router);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;