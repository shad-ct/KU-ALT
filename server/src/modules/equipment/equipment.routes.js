import { Router } from 'express';
import { equipmentController } from './equipment.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Shared / Scholar Catalog & Requests
router.get(
  '/equipment',
  auth,
  asyncHandler(equipmentController.getCatalog.bind(equipmentController))
);

router.get(
  '/equipment-categories',
  auth,
  asyncHandler(equipmentController.getCategories.bind(equipmentController))
);

router.get(
  '/equipment/:id',
  auth,
  asyncHandler(equipmentController.getEquipmentById.bind(equipmentController))
);

router.post(
  '/equipment-requests',
  auth,
  asyncHandler(equipmentController.submitRequest.bind(equipmentController))
);

router.get(
  '/equipment-requests/mine',
  auth,
  asyncHandler(equipmentController.getMyRequests.bind(equipmentController))
);

router.get(
  '/equipment-requests/:id',
  auth,
  asyncHandler(equipmentController.getRequestById.bind(equipmentController))
);

router.post(
  '/equipment-requests/:id/cancel',
  auth,
  asyncHandler(equipmentController.cancelRequest.bind(equipmentController))
);

// DRC Convenor Endpoints
router.post(
  '/drc/equipment',
  auth,
  asyncHandler(equipmentController.createEquipment.bind(equipmentController))
);

router.patch(
  '/drc/equipment/:id',
  auth,
  asyncHandler(equipmentController.updateEquipment.bind(equipmentController))
);

router.post(
  '/drc/equipment/:id/deactivate',
  auth,
  asyncHandler(equipmentController.deactivateEquipment.bind(equipmentController))
);

router.get(
  '/drc/equipment-requests',
  auth,
  asyncHandler(equipmentController.getDrcRequests.bind(equipmentController))
);

router.post(
  '/drc/equipment-requests/:id/approve',
  auth,
  asyncHandler(equipmentController.approveRequest.bind(equipmentController))
);

router.post(
  '/drc/equipment-requests/:id/reject',
  auth,
  asyncHandler(equipmentController.rejectRequest.bind(equipmentController))
);

router.post(
  '/drc/equipment-requests/:id/allocate',
  auth,
  asyncHandler(equipmentController.allocateRequest.bind(equipmentController))
);

router.post(
  '/drc/equipment-allocations/:id/return',
  auth,
  asyncHandler(equipmentController.returnAllocation.bind(equipmentController))
);

router.get(
  '/drc/equipment/dashboard',
  auth,
  asyncHandler(equipmentController.getDrcDashboard.bind(equipmentController))
);

// Admin Monitoring Endpoints
router.get(
  '/admin/equipment/dashboard',
  auth,
  asyncHandler(equipmentController.getAdminDashboard.bind(equipmentController))
);

export default router;
