import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ("warn" | "error")[];
    errorFormat: "pretty";
    datasources: {
        db: {
            url: string | undefined;
        };
    };
}, "warn" | "error", import("@prisma/client/runtime/library").DefaultArgs>;
export declare const checkDatabaseHealth: () => Promise<boolean>;
export declare const reconnectDatabase: () => Promise<void>;
export default prisma;
//# sourceMappingURL=database.d.ts.map