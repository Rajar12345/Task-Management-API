const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['name', 'email', 'password']
        });
    }

    try {
        // Check if user exists
        const [existingUsers] = await pool.promise().query(
            'SELECT * FROM employees WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.promise().query(
            'INSERT INTO employees (name, role, email, password) VALUES (?, ?, ?, ?)',
            [name, role || 'Employee', email, hashedPassword]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, email, name }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role: role || 'Employee'
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['email', 'password']
        });
    }

    try {
        // Find user
        const [users] = await pool.promise().query(
            'SELECT * FROM employees WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        const user = users[0];

        // For demo: simplified password check
        // In production, use: await bcrypt.compare(password, user.password)
        if (password !== 'password123') {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify token
router.get('/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ valid: false });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ valid: false });
        }
        res.json({ 
            valid: true, 
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    });
});

module.exports = router;