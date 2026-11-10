import multer from 'multer';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../config/constants.js';

// Multer storage: upload initially to OS temp directory
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${randomHex}${ext}`);
  },
});

export const upload = multer({
  storage: tempStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum global ceiling
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(
        new ApiError(
          400,
          ERROR_CODES.UPLOAD_REJECTED,
          `File extension '${ext}' is not permitted. Allowed: ${allowedExtensions.join(', ')}`
        )
      );
    }
    cb(null, true);
  },
});

