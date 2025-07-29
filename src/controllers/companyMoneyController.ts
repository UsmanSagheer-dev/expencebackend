import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Validation schemas
const createCompanyMoneySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  amountReceived: z.number().positive('Amount received must be positive'),
  amountReturned: z.number().min(0, 'Amount returned must be non-negative').optional().default(0),
  transactionDate: z.string().transform((str) => new Date(str)),
  description: z.string().optional(),
});

const updateCompanyMoneySchema = createCompanyMoneySchema.partial();

// Get company money records
export const getCompanyMoneyRecords = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const companyName = req.query.companyName as string;
    const offset = (page - 1) * limit;

    const where: any = {
      userId: req.user!.id
    };

    if (companyName) {
      where.companyName = {
        contains: companyName,
        mode: 'insensitive'
      };
    }

    const [records, total] = await Promise.all([
      prisma.companyMoneyRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.companyMoneyRecord.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get company money records error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company money records'
      }
    });
  }
};

// Create company money record
export const createCompanyMoneyRecord = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createCompanyMoneySchema.parse(req.body);

    const record = await prisma.companyMoneyRecord.create({
      data: {
        ...validatedData,
        userId: req.user!.id
      }
    });

    res.status(201).json({
      success: true,
      data: record,
      message: 'Company money record created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.issues
        }
      });
    }

    console.error('Create company money record error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create company money record'
      }
    });
  }
};

// Update company money record
export const updateCompanyMoneyRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateCompanyMoneySchema.parse(req.body);

    // Check if record exists and belongs to user
    const existingRecord = await prisma.companyMoneyRecord.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Company money record not found'
        }
      });
    }

    const updatedRecord = await prisma.companyMoneyRecord.update({
      where: { id },
      data: validatedData
    });

    res.json({
      success: true,
      data: updatedRecord,
      message: 'Company money record updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.issues
        }
      });
    }

    console.error('Update company money record error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update company money record'
      }
    });
  }
};

// Delete company money record
export const deleteCompanyMoneyRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if record exists and belongs to user
    const existingRecord = await prisma.companyMoneyRecord.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Company money record not found'
        }
      });
    }

    await prisma.companyMoneyRecord.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Company money record deleted successfully'
    });
  } catch (error) {
    console.error('Delete company money record error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete company money record'
      }
    });
  }
};

// Get company money statistics
export const getCompanyMoneyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [
      totalAmountReceived,
      totalAmountReturned,
      monthlyAmountReceived,
      monthlyAmountReturned,
      recentRecords,
      recordsCount
    ] = await Promise.all([
      prisma.companyMoneyRecord.aggregate({
        where: { userId },
        _sum: { amountReceived: true }
      }),
      prisma.companyMoneyRecord.aggregate({
        where: { userId },
        _sum: { amountReturned: true }
      }),
      prisma.companyMoneyRecord.aggregate({
        where: {
          userId,
          transactionDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amountReceived: true }
      }),
      prisma.companyMoneyRecord.aggregate({
        where: {
          userId,
          transactionDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amountReturned: true }
      }),
      prisma.companyMoneyRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.companyMoneyRecord.count({
        where: { userId }
      })
    ]);

    const totalReceived = Number(totalAmountReceived._sum.amountReceived || 0);
    const totalReturned = Number(totalAmountReturned._sum.amountReturned || 0);
    const netBalance = totalReceived - totalReturned;
    
    const monthlyReceived = Number(monthlyAmountReceived._sum.amountReceived || 0);
    const monthlyReturned = Number(monthlyAmountReturned._sum.amountReturned || 0);
    const monthlyNet = monthlyReceived - monthlyReturned;

    res.json({
      success: true,
      data: {
        totalAmountReceived: totalReceived,
        totalAmountReturned: totalReturned,
        netBalance,
        monthlyAmountReceived: monthlyReceived,
        monthlyAmountReturned: monthlyReturned,
        monthlyNet,
        totalRecords: recordsCount,
        recentRecords
      }
    });
  } catch (error) {
    console.error('Get company money stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company money statistics'
      }
    });
  }
};
