import { RegistrationService } from './registration.service.js';
import { sendResponse } from '../../utils/response.js';

export class RegistrationController {
  /**
   * POST /public/signup/guide
   */
  async signupGuide(req, res) {
    const files = req.files || [];
    const result = await RegistrationService.signupGuide(req.body, files);

    return sendResponse(res, {
      status: 201,
      message: 'Guide registration submitted successfully. Your file is in review.',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.full_name,
          status: result.user.status,
        },
        applicationNo: result.application.application_no,
        applicationId: result.application.id,
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * POST /public/signup/scholar
   */
  async signupScholar(req, res) {
    const files = req.files || [];
    const result = await RegistrationService.signupScholar(req.body, files);

    return sendResponse(res, {
      status: 201,
      message: 'Scholar registration submitted successfully. Your file is in review.',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.full_name,
          status: result.user.status,
        },
        applicationNo: result.application.application_no,
        applicationId: result.application.id,
        accessToken: result.accessToken,
      },
    });
  }

  /**
   * GET /registration/status
   */
  async getStatus(req, res) {
    const statusData = await RegistrationService.getRegistrationStatus(req.user.id);

    return sendResponse(res, {
      message: 'Registration status retrieved successfully',
      data: statusData,
    });
  }

  /**
   * PATCH /registration/resubmit
   */
  async resubmit(req, res) {
    const updated = await RegistrationService.resubmitRegistration(req.user.id, req.body);

    return sendResponse(res, {
      message: 'Registration application resubmitted successfully for review.',
      data: updated,
    });
  }
}

export const registrationController = new RegistrationController();
export default registrationController;

