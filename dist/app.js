"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const lendingRoutes_1 = __importDefault(require("./routes/lendingRoutes"));
const companyMoneyRoutes_1 = __importDefault(require("./routes/companyMoneyRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.'
        }
    }
});
app.use('/api', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
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
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ExpenseFlow API Documentation'
}));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ExpenseFlow API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/budgets', budgetRoutes_1.default);
app.use('/api/lending', lendingRoutes_1.default);
app.use('/api/company-money', companyMoneyRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to ExpenseFlow API',
        documentation: `${req.protocol}://${req.get('host')}/api-docs`,
        health: `${req.protocol}://${req.get('host')}/health`
    });
});
// Error handling middleware (must be last)
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map