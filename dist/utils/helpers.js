"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.roundToTwoDecimals = exports.isValidDate = exports.generateSlug = exports.sanitizeInput = exports.getDateRange = exports.parseDate = exports.formatDate = exports.getPaginationMeta = exports.calculatePagination = exports.formatCurrency = exports.comparePassword = exports.hashPassword = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};
exports.generateToken = generateToken;
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: currency === 'PKR' ? 'PKR' : 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const calculatePagination = (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return {
        skip,
        take: limit,
        page,
        limit
    };
};
exports.calculatePagination = calculatePagination;
const getPaginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};
exports.getPaginationMeta = getPaginationMeta;
const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};
exports.formatDate = formatDate;
const parseDate = (dateString) => {
    return new Date(dateString + 'T00:00:00.000Z');
};
exports.parseDate = parseDate;
const getDateRange = (period) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (period) {
        case 'today':
            return {
                startDate: startOfDay,
                endDate: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
            };
        case 'week':
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return {
                startDate: startOfWeek,
                endDate: endOfWeek
            };
        case 'month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return {
                startDate: startOfMonth,
                endDate: endOfMonth
            };
        case 'year':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            return {
                startDate: startOfYear,
                endDate: endOfYear
            };
        default:
            return {
                startDate: startOfDay,
                endDate: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
            };
    }
};
exports.getDateRange = getDateRange;
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.generateSlug = generateSlug;
const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString))
        return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
const roundToTwoDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};
exports.roundToTwoDecimals = roundToTwoDecimals;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=helpers.js.map