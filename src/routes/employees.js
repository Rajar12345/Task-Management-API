// // src/routes/employees.js
// const express = require('express');
// const router = express.Router();
// const pool = require('../config/database');

// // GET all employees
// router.get('/', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
//     res.json({ success: true, count: rows.length, data: rows });
//   } catch (err) {
//     console.error('DB error GET /employees', err);
//     res.status(500).json({ error: 'Failed to retrieve employees' });
//   }
// });

// // GET single employee
// router.get('/:id', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
//     if (rows.length === 0) return res.status(404).json({ error: 'Employee not found' });
//     res.json({ success: true, data: rows[0] });
//   } catch (err) {
//     console.error('DB error GET /employees/:id', err);
//     res.status(500).json({ error: 'Failed to retrieve employee' });
//   }
// });

// // POST create employee
// router.post('/', async (req, res) => {
//   try {
//     const { name, role, email } = req.body;
//     if (!name || !role || !email) {
//       return res.status(400).json({ error: 'Missing required fields', required: ['name', 'role', 'email'] });
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });

//     const [result] = await pool.query('INSERT INTO employees (name, role, email) VALUES (?, ?, ?)', [name, role, email]);
//     res.status(201).json({
//       success: true,
//       message: 'Employee created successfully',
//       data: { id: result.insertId, name, role, email }
//     });
//   } catch (err) {
//     console.error('DB error POST /employees', err);
//     if (err.code === 'ER_DUP_ENTRY') {
//       return res.status(409).json({ error: 'Email already exists' });
//     }
//     res.status(500).json({ error: 'Failed to create employee' });
//   }
// });

// // PUT update employee
// router.put('/:id', async (req, res) => {
//   try {
//     const { name, role, email } = req.body;
//     const { id } = req.params;
//     if (!name || !role || !email) {
//       return res.status(400).json({ error: 'Missing required fields', required: ['name', 'role', 'email'] });
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });

//     const [result] = await pool.query('UPDATE employees SET name = ?, role = ?, email = ? WHERE id = ?', [name, role, email, id]);
//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
//     res.json({ success: true, message: 'Employee updated successfully', data: { id: Number(id), name, role, email } });
//   } catch (err) {
//     console.error('DB error PUT /employees/:id', err);
//     if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
//     res.status(500).json({ error: 'Failed to update employee' });
//   }
// });

// // DELETE employee
// router.delete('/:id', async (req, res) => {
//   try {
//     const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Employee not found' });
//     res.json({ success: true, message: 'Employee deleted successfully' });
//   } catch (err) {
//     console.error('DB error DELETE /employees/:id', err);
//     res.status(500).json({ error: 'Failed to delete employee' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all employee routes
router.use(authenticateToken);

// GET all employees
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.promise().query(
            'SELECT id, name, role, email, created_at FROM employees ORDER BY created_at DESC'
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve employees' });
    }
});

// GET single employee
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.promise().query(
            'SELECT id, name, role, email, created_at FROM employees WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve employee' });
    }
});

// POST create employee
router.post('/', async (req, res) => {
    const { name, role, email } = req.body;
    
    // Validation
    if (!name || !role || !email) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['name', 'role', 'email']
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const [result] = await pool.promise().query(
            'INSERT INTO employees (name, role, email) VALUES (?, ?, ?)',
            [name, role, email]
        );
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                id: result.insertId,
                name,
                role,
                email
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

// PUT update employee
router.put('/:id', async (req, res) => {
    const { name, role, email } = req.body;
    const { id } = req.params;

    // Validation
    if (!name || !role || !email) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['name', 'role', 'email']
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const [result] = await pool.promise().query(
            'UPDATE employees SET name = ?, role = ?, email = ? WHERE id = ?',
            [name, role, email, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: { id: parseInt(id), name, role, email }
        });
    } catch (err) {
        console.error('Database error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.promise().query(
            'DELETE FROM employees WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

module.exports = router;