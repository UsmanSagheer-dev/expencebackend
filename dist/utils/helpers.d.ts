import { TokenPayload } from '../types';
export declare const generateToken: (payload: TokenPayload) => string;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const calculatePagination: (page?: number, limit?: number) => {
    skip: number;
    take: number;
    page: number;
    limit: number;
};
export declare const getPaginationMeta: (page: number, limit: number, total: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
export declare const formatDate: (date: Date) => string;
export declare const parseDate: (dateString: string) => Date;
export declare const getDateRange: (period: "today" | "week" | "month" | "year") => {
    startDate: Date;
    endDate: Date;
};
export declare const sanitizeInput: (input: string) => string;
export declare const generateSlug: (text: string) => string;
export declare const isValidDate: (dateString: string) => boolean;
export declare const roundToTwoDecimals: (num: number) => number;
export declare const asyncHandler: (fn: Function) => (req: any, res: any, next: any) => void;
//# sourceMappingURL=helpers.d.ts.map