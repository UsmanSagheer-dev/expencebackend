import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare const getCompanyMoneyRecords: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createCompanyMoneyRecord: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCompanyMoneyRecord: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCompanyMoneyRecord: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCompanyMoneyStats: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=companyMoneyController.d.ts.map