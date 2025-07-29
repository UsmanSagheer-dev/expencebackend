# ExpenseFlow API Backend

A comprehensive expense management API built with Node.js, Express, TypeScript, and Prisma ORM with PostgreSQL.

## 🚀 Features

- **User Authentication** - JWT-based authentication with registration, login, and profile management
- **Expense Management** - Complete CRUD operations for expense tracking with categories
- **Budget Management** - Create and manage budgets with period-based tracking
- **Lending Records** - Track money lent to people with return payments
- **Company Money** - Manage business/company money transactions
- **File Upload** - Bill image upload with Cloudinary integration
- **Statistics & Reports** - Comprehensive analytics and reporting
- **API Documentation** - Swagger/OpenAPI documentation
- **Rate Limiting** - Built-in rate limiting for security
- **Error Handling** - Comprehensive error handling and validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
src/
├── controllers/          # Route handlers and business logic
├── middleware/           # Authentication, validation, error handling
├── routes/              # API route definitions
├── services/            # Business services (future use)
├── utils/               # Helper functions and utilities
├── types/               # TypeScript type definitions
└── app.ts               # Express app configuration

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations

uploads/                 # Local file storage (development)
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Clone & Install
```bash
git clone <repository-url>
cd expensebackend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_db?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=3001

# CORS
CORS_ORIGIN="http://localhost:5173"

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/jpg"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Build & Run
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 📚 API Documentation

Once the server is running, visit:
- **API Documentation**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **API Info**: http://localhost:3001/api

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Expenses
- `GET /api/expenses` - Get expenses with filtering/pagination
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `DELETE /api/expenses/bulk` - Bulk delete expenses
- `POST /api/expenses/:id/image` - Upload bill image
- `GET /api/expenses/stats` - Get expense statistics
- `GET /api/expenses/summary` - Get expense summary

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/current` - Get current active budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `POST /api/budgets/:id/expenses-to-person` - Add expense to person

### Lending Records
- `GET /api/lending` - Get lending records
- `POST /api/lending` - Create lending record
- `PUT /api/lending/:id` - Update lending record
- `DELETE /api/lending/:id` - Delete lending record
- `PUT /api/lending/:id/return` - Mark return payment
- `GET /api/lending/stats` - Get lending statistics

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🔒 Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-07-29T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2025-07-29T10:30:00Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## 🗄️ Database Schema

The API uses the following main models:
- **User** - User authentication and profile
- **Category** - Expense categories
- **Expense** - Main expense records
- **Budget** - Budget management
- **LendingRecord** - Money lending tracking
- **CompanyMoneyRecord** - Business money tracking
- **UserSettings** - User preferences

## 🚀 Deployment

### Environment Variables for Production
Make sure to update these for production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - Strong secret key
- `CORS_ORIGIN` - Your frontend domain

### Build for Production
```bash
npm run build
npm start
```

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:watch` - Build with watch mode
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### File Upload Configuration
The API supports both local storage (development) and Cloudinary (production) for file uploads. Configure Cloudinary credentials for production use.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**ExpenseFlow API** - Making expense management simple and powerful! 💰✨
