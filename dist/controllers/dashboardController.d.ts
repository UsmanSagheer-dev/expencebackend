import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare const getDashboardStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=dashboardController.d.ts.map