import { Request, Response } from "express";
interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare const getExpenseReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBudgetReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCategoryReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMonthlyReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getYearlyReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const exportReport: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=reportController_fixed.d.ts.map