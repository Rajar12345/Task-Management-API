// const mysql = require('mysql2');

// const pool = mysql
//   .createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
//   })
//   .promise();

// // Test connection
// pool.getConnection()
//   .then(() => console.log("✅ MySQL Connected Successfully"))
//   .catch(err => {
//     console.error("❌ MySQL Connection Failed:", err);
//     process.exit(1);
//   });

// module.exports = pool;

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to MySQL database');
        connection.release();
        
        // Initialize database if DB_INIT is true
        if (process.env.DB_INIT === 'true') {
            initializeDatabase();
        }
    }
});

// Initialize database schema and seed data
function initializeDatabase() {
    console.log('🔄 Initializing database...');
    
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    // Read schema file
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL statements (handle multiple statements)
    const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

    // Execute schema statements
    let completed = 0;
    statements.forEach((statement, index) => {
        pool.query(statement, (err) => {
            if (err && !err.message.includes('already exists')) {
                console.error('❌ Schema error:', err.message);
            }
            
            completed++;
            
            // After all schema statements, check and seed data
            if (completed === statements.length) {
                console.log('✅ Database schema initialized');
                seedDatabase(seedPath);
            }
        });
    });
}

function seedDatabase(seedPath) {
    // Check if employees table is empty
    pool.query('SELECT COUNT(*) as count FROM employees', (err, results) => {
        if (err) {
            console.error('❌ Error checking employees:', err.message);
            return;
        }

        if (results[0].count === 0) {
            console.log('🌱 Seeding database with sample data...');
            
            const seed = fs.readFileSync(seedPath, 'utf8');
            const seedStatements = seed
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            let seeded = 0;
            seedStatements.forEach(statement => {
                pool.query(statement, (err) => {
                    if (err) {
                        console.error('❌ Seed error:', err.message);
                    }
                    
                    seeded++;
                    if (seeded === seedStatements.length) {
                        console.log('✅ Database seeded successfully');
                    }
                });
            });
        } else {
            console.log('ℹ️  Database already contains data, skipping seed');
        }
    });
}

module.exports = { pool, promisePool };