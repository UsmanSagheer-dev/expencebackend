import { Request, Response, NextFunction } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError
} from '@prisma/client/runtime/library';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'This record already exists'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'The requested record was not found'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Referenced record does not exist'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error instanceof PrismaClientRustPanicError) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_PANIC',
        message: 'Database engine error'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error instanceof PrismaClientInitializationError) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'Failed to connect to database'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error instanceof PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the allowed limit'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNEXPECTED_FILE',
        message: 'Unexpected file field'
      },
      timestamp: new Date().toISOString()
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      },
      timestamp: new Date().toISOString()
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Default error
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : message
    },
    timestamp: new Date().toISOString()
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    },
    timestamp: new Date().toISOString()
  });
};
