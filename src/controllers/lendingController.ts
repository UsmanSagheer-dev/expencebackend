import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, parseDate, calculatePagination, getPaginationMeta } from '../utils/helpers';

const prisma = new PrismaClient();

export const getLendingRecords = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { page = '1', limit = '20', isSettled, personName } = req.query as any;

  const pagination = calculatePagination(parseInt(page), parseInt(limit));
  const where: any = { userId };

  if (isSettled !== undefined) {
    where.isSettled = isSettled === 'true';
  }

  if (personName) {
    where.personName = { contains: personName, mode: 'insensitive' };
  }

  const [lendingRecords, total] = await Promise.all([
    prisma.lendingRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take
    }),
    prisma.lendingRecord.count({ where })
  ]);

  const paginationMeta = getPaginationMeta(pagination.page, pagination.limit, total);

  res.json({
    success: true,
    data: lendingRecords,
    pagination: paginationMeta,
    timestamp: new Date().toISOString()
  });
});

export const createLendingRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { personName, amountTaken, lendingDate, description } = req.body;

  const lendingRecord = await prisma.lendingRecord.create({
    data: {
      userId,
      personName,
      amountTaken,
      lendingDate: parseDate(lendingDate),
      description
    }
  });

  res.status(201).json({
    success: true,
    data: lendingRecord,
    message: 'Lending record created successfully',
    timestamp: new Date().toISOString()
  });
});

export const updateLendingRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const record = await prisma.lendingRecord.findFirst({
    where: { id, userId }
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'LENDING_RECORD_NOT_FOUND',
        message: 'Lending record not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  const updatedRecord = await prisma.lendingRecord.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    data: updatedRecord,
    message: 'Lending record updated successfully',
    timestamp: new Date().toISOString()
  });
});

export const deleteLendingRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const record = await prisma.lendingRecord.findFirst({
    where: { id, userId }
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'LENDING_RECORD_NOT_FOUND',
        message: 'Lending record not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  await prisma.lendingRecord.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Lending record deleted successfully',
    timestamp: new Date().toISOString()
  });
});

export const markReturn = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { amountReturned } = req.body;

  const record = await prisma.lendingRecord.findFirst({
    where: { id, userId }
  });

  if (!record) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'LENDING_RECORD_NOT_FOUND',
        message: 'Lending record not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  const newAmountReturned = Number(record.amountReturned) + Number(amountReturned);
  const isSettled = newAmountReturned >= Number(record.amountTaken);

  const updatedRecord = await prisma.lendingRecord.update({
    where: { id },
    data: {
      amountReturned: newAmountReturned,
      isSettled
    }
  });

  res.json({
    success: true,
    data: updatedRecord,
    message: 'Return payment recorded successfully',
    timestamp: new Date().toISOString()
  });
});

export const getLendingStats = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  const stats = await prisma.lendingRecord.aggregate({
    where: { userId },
    _sum: {
      amountTaken: true,
      amountReturned: true
    },
    _count: {
      id: true
    }
  });

  const pendingRecords = await prisma.lendingRecord.count({
    where: { userId, isSettled: false }
  });

  res.json({
    success: true,
    data: {
      totalLent: Number(stats._sum.amountTaken || 0),
      totalReturned: Number(stats._sum.amountReturned || 0),
      totalRecords: stats._count.id,
      pendingRecords,
      outstandingAmount: Number(stats._sum.amountTaken || 0) - Number(stats._sum.amountReturned || 0)
    },
    timestamp: new Date().toISOString()
  });
});
