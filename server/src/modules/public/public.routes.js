import { Router } from 'express';
import {
  getPublicDepartments,
  getPublicCentres,
  getProgrammes,
  getDesignations,
} from '../masterdata/masterdata.controller.js';
import { workflowController } from '../workflow/workflow.controller.js';
import { registrationController } from '../registration/registration.controller.js';
import { upload } from '../../middleware/upload.middleware.js';
import { ResearchCentre } from '../../models/index.js';
import { INSTITUTION_TYPE, ROLES } from '../../config/constants.js';
import { successResponse } from '../../utils/response.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Master Data Lookup endpoints for registration forms
router.get('/departments', asyncHandler(getPublicDepartments));
router.get('/centres', asyncHandler(getPublicCentres));
router.get('/departments/:departmentId/centres', asyncHandler(getPublicCentres));
router.get('/guides', asyncHandler(workflowController.getPublicGuides.bind(workflowController)));
router.get('/centres/:centreId/guides', asyncHandler(workflowController.getPublicGuides.bind(workflowController)));
router.get('/programmes', asyncHandler(getProgrammes));
router.get('/designations', asyncHandler(getDesignations));

// Public Registrations / Signups per 04 §2 and 05 §5
router.post(
  '/signup/guide',
  upload.any(),
  asyncHandler(registrationController.signupGuide.bind(registrationController))
);

router.post(
  '/signup/scholar',
  upload.any(),
  asyncHandler(registrationController.signupScholar.bind(registrationController))
);

/**
 * Returns the exact sequential approval chain for review steps in signups
 * based on the chosen centre's institution_type per 00 & 01 binding rules.
 */
router.get(
  '/approval-path',
  asyncHandler(async (req, res) => {
    const { centreId, as: roleRequested } = req.query;

    if (!centreId) {
      throw ApiError.badRequest('centreId query parameter is required');
    }

    const centre = await ResearchCentre.findByPk(centreId);
    if (!centre) {
      throw ApiError.notFound('Research centre not found');
    }

    const isAffiliated = centre.institution_type === INSTITUTION_TYPE.AFFILIATED_COLLEGE;
    let approvalPath = [];

    if (roleRequested === 'GUIDE') {
      if (isAffiliated) {
        approvalPath = [
          { order: 1, role: ROLES.CENTRE_HEAD, name: 'Research Centre Head' },
          { order: 2, role: ROLES.DRC_CONVENOR, name: 'DRC Convenor' },
        ];
      } else {
        approvalPath = [
          { order: 1, role: ROLES.DRC_CONVENOR, name: 'DRC Convenor' },
        ];
      }
    } else {
      // SCHOLAR
      if (isAffiliated) {
        approvalPath = [
          { order: 1, role: ROLES.GUIDE, name: 'Research Guide' },
          { order: 2, role: ROLES.CENTRE_HEAD, name: 'Research Centre Head' },
          { order: 3, role: ROLES.DRC_CONVENOR, name: 'DRC Convenor' },
        ];
      } else {
        approvalPath = [
          { order: 1, role: ROLES.GUIDE, name: 'Research Guide' },
          { order: 2, role: ROLES.DRC_CONVENOR, name: 'DRC Convenor' },
        ];
      }
    }

    return successResponse(res, {
      institutionType: centre.institution_type,
      centreName: centre.name,
      approvalPath,
      canAcceptSignups: centre.canAcceptSignups(),
    });
  })
);

export default router;
