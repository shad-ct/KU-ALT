import { Router } from 'express';
import {
  getInbox,
  markRead,
  markAllRead,
  sendNotification,
} from './notifications.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', auth, asyncHandler(getInbox));
router.patch('/:id/read', auth, asyncHandler(markRead));
router.patch('/read-all', auth, asyncHandler(markAllRead));

// Admin & Staff can send notifications
router.post('/', auth, permit('notification:send'), asyncHandler(sendNotification));

export default router;

