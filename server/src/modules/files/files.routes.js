import { Router } from 'express';
import { uploadFile, downloadFile } from './files.controller.js';
import { upload } from '../../middleware/upload.middleware.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Upload file (auth required)
router.post('/upload', auth, upload.single('file'), asyncHandler(uploadFile));

// Download file (auth + scope required)
router.get('/:fileId/download', auth, asyncHandler(downloadFile));

export default router;

