import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  getCentres,
  createCentre,
  updateCentre,
  getProgrammes,
  getAcademicYears,
  getDesignations,
  getCertificateTypes,
  getApplicationTypes,
} from './masterdata.controller.js';
import { auth, permit } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Department CRUD
router.get('/departments', auth, asyncHandler(getDepartments));
router.post('/departments', auth, permit('master:manage'), asyncHandler(createDepartment));
router.patch('/departments/:id', auth, permit('master:manage'), asyncHandler(updateDepartment));

// Research Centre CRUD
router.get('/centres', auth, asyncHandler(getCentres));
router.post('/centres', auth, permit('master:manage'), asyncHandler(createCentre));
router.patch('/centres/:id', auth, permit('master:manage'), asyncHandler(updateCentre));

// Lookups
router.get('/programmes', auth, asyncHandler(getProgrammes));
router.get('/academic-years', auth, asyncHandler(getAcademicYears));
router.get('/designations', auth, asyncHandler(getDesignations));
router.get('/certificate-types', auth, asyncHandler(getCertificateTypes));
router.get('/application-types', auth, asyncHandler(getApplicationTypes));

export default router;

