import { Router } from 'express';
import { registrationController } from './registration.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Current registration status for applicant (including PENDING_APPROVAL accounts)
router.get(
  '/status',
  auth,
  asyncHandler(registrationController.getStatus.bind(registrationController))
);

// Resubmit application when status is RETURNED
router.patch(
  '/resubmit',
  auth,
  asyncHandler(registrationController.resubmit.bind(registrationController))
);

export default router;

