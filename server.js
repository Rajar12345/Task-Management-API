require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('=================================');
    console.log('Task Management API Server');
    console.log('=================================');
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database: MySQL (${process.env.DB_NAME})`);
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log('=================================');
    console.log('Available endpoints:');
    console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
    console.log(`  GET    http://localhost:${PORT}/api/employees (protected)`);
    console.log(`  GET    http://localhost:${PORT}/api/tasks (public)`);
    console.log('=================================');
});