import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, TokenPayload } from "../types";

const prisma = new PrismaClient();

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is required",
        },
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

      // Fetch the user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
          timestamp: new Date().toISOString(),
        });
      }

      req.user = user as any;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user as any;
      }
    } catch (jwtError) {
      // Silently continue without user
    }

    next();
  } catch (error) {
    next();
  }
};
