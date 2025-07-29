import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ("query" | "warn" | "error")[];
    errorFormat: "pretty";
}, "query" | "warn" | "error", import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=database.d.ts.map