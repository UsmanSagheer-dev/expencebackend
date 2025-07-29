import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createExpenseSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    itemName: z.ZodString;
    unitPrice: z.ZodNumber;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    expenseDate: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateExpenseSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    itemName: z.ZodOptional<z.ZodString>;
    unitPrice: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
    expenseDate: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createBudgetSchema: z.ZodObject<{
    totalBudget: z.ZodNumber;
    budgetPeriod: z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
        monthly: "monthly";
    }>;
    startDate: z.ZodString;
    endDate: z.ZodString;
}, z.core.$strip>;
export declare const createLendingSchema: z.ZodObject<{
    personName: z.ZodString;
    amountTaken: z.ZodNumber;
    lendingDate: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnLendingSchema: z.ZodObject<{
    amountReturned: z.ZodNumber;
}, z.core.$strip>;
export declare const createCompanyMoneySchema: z.ZodObject<{
    companyName: z.ZodString;
    amountReceived: z.ZodNumber;
    transactionDate: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnCompanyMoneySchema: z.ZodObject<{
    amountReturned: z.ZodNumber;
}, z.core.$strip>;
export declare const updateSettingsSchema: z.ZodObject<{
    dashboardView: z.ZodOptional<z.ZodEnum<{
        today: "today";
        week: "week";
        month: "month";
    }>>;
    currency: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodEnum<{
        light: "light";
        dark: "dark";
    }>>;
}, z.core.$strip>;
export declare const budgetExpenseToPersonSchema: z.ZodObject<{
    personName: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const validate: (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateQuery: (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
}, z.core.$strip>;
export declare const expenseQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        date: "date";
        amount: "amount";
        itemName: "itemName";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=validation.d.ts.map