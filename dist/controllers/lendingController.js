"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLendingStats = exports.markReturn = exports.deleteLendingRecord = exports.updateLendingRecord = exports.createLendingRecord = exports.getLendingRecords = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
exports.getLendingRecords = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user?.id;
    const { page = '1', limit = '20', isSettled, personName } = req.query;
    const pagination = (0, helpers_1.calculatePagination)(parseInt(page), parseInt(limit));
    const where = { userId };
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
    const paginationMeta = (0, helpers_1.getPaginationMeta)(pagination.page, pagination.limit, total);
    res.json({
        success: true,
        data: lendingRecords,
        pagination: paginationMeta,
        timestamp: new Date().toISOString()
    });
});
exports.createLendingRecord = (0, helpers_1.asyncHandler)(async (req, res, next) => {
    const userId = req.user.id;
    const { personName, amountTaken, lendingDate, description } = req.body;
    const lendingRecord = await prisma.lendingRecord.create({
        data: {
            userId,
            personName,
            amountTaken,
            lendingDate: (0, helpers_1.parseDate)(lendingDate),
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
exports.updateLendingRecord = (0, helpers_1.asyncHandler)(async (req, res, next) => {
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
exports.deleteLendingRecord = (0, helpers_1.asyncHandler)(async (req, res, next) => {
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
exports.markReturn = (0, helpers_1.asyncHandler)(async (req, res, next) => {
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
exports.getLendingStats = (0, helpers_1.asyncHandler)(async (req, res, next) => {
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
//# sourceMappingURL=lendingController.js.map