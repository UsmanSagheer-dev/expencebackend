import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Local storage configuration
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG files are allowed'));
  }
};

// Multer configuration
export const upload = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

// Single file upload middleware for bill images
export const uploadBillImage = upload.single('billImage');

// Helper function to upload to Cloudinary
export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Return local file path if Cloudinary is not configured
      return `/uploads/${path.basename(filePath)}`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'expense-bills',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ]
    });

    // Delete local file after uploading to Cloudinary
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Return local file path as fallback
    return `/uploads/${path.basename(filePath)}`;
  }
};

// Error handling for file upload
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the allowed limit (5MB)'
        },
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  if (error.message === 'Only JPEG, JPG, and PNG files are allowed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Only JPEG, JPG, and PNG files are allowed'
      },
      timestamp: new Date().toISOString()
    });
  }

  next(error);
};

// Helper function to delete uploaded file from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string => {
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart.split('.')[0];
};
