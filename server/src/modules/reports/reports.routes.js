import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get(
  '/reports/:reportKey/export',
  auth,
  asyncHandler(reportsController.exportReport.bind(reportsController))
);

router.get(
  '/reports/:reportKey',
  auth,
  asyncHandler(reportsController.getReport.bind(reportsController))
);

export default router;
