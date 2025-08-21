# DOST Client Logbook Backend API

A robust Express.js backend API for the DOST Client Logbook System, providing comprehensive client management, user authentication, and analytics capabilities.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Client Management**: Full CRUD operations for client/project tracking
- **User Management**: Admin controls for staff and user management
- **Dashboard Analytics**: Comprehensive reporting and statistics
- **Data Validation**: Input validation using express-validator
- **Security**: Helmet, CORS, rate limiting, and other security measures
- **Database Support**: Multiple database options (SQLite, MySQL, PostgreSQL)
- **File Uploads**: Support for document and image uploads
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: Sequelize ORM with multiple database support
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan
- **File Handling**: Multer
- **Compression**: compression middleware

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Database (SQLite, MySQL, or PostgreSQL)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   DB_TYPE=sqlite
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   - For SQLite (default): Database will be created automatically
   - For MySQL/PostgreSQL: Create database and update connection details

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Clients
- `GET /api/clients` - Get all clients (with filtering & pagination)
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client (soft delete)
- `GET /api/clients/stats/overview` - Get client statistics

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)
- `GET /api/users/stats/overview` - Get user statistics

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview statistics
- `GET /api/dashboard/trends` - Trends and analytics data
- `GET /api/dashboard/performance` - Performance metrics
- `GET /api/dashboard/alerts` - System alerts and notifications

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **user**: Basic access to client data
- **staff**: Enhanced access to client management
- **admin**: Full access including user management
- **super_admin**: System administrator with all privileges

## 📁 Project Structure

```
backend/
├── config/          # Database and configuration
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API route handlers
├── uploads/         # File upload directory
├── logs/            # Application logs
├── .env             # Environment variables
├── package.json     # Dependencies and scripts
├── server.js        # Main application file
└── README.md        # This file
```

## 🗄️ Database Models

### User Model
- Authentication fields (username, email, password)
- Profile information (firstName, lastName, department, position)
- Role-based access control
- Account status and preferences

### Client Model
- Client and project information
- Contact details and location
- Status, priority, and agency classification
- Project timeline and budget tracking
- Assignment and notes

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request throttling
- **Input Validation**: Request data sanitization
- **JWT Security**: Secure token handling
- **Password Hashing**: bcryptjs for password security

## 📈 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Comprehensive error management
- **Health Checks**: `/health` endpoint for monitoring
- **Performance Metrics**: Response time and throughput tracking

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up database connection pooling
5. Enable compression and caching
6. Set up proper logging and monitoring

### Environment Variables
```env
# Production
NODE_ENV=production
PORT=5000
JWT_SECRET=very-long-random-secret-key
DB_TYPE=postgres
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review error logs
- Contact the development team

---

**DOST Caraga Region** - Advancing Science and Technology for National Development
