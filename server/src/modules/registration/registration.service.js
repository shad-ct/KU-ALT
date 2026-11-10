import bcrypt from 'bcryptjs';
import { withTx } from '../../db/transaction.js';
import {
  User,
  Role,
  Guide,
  GuideQualification,
  GuideSpecialization,
  Scholar,
  ScholarQualification,
  Application,
  ApplicationType,
  ApplicationDocument,
  WorkflowInstanceStep,
  ApplicationHistory,
  ResearchCentre,
  Department,
  ResearchProgramme,
} from '../../models/index.js';
import { workflowService } from '../workflow/workflow.service.js';
import { FilesService } from '../files/files.service.js';
import { getNextSequence } from '../../utils/counter.js';
import { generateAccessToken } from '../../utils/token.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES, USER_STATUS, INSTITUTION_TYPE, ERROR_CODES } from '../../config/constants.js';

export class RegistrationService {
  /**
   * Validates password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
   */
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw ApiError.badRequest('Password is required', 'VALIDATION_ERROR');
    }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!regex.test(password)) {
      throw ApiError.badRequest(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
        'WEAK_PASSWORD'
      );
    }
  }

  /**
   * Guide Signup Flow per 05 §5 and 08 §6
   */
  static async signupGuide(data, files = []) {
    const {
      email,
      password,
      full_name,
      phone,
      phone_alt,
      bio,
      research_centre_id,
      designation_id,
    } = data;

    if (!email || !full_name || !research_centre_id) {
      throw ApiError.badRequest('Missing required registration fields', 'VALIDATION_ERROR');
    }

    // 1. Check existing user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.badRequest('Email address is already registered in the portal', 'EMAIL_TAKEN');
    }

    // 2. Validate password
    this.validatePassword(password);

    // 3. Centre check & signup-acceptance rule
    const centre = await ResearchCentre.findByPk(research_centre_id);
    if (!centre) {
      throw ApiError.notFound('Selected research centre not found');
    }

    if (centre.institution_type === INSTITUTION_TYPE.AFFILIATED_COLLEGE && !centre.centre_head_user_id) {
      throw ApiError.badRequest(
        'Selected research centre is not currently accepting registrations (no assigned Centre Head).',
        'CENTRE_NOT_ACCEPTING_SIGNUPS'
      );
    }

    // Parse qualifications & specializations if stringified
    let qualifications = [];
    if (data.qualifications) {
      qualifications = typeof data.qualifications === 'string'
        ? JSON.parse(data.qualifications)
        : data.qualifications;
    }

    let specializations = [];
    if (data.specializations) {
      specializations = typeof data.specializations === 'string'
        ? JSON.parse(data.specializations)
        : data.specializations;
    }

    let createdApplication = null;
    let createdUser = null;
    let createdGuide = null;

    // 4. Create User, Guide Profile, and Application in Transaction
    await withTx(async (tx) => {
      const passwordHash = await bcrypt.hash(password, 12);

      createdUser = await User.create(
        {
          email,
          password_hash: passwordHash,
          full_name,
          phone: phone || null,
          status: USER_STATUS.PENDING_APPROVAL,
        },
        { transaction: tx }
      );

      createdGuide = await Guide.create(
        {
          user_id: createdUser.id,
          designation_id: designation_id || null,
          department_id: centre.department_id,
          research_centre_id: centre.id,
          registration_status: 'PENDING',
          max_scholars: 8,
          phone_alt: phone_alt || null,
          bio: bio || null,
        },
        { transaction: tx }
      );

      // Insert qualifications
      if (Array.isArray(qualifications) && qualifications.length > 0) {
        for (const q of qualifications) {
          if (q.degree && q.institution && q.year) {
            await GuideQualification.create(
              {
                guide_id: createdGuide.id,
                degree: q.degree,
                institution: q.institution,
                year: parseInt(q.year, 10),
              },
              { transaction: tx }
            );
          }
        }
      }

      // Insert specializations
      if (Array.isArray(specializations) && specializations.length > 0) {
        for (const spec of specializations) {
          const area = typeof spec === 'string' ? spec : spec.area;
          if (area) {
            await GuideSpecialization.create(
              {
                guide_id: createdGuide.id,
                area,
              },
              { transaction: tx }
            );
          }
        }
      }

      const appType = await ApplicationType.findOne({
        where: { code: 'GUIDE_REGISTRATION' },
        transaction: tx,
      });

      if (!appType) {
        throw ApiError.internal('GUIDE_REGISTRATION application type is not configured');
      }

      const applicationNo = await getNextSequence(tx, 'application_no', 'APP', 6);

      createdApplication = await Application.create(
        {
          application_no: applicationNo,
          application_type_id: appType.id,
          guide_id: createdGuide.id,
          scholar_id: null,
          subject_user_id: createdUser.id,
          department_id: centre.department_id,
          research_centre_id: centre.id,
          institution_type: centre.institution_type,
          form_data: {
            full_name,
            email,
            phone,
            phone_alt,
            bio,
            designation_id,
            qualifications,
            specializations,
          },
          status: 'DRAFT',
          version: 1,
        },
        { transaction: tx }
      );

      // Process uploaded file documents
      for (const file of files) {
        const fileAsset = await FilesService.processUpload({
          file,
          userId: createdUser.id,
          ownerType: 'APPLICATION',
          ownerId: createdApplication.id,
        });

        await ApplicationDocument.create(
          {
            application_id: createdApplication.id,
            doc_key: file.fieldname || 'document',
            label: file.originalname,
            file_id: fileAsset.id,
          },
          { transaction: tx }
        );
      }
    });

    // 5. Submit application immediately to initiate statutory approval chain
    const submittedApp = await workflowService.submit(createdApplication.id, createdUser);

    const accessToken = generateAccessToken(createdUser, ROLES.GUIDE, ['registration:submit']);

    return {
      user: createdUser,
      guide: createdGuide,
      application: submittedApp,
      accessToken,
    };
  }

  /**
   * Scholar Signup Flow per 05 §5 and 08 §6
   */
  static async signupScholar(data, files = []) {
    const {
      email,
      password,
      full_name,
      phone,
      research_centre_id,
      guide_id,
      co_guide_id,
      programme_id,
      research_topic,
      research_title,
      research_area,
      dob,
      gender,
      address,
    } = data;

    if (!email || !full_name || !research_centre_id || !guide_id || !programme_id) {
      throw ApiError.badRequest('Missing mandatory scholar registration particulars', 'VALIDATION_ERROR');
    }

    // 1. Check existing user
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.badRequest('Email address is already registered in the portal', 'EMAIL_TAKEN');
    }

    // 2. Validate password
    this.validatePassword(password);

    // 3. Centre check & signup-acceptance rule
    const centre = await ResearchCentre.findByPk(research_centre_id);
    if (!centre) {
      throw ApiError.notFound('Selected research centre not found');
    }

    if (centre.institution_type === INSTITUTION_TYPE.AFFILIATED_COLLEGE && !centre.centre_head_user_id) {
      throw ApiError.badRequest(
        'Selected research centre is not currently accepting registrations (no assigned Centre Head).',
        'CENTRE_NOT_ACCEPTING_SIGNUPS'
      );
    }

    // 4. Guide verification & capacity check
    const guide = await Guide.findByPk(guide_id, {
      include: [{ model: Scholar, as: 'scholars' }],
    });

    if (!guide) {
      throw ApiError.badRequest('Selected research guide was not found', 'GUIDE_NOT_AVAILABLE');
    }

    if (guide.research_centre_id !== parseInt(research_centre_id, 10)) {
      throw ApiError.badRequest(
        'Selected research guide does not belong to the selected research centre',
        'GUIDE_NOT_AVAILABLE'
      );
    }

    if (guide.registration_status !== 'APPROVED') {
      throw ApiError.badRequest(
        'Selected research guide is not currently in APPROVED status',
        'GUIDE_NOT_AVAILABLE'
      );
    }

    // Count active scholars for free capacity
    const activeScholarsCount = (guide.scholars || []).filter(
      (s) => s.status === 'ACTIVE' || s.status === 'PENDING'
    ).length;

    if (activeScholarsCount >= guide.max_scholars) {
      throw ApiError.badRequest(
        `Selected research guide has reached maximum doctoral supervision quota (${guide.max_scholars} scholars).`,
        'GUIDE_NOT_AVAILABLE'
      );
    }

    let qualifications = [];
    if (data.qualifications) {
      qualifications = typeof data.qualifications === 'string'
        ? JSON.parse(data.qualifications)
        : data.qualifications;
    }

    let createdApplication = null;
    let createdUser = null;
    let createdScholar = null;

    // 5. Create in Transaction
    await withTx(async (tx) => {
      const passwordHash = await bcrypt.hash(password, 12);

      createdUser = await User.create(
        {
          email,
          password_hash: passwordHash,
          full_name,
          phone: phone || null,
          status: USER_STATUS.PENDING_APPROVAL,
        },
        { transaction: tx }
      );

      createdScholar = await Scholar.create(
        {
          user_id: createdUser.id,
          programme_id: parseInt(programme_id, 10),
          department_id: centre.department_id,
          research_centre_id: centre.id,
          guide_id: guide.id,
          co_guide_id: co_guide_id ? parseInt(co_guide_id, 10) : null,
          research_topic: research_topic || null,
          research_title: research_title || research_topic || null,
          research_area: research_area || null,
          dob: dob || null,
          gender: gender || null,
          address: address || null,
          status: 'PENDING',
          registration_status: 'PENDING',
        },
        { transaction: tx }
      );

      // Insert qualifications
      if (Array.isArray(qualifications) && qualifications.length > 0) {
        for (const q of qualifications) {
          if (q.degree && q.institution && q.year) {
            await ScholarQualification.create(
              {
                scholar_id: createdScholar.id,
                degree: q.degree,
                institution: q.institution,
                year: parseInt(q.year, 10),
                percentage: q.percentage ? parseFloat(q.percentage) : null,
              },
              { transaction: tx }
            );
          }
        }
      }

      const appType = await ApplicationType.findOne({
        where: { code: 'SCHOLAR_REGISTRATION' },
        transaction: tx,
      });

      if (!appType) {
        throw ApiError.internal('SCHOLAR_REGISTRATION application type is not configured');
      }

      const applicationNo = await getNextSequence(tx, 'application_no', 'APP', 6);

      createdApplication = await Application.create(
        {
          application_no: applicationNo,
          application_type_id: appType.id,
          scholar_id: createdScholar.id,
          guide_id: guide.id,
          subject_user_id: createdUser.id,
          department_id: centre.department_id,
          research_centre_id: centre.id,
          institution_type: centre.institution_type,
          form_data: {
            full_name,
            email,
            phone,
            programme_id,
            research_topic,
            research_title,
            research_area,
            dob,
            gender,
            address,
            qualifications,
          },
          status: 'DRAFT',
          version: 1,
        },
        { transaction: tx }
      );

      // Process uploaded file documents
      for (const file of files) {
        const fileAsset = await FilesService.processUpload({
          file,
          userId: createdUser.id,
          ownerType: 'APPLICATION',
          ownerId: createdApplication.id,
        });

        await ApplicationDocument.create(
          {
            application_id: createdApplication.id,
            doc_key: file.fieldname || 'document',
            label: file.originalname,
            file_id: fileAsset.id,
          },
          { transaction: tx }
        );
      }
    });

    // 6. Submit immediately into workflow
    const submittedApp = await workflowService.submit(createdApplication.id, createdUser);

    const accessToken = generateAccessToken(createdUser, ROLES.SCHOLAR, ['registration:submit']);

    return {
      user: createdUser,
      scholar: createdScholar,
      application: submittedApp,
      accessToken,
    };
  }

  /**
   * Retrieves registration status for a PENDING_APPROVAL user.
   */
  static async getRegistrationStatus(userId) {
    const application = await Application.findOne({
      where: { subject_user_id: userId },
      include: [
        { model: ApplicationType, as: 'application_type' },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        {
          model: Guide,
          as: 'guide',
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
        },
        {
          model: Scholar,
          as: 'scholar',
          include: [
            { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
            { model: ResearchProgramme, as: 'programme' },
          ],
        },
        {
          model: WorkflowInstanceStep,
          as: 'instance_steps',
          include: [{ model: User, as: 'actor', attributes: ['id', 'full_name'] }],
        },
        {
          model: ApplicationDocument,
          as: 'documents',
        },
        {
          model: ApplicationHistory,
          as: 'history',
          include: [{ model: User, as: 'actor', attributes: ['id', 'full_name'] }],
        },
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: WorkflowInstanceStep, as: 'instance_steps' }, 'step_order', 'ASC'],
        [{ model: ApplicationHistory, as: 'history' }, 'at', 'ASC'],
      ],
    });

    if (!application) {
      throw ApiError.notFound('No registration application found for this account');
    }

    const activeStep = application.instance_steps?.find((s) => s.status === 'ACTIVE');

    return {
      application,
      currentStep: activeStep || null,
      isReturned: application.status === 'RETURNED',
      isRejected: application.status === 'REJECTED',
      isApproved: application.status === 'APPROVED',
      rejectionReason: application.rejection_reason || null,
    };
  }

  /**
   * Resubmits a RETURNED registration application after user edits.
   */
  static async resubmitRegistration(userId, updatedData = {}) {
    const application = await Application.findOne({
      where: {
        subject_user_id: userId,
        status: 'RETURNED',
      },
    });

    if (!application) {
      throw ApiError.badRequest('No returned registration application found for resubmission', 'NOT_RETURNED');
    }

    const user = await User.findByPk(userId);
    return workflowService.resubmit(application.id, user, updatedData);
  }
}

export default RegistrationService;

