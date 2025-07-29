import { Request } from 'express';
import { User } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
}
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}
export interface PaginationResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
}
export interface ExpenseQuery extends PaginationQuery {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    sortBy?: 'date' | 'amount' | 'itemName';
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
export interface BudgetQuery extends PaginationQuery {
    isActive?: string;
    period?: string;
}
export interface LendingQuery extends PaginationQuery {
    isSettled?: string;
    personName?: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
}
export interface TokenPayload {
    userId: string;
    email: string;
}
export interface CreateExpenseData {
    categoryId?: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
    unit: string;
    expenseDate: string;
    description?: string;
}
export interface CreateCategoryData {
    name: string;
    color?: string;
}
export interface CreateBudgetData {
    totalBudget: number;
    budgetPeriod: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
}
export interface CreateLendingData {
    personName: string;
    amountTaken: number;
    lendingDate: string;
    description?: string;
}
export interface CreateCompanyMoneyData {
    companyName: string;
    amountReceived: number;
    transactionDate: string;
    description?: string;
}
export interface UpdateUserSettingsData {
    dashboardView?: 'today' | 'week' | 'month';
    currency?: string;
    theme?: 'light' | 'dark';
}
export interface ExpenseStats {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
    expensesByCategory: {
        categoryName: string;
        categoryId: string;
        totalAmount: number;
        count: number;
    }[];
    monthlyTrend: {
        month: string;
        totalAmount: number;
        count: number;
    }[];
}
export interface DashboardStats {
    todayExpenses: number;
    weekExpenses: number;
    monthExpenses: number;
    activeBudgets: number;
    pendingLending: number;
    totalCompanyMoney: number;
    recentExpenses: any[];
    categoryBreakdown: any[];
}
export interface ReportOptions {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    format?: 'pdf' | 'json';
}
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string[];
    }[];
}
//# sourceMappingURL=index.d.ts.map