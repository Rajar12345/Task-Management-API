# 🚀 Task Management API

A production-ready RESTful API for managing employees and tasks with JWT authentication, built with Node.js, Express, and MySQL.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v4.18-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-v8.0-orange.svg)
![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Postman Testing](#-postman-testing)
- [Screenshots](#-screenshots)
- [Error Handling](#-error-handling)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **RESTful API Design** - Following REST principles
- ✅ **MySQL Database** - Robust relational database
- ✅ **CRUD Operations** - Complete Create, Read, Update, Delete functionality
- ✅ **Password Hashing** - Secure password storage with bcrypt
- ✅ **Request Validation** - Input validation and sanitization
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Auto Database Initialization** - Automatic schema and seed data setup
- ✅ **Filtering & Querying** - Filter tasks by status and employee
- ✅ **CORS Enabled** - Cross-Origin Resource Sharing support

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **Development**: nodemon

## 📁 Project Structure

```
task-management-api/
├── database/
│   ├── schema.sql              # Database schema
│   └── seed.sql                # Sample data
├── src/
│   ├── config/
│   │   └── database.js         # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── employees.js        # Employee CRUD routes
│   │   └── tasks.js            # Task CRUD routes
│   └── app.js                  # Express application
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── package.json                # Dependencies
├── server.js                   # Server entry point
└── README.md                   # Documentation
```

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Postman (for API testing)

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/task-management-api.git
cd task-management-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file**

```bash
# Copy the example and modify
cp .env.example .env
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_management

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Initialization
DB_INIT=true

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
```

⚠️ **Important**: Change `JWT_SECRET` to a strong, random string in production!

## 💾 Database Setup

### Option 1: Automatic Setup

The application will automatically create the database schema and seed data when `DB_INIT=true` in `.env`.

### Option 2: Manual Setup

1. **Create database**

```sql
CREATE DATABASE IF NOT EXISTS task_management;
USE task_management;
```

2. **Run schema**

```bash
mysql -u root -p task_management < database/schema.sql
```

3. **Run seed data**

```bash
mysql -u root -p task_management < database/seed.sql
```

### Database Schema

**Employees Table**
- `id` - Primary key (Auto increment)
- `name` - Employee name
- `role` - Job role
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Timestamp

**Tasks Table**
- `id` - Primary key (Auto increment)
- `title` - Task title
- `description` - Task description
- `status` - Enum: 'To Do', 'In Progress', 'Completed'
- `employee_id` - Foreign key to employees
- `due_date` - Due date
- `created_at` - Timestamp
- `updated_at` - Timestamp (auto-updates)

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

You should see:

```
=================================
Task Management API Server
=================================
Server running on: http://localhost:3000
Environment: development
Database: MySQL (task_management)
Host: localhost:3306
=================================
✅ Connected to MySQL database
✅ Database schema initialized
✅ Database seeded successfully
=================================
```

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/verify` | Verify JWT token |
| GET | `/api/tasks` | Get all tasks (read-only) |
| GET | `/api/tasks/:id` | Get single task |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get single employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Query Parameters

**Tasks Filtering:**
- `?status=To Do` - Filter by status
- `?employee_id=1` - Filter by employee
- `?status=In Progress&employee_id=2` - Combine filters

## 🔑 Authentication

This API uses JWT (JSON Web Tokens) for authentication.

### Test Credentials

```json
{
  "email": "john.doe@company.com",
  "password": "password123"
}
```

### Authentication Flow

1. **Register or Login** to get JWT token
2. **Copy the token** from the response
3. **Include token** in subsequent requests

### Request Headers

```http
Authorization: Bearer <your_jwt_token>
```

### Token Expiration

Tokens expire after **24 hours**. You'll need to login again to get a new token.

## 🧪 Postman Testing

### 1. Login to Get Token

**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "john.doe@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "Software Engineer"
  }
}
```

### 2. Set Authorization in Postman

**Method 1: Authorization Tab**
1. Click "Authorization" tab
2. Type: Select "Bearer Token"
3. Token: Paste your JWT token

**Method 2: Headers Tab**
1. Key: `Authorization`
2. Value: `Bearer <your_token>`

### 3. Test Protected Endpoints

**GET Employees (Protected)**
```http
GET http://localhost:3000/api/employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**POST Task (Protected)**
```http
POST http://localhost:3000/api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "status": "To Do",
  "employee_id": 1,
  "due_date": "2024-12-31"
}
```

### 4. Test Error Cases

**Without Token (401 Error)**
```http
GET http://localhost:3000/api/employees
# Don't include Authorization header
```

**Invalid Token (403 Error)**
```http
GET http://localhost:3000/api/employees
Authorization: Bearer invalid_token_here
```

## 📸 Screenshots

### Before Authentication

#### 1. API Root Endpoint
![API Root](./01-api-root.png)
*GET request to `/` showing API information and available endpoints*

#### 2. Login Request
![Login Request](./02-login-request.png)
*POST request to `/api/auth/login` with credentials*

#### 3. Login Success Response
![Login Response](./03-login-response.png)
*Successful login response with JWT token*

### After Authentication

#### 4. Get Employees with Auth Token
![Get Employees](./04-get-employees-auth.png)
*GET request to `/api/employees` with Bearer token*

#### 5. Create Task with Auth Token
![Create Task](./05-create-task-auth.png)
*POST request to `/api/tasks` with Bearer token*

#### 6. Request Without Token (401 Error)
![401 Error](./06-no-token-error.png)
*GET request without Authorization header showing 401 error*

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed description"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing token) |
| 403 | Forbidden (invalid token) |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |
| 500 | Internal Server Error |

### Example Errors

**Missing Required Fields:**
```json
{
  "error": "Missing required fields",
  "required": ["name", "email", "role"]
}
```

**Invalid Email:**
```json
{
  "error": "Invalid email format"
}
```

**Unauthorized Access:**
```json
{
  "error": "Access denied",
  "message": "Authentication token required"
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Rajar12345](https://github.com/yourusername)
- Email: shawrajdeep225@gmail.com

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MySQL team for the robust database
- JWT.io for authentication standards

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact me at shawrajdeep225@gmail.com

---

**⭐ If you found this project helpful, please give it a star!**

Made with ❤️ by [Rajdeep Shaw]

