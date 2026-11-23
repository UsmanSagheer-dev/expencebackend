"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPublicId = exports.deleteFromCloudinary = exports.handleUploadError = exports.uploadToCloudinary = exports.uploadBillImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Local storage configuration
const localStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(",") || [
        "image/jpeg",
        "image/jpg",
        "image/png",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only JPEG, JPG, and PNG files are allowed"));
    }
};
// Multer configuration
exports.upload = (0, multer_1.default)({
    storage: localStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
    },
});
// Single file upload middleware for bill images
exports.uploadBillImage = exports.upload.single("billImage");
// Helper function to upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            // Return local file path if Cloudinary is not configured
            return `/uploads/${path_1.default.basename(filePath)}`;
        }
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder: "expense-bills",
            transformation: [
                { width: 1000, height: 1000, crop: "limit", quality: "auto" },
            ],
        });
        // Delete local file after uploading to Cloudinary
        fs_1.default.unlinkSync(filePath);
        return result.secure_url;
    }
    catch (error) {
        // Return local file path as fallback
        return `/uploads/${path_1.default.basename(filePath)}`;
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
// Error handling for file upload
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "FILE_TOO_LARGE",
                    message: "File size exceeds the allowed limit (5MB)",
                },
                timestamp: new Date().toISOString(),
            });
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                error: {
                    code: "UNEXPECTED_FILE",
                    message: "Unexpected file field",
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    if (error.message === "Only JPEG, JPG, and PNG files are allowed") {
        return res.status(400).json({
            success: false,
            error: {
                code: "INVALID_FILE_TYPE",
                message: "Only JPEG, JPG, and PNG files are allowed",
            },
            timestamp: new Date().toISOString(),
        });
    }
    next(error);
};
exports.handleUploadError = handleUploadError;
// Helper function to delete uploaded file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (process.env.CLOUDINARY_CLOUD_NAME) {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
    }
    catch (error) { }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.split(".")[0];
};
exports.extractPublicId = extractPublicId;
//# sourceMappingURL=upload.js.map