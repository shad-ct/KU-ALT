import { Router } from 'express';
import { certificatesController } from './certificates.controller.js';
import { auth } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Templates
router.get(
  '/certificate-templates',
  auth,
  asyncHandler(certificatesController.getTemplates.bind(certificatesController))
);

router.post(
  '/certificate-templates',
  auth,
  asyncHandler(certificatesController.createTemplate.bind(certificatesController))
);

router.patch(
  '/certificate-templates/:id',
  auth,
  asyncHandler(certificatesController.updateTemplate.bind(certificatesController))
);

// Certificates CRUD
router.get(
  '/certificates',
  auth,
  asyncHandler(certificatesController.getCertificates.bind(certificatesController))
);

router.post(
  '/certificates',
  auth,
  asyncHandler(certificatesController.generateCertificate.bind(certificatesController))
);

router.get(
  '/certificates/:id',
  auth,
  asyncHandler(certificatesController.getCertificateById.bind(certificatesController))
);

router.get(
  '/certificates/:id/download',
  auth,
  asyncHandler(certificatesController.downloadCertificate.bind(certificatesController))
);

router.post(
  '/certificates/:id/revoke',
  auth,
  asyncHandler(certificatesController.revokeCertificate.bind(certificatesController))
);

// Public verification
router.get(
  '/public/verify-certificate/:certificateNo',
  asyncHandler(certificatesController.verifyCertificate.bind(certificatesController))
);

export default router;
