/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all user categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export declare const getCategories: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export declare const createCategory: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export declare const updateCategory: (req: any, res: any, next: any) => void;
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
export declare const deleteCategory: (req: any, res: any, next: any) => void;
//# sourceMappingURL=categoryController.d.ts.map