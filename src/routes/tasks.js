// // src/routes/tasks.js
// const express = require('express');
// const router = express.Router();
// const pool = require('../config/database');

// // GET all tasks with optional filters
// router.get('/', async (req, res) => {
//   try {
//     const { status, employee_id } = req.query;
//     let sql = `
//       SELECT t.*, e.name AS employee_name, e.email AS employee_email, e.role AS employee_role
//       FROM tasks t
//       LEFT JOIN employees e ON t.employee_id = e.id
//       WHERE 1=1
//     `;
//     const params = [];
//     if (status) {
//       sql += ' AND t.status = ?';
//       params.push(status);
//     }
//     if (employee_id) {
//       sql += ' AND t.employee_id = ?';
//       params.push(employee_id);
//     }
//     sql += ' ORDER BY t.created_at DESC';
//     const [rows] = await pool.query(sql, params);
//     res.json({ success: true, count: rows.length, data: rows });
//   } catch (err) {
//     console.error('DB error GET /tasks', err);
//     res.status(500).json({ error: 'Failed to retrieve tasks' });
//   }
// });

// // GET single task
// router.get('/:id', async (req, res) => {
//   try {
//     const sql = `
//       SELECT t.*, e.name AS employee_name, e.email AS employee_email, e.role AS employee_role
//       FROM tasks t
//       LEFT JOIN employees e ON t.employee_id = e.id
//       WHERE t.id = ?
//     `;
//     const [rows] = await pool.query(sql, [req.params.id]);
//     if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
//     res.json({ success: true, data: rows[0] });
//   } catch (err) {
//     console.error('DB error GET /tasks/:id', err);
//     res.status(500).json({ error: 'Failed to retrieve task' });
//   }
// });

// // POST create task
// router.post('/', async (req, res) => {
//   try {
//     const { title, description, status, employee_id, due_date } = req.body;
//     if (!title) return res.status(400).json({ error: 'Missing required field', required: ['title'] });

//     const validStatuses = ['To Do', 'In Progress', 'Completed'];
//     if (status && !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status', validStatuses });

//     const [result] = await pool.query(
//       `INSERT INTO tasks (title, description, status, employee_id, due_date)
//        VALUES (?, ?, ?, ?, ?)`,
//       [title, description || null, status || 'To Do', employee_id || null, due_date || null]
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Task created successfully',
//       data: { id: result.insertId, title, description, status: status || 'To Do', employee_id, due_date }
//     });
//   } catch (err) {
//     console.error('DB error POST /tasks', err);
//     res.status(500).json({ error: 'Failed to create task' });
//   }
// });

// // PUT update task
// router.put('/:id', async (req, res) => {
//   try {
//     const { title, description, status, employee_id, due_date } = req.body;
//     const { id } = req.params;

//     if (!title) return res.status(400).json({ error: 'Missing required field', required: ['title'] });
//     const validStatuses = ['To Do', 'In Progress', 'Completed'];
//     if (status && !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status', validStatuses });

//     const [result] = await pool.query(
//       `UPDATE tasks
//        SET title = ?, description = ?, status = ?, employee_id = ?, due_date = ?
//        WHERE id = ?`,
//       [title, description || null, status || 'To Do', employee_id || null, due_date || null, id]
//     );

//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });

//     res.json({ success: true, message: 'Task updated successfully', data: { id: Number(id), title, description, status, employee_id, due_date } });
//   } catch (err) {
//     console.error('DB error PUT /tasks/:id', err);
//     res.status(500).json({ error: 'Failed to update task' });
//   }
// });

// // DELETE task
// router.delete('/:id', async (req, res) => {
//   try {
//     const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
//     if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
//     res.json({ success: true, message: 'Task deleted successfully' });
//   } catch (err) {
//     console.error('DB error DELETE /tasks/:id', err);
//     res.status(500).json({ error: 'Failed to delete task' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to POST, PUT, DELETE only
// GET is public

// GET all tasks (PUBLIC - no auth required)
router.get('/', async (req, res) => {
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

// GET single task (PUBLIC - no auth required)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.promise().query(`
            SELECT 
                t.*,
                e.name as employee_name,
                e.email as employee_email,
                e.role as employee_role
            FROM tasks t
            LEFT JOIN employees e ON t.employee_id = e.id
            WHERE t.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve task' });
    }
});

// POST create task (PROTECTED - auth required)
router.post('/', authenticateToken, async (req, res) => {
    const { title, description, status, employee_id, due_date } = req.body;

    // Validation
    if (!title) {
        return res.status(400).json({ 
            error: 'Missing required field',
            required: ['title']
        });
    }

    const validStatuses = ['To Do', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ 
            error: 'Invalid status',
            validStatuses: validStatuses
        });
    }

    try {
        const [result] = await pool.promise().query(
            'INSERT INTO tasks (title, description, status, employee_id, due_date) VALUES (?, ?, ?, ?, ?)',
            [title, description || null, status || 'To Do', employee_id || null, due_date || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                id: result.insertId,
                title,
                description,
                status: status || 'To Do',
                employee_id,
                due_date
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT update task (PROTECTED - auth required)
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, description, status, employee_id, due_date } = req.body;
    const { id } = req.params;

    // Validation
    if (!title) {
        return res.status(400).json({ 
            error: 'Missing required field',
            required: ['title']
        });
    }

    const validStatuses = ['To Do', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ 
            error: 'Invalid status',
            validStatuses: validStatuses
        });
    }

    try {
        const [result] = await pool.promise().query(
            'UPDATE tasks SET title = ?, description = ?, status = ?, employee_id = ?, due_date = ? WHERE id = ?',
            [title, description, status, employee_id, due_date, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: { id: parseInt(id), title, description, status, employee_id, due_date }
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE task (PROTECTED - auth required)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.promise().query(
            'DELETE FROM tasks WHERE id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;