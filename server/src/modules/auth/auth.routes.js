import { Router } from 'express';
import {
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
} from './auth.controller.js';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateRequest,
} from './auth.validation.js';
import { auth } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/login', authRateLimiter, validateRequest(loginSchema), asyncHandler(login));
router.post('/refresh', authRateLimiter, asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));

router.post(
  '/change-password',
  auth,
  validateRequest(changePasswordSchema),
  asyncHandler(changePassword)
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  asyncHandler(resetPassword)
);

router.get('/me', auth, asyncHandler(getMe));

export default router;

