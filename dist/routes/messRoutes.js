"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../utils/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const DATE_ONLY_FIELDS = new Set([
    "date",
    "joinedAt",
    "leftAt",
    "endedAt",
    "openedAt",
    "closedAt",
]);
const optionalNumber = (value) => value === null || value === undefined || value === "" ? null : Number(value);
const OMITTED_FIELDS = new Set(["userId", "updatedAt"]);
const RENAMED_FIELDS = { purchasedById: "purchasedBy" };
// Convert DB rows to the shape the frontend stores in localStorage:
// Decimals -> numbers, @db.Date -> "YYYY-MM-DD", nulls dropped.
function toClientRow(row) {
    const out = {};
    for (const [key, value] of Object.entries(row)) {
        if (OMITTED_FIELDS.has(key) || value === null || value === undefined)
            continue;
        const name = RENAMED_FIELDS[key] || key;
        if (value instanceof Date) {
            out[name] = DATE_ONLY_FIELDS.has(key) ? value.toISOString().slice(0, 10) : value.toISOString();
        }
        else if (typeof value === "object" && typeof value.toNumber === "function") {
            out[name] = value.toNumber();
        }
        else {
            out[name] = value;
        }
    }
    return out;
}
const toClientRows = (rows) => rows.map(toClientRow);
router.get("/snapshot", async (req, res) => {
    try {
        const userId = req.user.id;
        const [members, contributions, expenses, flourPurchases, flourConsumptions, rotiRecords, cookPayments, teaRecords, fundBatches, audit,] = await Promise.all([
            database_1.default.messMember.findMany({ where: { userId } }),
            database_1.default.messContribution.findMany({ where: { userId } }),
            database_1.default.messExpense.findMany({ where: { userId } }),
            database_1.default.flourPurchase.findMany({ where: { userId } }),
            database_1.default.flourConsumption.findMany({ where: { userId } }),
            database_1.default.rotiRecord.findMany({ where: { userId } }),
            database_1.default.cookPayment.findMany({ where: { userId } }),
            database_1.default.teaRecord.findMany({ where: { userId } }),
            database_1.default.messFundBatch.findMany({ where: { userId }, orderBy: { openedAt: "desc" } }),
            database_1.default.messAuditEntry.findMany({ where: { userId }, orderBy: { timestamp: "desc" } }),
        ]);
        res.json({
            success: true,
            data: {
                members: toClientRows(members),
                contributions: toClientRows(contributions),
                expenses: toClientRows(expenses),
                flourPurchases: toClientRows(flourPurchases),
                flourConsumptions: toClientRows(flourConsumptions),
                rotiRecords: toClientRows(rotiRecords),
                cookPayments: toClientRows(cookPayments),
                teaRecords: toClientRows(teaRecords),
                fundBatches: toClientRows(fundBatches),
                audit: toClientRows(audit),
            },
        });
    }
    catch (error) {
        console.error("Mess snapshot failed:", error);
        res.status(500).json({ success: false, error: { code: "MESS_SNAPSHOT_FAILED", message: "Unable to load mess data" } });
    }
});
router.put("/sync", async (req, res) => {
    try {
        const userId = req.user.id;
        const body = req.body || {};
        const members = Array.isArray(body.members) ? body.members : [];
        const contributions = Array.isArray(body.contributions) ? body.contributions : [];
        const expenses = Array.isArray(body.expenses) ? body.expenses : [];
        const flourPurchases = Array.isArray(body.flourPurchases) ? body.flourPurchases : [];
        const flourConsumptions = Array.isArray(body.flourConsumptions) ? body.flourConsumptions : [];
        const rotiRecords = Array.isArray(body.rotiRecords) ? body.rotiRecords : [];
        const cookPayments = Array.isArray(body.cookPayments) ? body.cookPayments : [];
        const teaRecords = Array.isArray(body.teaRecords) ? body.teaRecords : [];
        const fundBatches = Array.isArray(body.fundBatches) ? body.fundBatches : [];
        const audit = Array.isArray(body.audit) ? body.audit : [];
        const expectedCollections = [
            "members",
            "contributions",
            "expenses",
            "flourPurchases",
            "flourConsumptions",
            "rotiRecords",
            "cookPayments",
            "teaRecords",
            "fundBatches",
            "audit",
        ];
        if (expectedCollections.some((key) => !Array.isArray(body[key]))) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MESS_SNAPSHOT",
                    message: "Every mess data collection must be supplied as an array",
                },
            });
        }
        const memberIds = new Set(members.map((row) => row.id));
        const batchIds = new Set(fundBatches.map((row) => row.id));
        const invalidContribution = contributions.some((row) => !memberIds.has(row.memberId) || (row.batchId && !batchIds.has(row.batchId)));
        const invalidExpense = expenses.some((row) => (row.purchasedBy && !memberIds.has(row.purchasedBy)) || (row.batchId && !batchIds.has(row.batchId)));
        const invalidCookPayment = cookPayments.some((row) => row.batchId && !batchIds.has(row.batchId));
        if (invalidContribution || invalidExpense || invalidCookPayment) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_MESS_RELATION",
                    message: "Mess transactions must reference members and fund batches in this account",
                },
            });
        }
        await database_1.default.$transaction(async (tx) => {
            await tx.messAuditEntry.deleteMany({ where: { userId } });
            await tx.teaRecord.deleteMany({ where: { userId } });
            await tx.cookPayment.deleteMany({ where: { userId } });
            await tx.rotiRecord.deleteMany({ where: { userId } });
            await tx.flourConsumption.deleteMany({ where: { userId } });
            await tx.flourPurchase.deleteMany({ where: { userId } });
            await tx.messExpense.deleteMany({ where: { userId } });
            await tx.messContribution.deleteMany({ where: { userId } });
            await tx.messFundBatch.deleteMany({ where: { userId } });
            await tx.messMember.deleteMany({ where: { userId } });
            if (members.length) {
                await tx.messMember.createMany({
                    data: members.map((row) => ({
                        id: row.id,
                        userId,
                        name: row.name,
                        phone: row.phone || "",
                        joinedAt: new Date(row.joinedAt || row.createdAt || new Date()),
                        leftAt: row.leftAt ? new Date(row.leftAt) : null,
                        status: row.status || "active",
                    })),
                });
            }
            if (fundBatches.length) {
                await tx.messFundBatch.createMany({
                    data: fundBatches.map((row) => ({
                        id: row.id,
                        userId,
                        name: row.name,
                        status: row.status || "open",
                        openedAt: new Date(row.openedAt),
                        closedAt: row.closedAt ? new Date(row.closedAt) : null,
                        openingBalance: Number(row.openingBalance || 0),
                        closingBalance: optionalNumber(row.closingBalance),
                        carryoverFromBatchId: row.carryoverFromBatchId || null,
                        closingNote: row.closingNote || null,
                    })),
                });
            }
            if (contributions.length) {
                await tx.messContribution.createMany({
                    data: contributions.map((row) => ({
                        id: row.id,
                        userId,
                        memberId: row.memberId,
                        batchId: row.batchId || null,
                        amount: Number(row.amount),
                        date: new Date(row.date),
                        note: row.note || "",
                    })),
                });
            }
            if (expenses.length) {
                await tx.messExpense.createMany({
                    data: expenses.map((row) => ({
                        id: row.id,
                        userId,
                        purchasedById: row.purchasedBy || null,
                        batchId: row.batchId || null,
                        date: new Date(row.date),
                        item: row.item,
                        category: row.category,
                        quantity: Number(row.quantity || 0),
                        unit: row.unit || "piece",
                        unitPrice: row.unitPrice == null ? null : Number(row.unitPrice),
                        amount: Number(row.amount),
                        notes: row.notes || "",
                    })),
                });
            }
            if (flourPurchases.length) {
                await tx.flourPurchase.createMany({
                    data: flourPurchases.map((row) => ({
                        id: row.id,
                        userId,
                        memberId: row.memberId,
                        date: new Date(row.date),
                        quantityKg: Number(row.quantityKg),
                        ratePerKg: Number(row.ratePerKg),
                        totalAmount: Number(row.totalAmount),
                        note: row.note || "",
                        status: row.status || "open",
                        endedAt: row.endedAt ? new Date(row.endedAt) : null,
                        purchasedKg: optionalNumber(row.purchasedKg),
                        carryoverKg: optionalNumber(row.carryoverKg),
                        carryoverTransferred: Boolean(row.carryoverTransferred),
                        endingFlourUsedKg: optionalNumber(row.endingFlourUsedKg),
                        endingRotiCount: optionalNumber(row.endingRotiCount),
                        flourPerRotiGrams: optionalNumber(row.flourPerRotiGrams),
                    })),
                });
            }
            if (flourConsumptions.length) {
                await tx.flourConsumption.createMany({
                    data: flourConsumptions.map((row) => ({
                        id: row.id,
                        userId,
                        date: new Date(row.date),
                        quantityKg: Number(row.quantityKg),
                        note: row.note || "",
                    })),
                });
            }
            if (rotiRecords.length) {
                await tx.rotiRecord.createMany({
                    data: rotiRecords.map((row) => ({
                        id: row.id,
                        userId,
                        date: new Date(row.date),
                        mealTime: row.mealTime,
                        batchId: row.batchId,
                        flourKg: Number(row.flourKg),
                        rotiCount: Number(row.rotiCount),
                        ratePerRoti: Number(row.ratePerRoti),
                        cookingFee: Number(row.cookingFee),
                        cookName: row.cookName,
                        note: row.note || "",
                    })),
                });
            }
            if (cookPayments.length) {
                await tx.cookPayment.createMany({
                    data: cookPayments.map((row) => ({
                        id: row.id,
                        userId,
                        expenseId: row.expenseId || null,
                        batchId: row.batchId || null,
                        date: new Date(row.date),
                        amount: Number(row.amount),
                        paymentType: row.paymentType,
                        note: row.note || "",
                    })),
                });
            }
            if (teaRecords.length) {
                await tx.teaRecord.createMany({
                    data: teaRecords.map((row) => ({
                        id: row.id,
                        userId,
                        date: new Date(row.date),
                        milkQuantity: Number(row.milkQuantity),
                        milkUnit: row.milkUnit,
                        milkCost: Number(row.milkCost),
                        teaQuantity: Number(row.teaQuantity),
                        teaUnit: row.teaUnit,
                        teaCost: Number(row.teaCost),
                        sugarQuantity: Number(row.sugarQuantity),
                        sugarUnit: row.sugarUnit,
                        sugarCost: Number(row.sugarCost),
                        cups: Number(row.cups),
                        notes: row.notes || "",
                    })),
                });
            }
            if (audit.length) {
                await tx.messAuditEntry.createMany({
                    data: audit.map((row) => ({
                        id: row.id,
                        userId,
                        entityType: row.entityType,
                        entityId: row.entityId,
                        action: row.action,
                        timestamp: new Date(row.timestamp),
                        details: row.details,
                    })),
                });
            }
        }, { maxWait: 15000, timeout: 30000 });
        res.json({ success: true, message: "Mess data synced successfully" });
    }
    catch (error) {
        console.error("Mess sync failed:", error);
        res.status(500).json({ success: false, error: { code: "MESS_SYNC_FAILED", message: "Unable to sync mess data" } });
    }
});
exports.default = router;
//# sourceMappingURL=messRoutes.js.map