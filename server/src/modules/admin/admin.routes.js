import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { auth, requireRole } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

// Enforce ADMIN role for all routes in this router
router.use(auth);
router.use(requireRole(ROLES.ADMIN));

router.get('/users', asyncHandler(adminController.getUsers.bind(adminController)));
router.post('/users', asyncHandler(adminController.createUser.bind(adminController)));
router.patch('/users/:id', asyncHandler(adminController.updateUser.bind(adminController)));
router.post('/users/:id/activate', asyncHandler(adminController.activateUser.bind(adminController)));
router.post('/users/:id/deactivate', asyncHandler(adminController.deactivateUser.bind(adminController)));
router.put('/users/:id/roles', asyncHandler(adminController.updateUserRoles.bind(adminController)));

router.put('/staff/:id/centres', asyncHandler(adminController.updateStaffCentres.bind(adminController)));

router.get('/reports/missing-approvers', asyncHandler(adminController.getMissingApproversReport.bind(adminController)));
router.get('/workflows', asyncHandler(adminController.getWorkflows.bind(adminController)));
router.get('/audit-logs', asyncHandler(adminController.getAuditLogs.bind(adminController)));
router.post('/backup', asyncHandler(adminController.triggerBackup.bind(adminController)));

export default router;