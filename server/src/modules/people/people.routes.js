import { Router } from 'express';
import { peopleController } from './people.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Dashboard (role-aware)
router.get(
  '/dashboard',
  auth,
  asyncHandler(peopleController.getDashboard.bind(peopleController))
);

// Profile
router.get(
  '/profile',
  auth,
  asyncHandler(peopleController.getProfile.bind(peopleController))
);

router.patch(
  '/profile',
  auth,
  asyncHandler(peopleController.updateProfile.bind(peopleController))
);

router.patch(
  '/profile/academic',
  auth,
  asyncHandler(peopleController.updateAcademicProfile.bind(peopleController))
);

router.patch(
  '/profile/research',
  auth,
  asyncHandler(peopleController.updateAcademicProfile.bind(peopleController))
);

router.patch(
  '/profile/qualifications',
  auth,
  asyncHandler(peopleController.updateQualifications.bind(peopleController))
);

// Scholars
router.get(
  '/scholars',
  auth,
  asyncHandler(peopleController.getScholars.bind(peopleController))
);

router.get(
  '/scholars/:id',
  auth,
  asyncHandler(peopleController.getScholarById.bind(peopleController))
);

router.patch(
  '/scholars/:id/submission-date',
  auth,
  asyncHandler(peopleController.updateScholarSubmissionDate.bind(peopleController))
);

// RAC Schedule
router.get(
  '/scholars/:id/rac-schedule',
  auth,
  asyncHandler(peopleController.getScholarRacSchedules.bind(peopleController))
);

router.post(
  '/scholars/:id/rac-schedule',
  auth,
  asyncHandler(peopleController.createScholarRacSchedule.bind(peopleController))
);

router.patch(
  '/scholars/:id/rac-schedule/:meetingId',
  auth,
  asyncHandler(peopleController.updateScholarRacSchedule.bind(peopleController))
);

router.post(
  '/scholars/:id/rac-schedule/:meetingId/minutes',
  auth,
  asyncHandler(peopleController.uploadRacMinutes.bind(peopleController))
);

// Guides
router.get(
  '/guides',
  auth,
  asyncHandler(peopleController.getGuides.bind(peopleController))
);

router.get(
  '/guides/:id',
  auth,
  asyncHandler(peopleController.getGuideById.bind(peopleController))
);

router.get(
  '/guides/:id/scholars',
  auth,
  asyncHandler(peopleController.getGuideScholars.bind(peopleController))
);

router.patch(
  '/guides/:id/assign-scholar',
  auth,
  asyncHandler(peopleController.assignScholarToGuide.bind(peopleController))
);

export default router;
