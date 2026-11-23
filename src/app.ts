import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import simpleExpenseRoutes from './routes/simpleExpenseRoutes';
import budgetRoutes from './routes/budgetRoutes';
import lendingRoutes from './routes/lendingRoutes';
import companyMoneyRoutes from './routes/companyMoneyRoutes';
// // import settingsRoutes from './routes/settingsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportRoutes from './routes/reportRoutes';
import messRoutes from './routes/messRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { checkDatabaseHealth } from './utils/database';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:8081',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://expencebackend.vercel.app/',
  'https://finpal-pdf-reports-l9j7.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
]
  .filter((origin): origin is string => Boolean(origin))
  .map((origin) => origin.replace(/\/+$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin) ||
      /^https:\/\/([a-z0-9-]+\.)?(lovable\.app|lovableproject\.com|railway\.app)$/i.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  }
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ExpenseFlow API',
      version: '1.0.0',
      description: 'A comprehensive expense management API with budget tracking, lending records, and reporting features.',
      contact: {
        name: 'ExpenseFlow API Support',
        email: 'support@expenseflow.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com/api'
          : `http://localhost:${PORT}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ExpenseFlow API Documentation'
}));

// Optimized Health check endpoints
app.get('/health', async (req: Request, res: Response) => {
  try {
    const isDatabaseHealthy = await checkDatabaseHealth();
    
    // Cache-friendly headers to reduce requests
    res.set({
      'Cache-Control': 'public, max-age=10', // Cache for 10 seconds
      'X-Backend-Status': isDatabaseHealthy ? 'connected' : 'disconnected'
    });
    
    res.status(isDatabaseHealthy ? 200 : 503).json({
      success: isDatabaseHealthy,
      message: isDatabaseHealthy ? 'API is running' : 'Database unavailable',
      timestamp: new Date().toISOString(),
      database: {
        status: isDatabaseHealthy ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      database: { status: 'error' }
    });
  }
});

// API Health check endpoint (for frontend compatibility)
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const isDatabaseHealthy = await checkDatabaseHealth();
    
    // Cache-friendly headers
    res.set({
      'Cache-Control': 'public, max-age=10',
      'X-Backend-Status': isDatabaseHealthy ? 'connected' : 'disconnected'
    });
    
    res.status(isDatabaseHealthy ? 200 : 503).json({
      success: isDatabaseHealthy,
      message: isDatabaseHealthy ? 'API is running' : 'Database unavailable',
      timestamp: new Date().toISOString(),
      database: {
        status: isDatabaseHealthy ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      database: { status: 'error' }
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', simpleExpenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/lending', lendingRoutes);
app.use('/api/company-money', companyMoneyRoutes);
// // app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mess', messRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to ExpenseFlow API',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    health: `${req.protocol}://${req.get('host')}/api/health`
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
