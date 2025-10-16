import multer from 'multer';
import { Request } from 'express';
export declare const upload: multer.Multer;
export declare const uploadBillImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadToCloudinary: (filePath: string) => Promise<string>;
export declare const handleUploadError: (error: any, req: Request, res: any, next: any) => any;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export declare const extractPublicId: (url: string) => string;
//# sourceMappingURL=upload.d.ts.map