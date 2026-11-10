import { Router } from 'express';
import { workflowController } from './workflow.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Approvals Queue
router.get(
  '/approvals',
  auth,
  asyncHandler(workflowController.getApprovals.bind(workflowController))
);

// Applications CRUD & Timeline
router.get(
  '/applications',
  auth,
  asyncHandler(workflowController.getApplications.bind(workflowController))
);

router.post(
  '/applications',
  auth,
  asyncHandler(workflowController.createDraft.bind(workflowController))
);

router.get(
  '/applications/:id',
  auth,
  asyncHandler(workflowController.getApplicationById.bind(workflowController))
);

router.patch(
  '/applications/:id',
  auth,
  asyncHandler(workflowController.updateDraft.bind(workflowController))
);

router.post(
  '/applications/:id/submit',
  auth,
  asyncHandler(workflowController.submitApplication.bind(workflowController))
);

router.get(
  '/applications/:id/timeline',
  auth,
  asyncHandler(workflowController.getApplicationTimeline.bind(workflowController))
);

// Workflow Actions (VERIFY | FORWARD | APPROVE | REJECT | RETURN | REPLY)
router.post(
  '/applications/:id/documents',
  auth,
  asyncHandler(workflowController.uploadDocument.bind(workflowController))
);

router.get(
  '/applications/:id/documents/:fileId/download',
  auth,
  asyncHandler(workflowController.downloadDocument.bind(workflowController))
);

router.patch(
  '/applications/:id/status',
  auth,
  asyncHandler(workflowController.updateApplicationStatus.bind(workflowController))
);

router.post(
  '/applications/:id/actions',
  auth,
  asyncHandler(workflowController.actOnApplication.bind(workflowController))
);

router.post(
  '/applications/:id/cancel',
  auth,
  asyncHandler(workflowController.cancelApplication.bind(workflowController))
);

router.post(
  '/applications/:id/replies',
  auth,
  asyncHandler(workflowController.addReply.bind(workflowController))
);

export default router;
