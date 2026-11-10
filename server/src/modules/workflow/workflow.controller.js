import { Op } from 'sequelize';
import {
  Application,
  ApplicationType,
  WorkflowInstanceStep,
  ApplicationHistory,
  ApplicationDocument,
  OfficialReply,
  OfficialReplyFile,
  Department,
  ResearchCentre,
  Guide,
  Scholar,
  User,
  Role,
  FileAsset,
  StaffCentre,
  Designation,
  GuideSpecialization,
} from '../../models/index.js';
import { workflowService } from './workflow.service.js';
import { getNextSequence } from '../../utils/counter.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/response.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';
import { ROLES, USER_STATUS } from '../../config/constants.js';
import { withTx } from '../../db/transaction.js';

export class WorkflowController {
  /**
   * GET /approvals?type=&status=&q=&page=&limit=
   * Returns applications currently in progress and waiting on the caller's action.
   */
  async getApprovals(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { type, q } = req.query;

    const userRoles = user.roles.map((r) => r.code);
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    // Build conditions for matching active steps
    const activeStepWhere = { status: 'ACTIVE' };
    if (!isAdmin) {
      activeStepWhere.role_code = { [Op.in]: userRoles };
    }

    const appWhere = { status: 'IN_PROGRESS' };
    if (type) {
      appWhere.application_type_id = type;
    }
    if (q) {
      appWhere[Op.or] = [
        { application_no: { [Op.like]: `%${q}%` } },
      ];
    }

    // Include active step and related entities
    const applications = await Application.findAndCountAll({
      where: appWhere,
      include: [
        {
          model: WorkflowInstanceStep,
          as: 'instance_steps',
          where: activeStepWhere,
          required: true,
        },
        { model: ApplicationType, as: 'application_type' },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: User, as: 'subject_user', attributes: ['id', 'full_name', 'email'] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }] },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }] },
      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    // In-memory filter for non-admin scope match (ensures only files scoped to this user are returned)
    let filteredRows = applications.rows;
    if (!isAdmin) {
      const scopedRows = [];
      for (const app of applications.rows) {
        const activeStep = app.instance_steps?.find((s) => s.status === 'ACTIVE');
        if (activeStep) {
          try {
            await workflowService.assertActorEligible(user, activeStep, app);
            scopedRows.push(app);
          } catch {
            // Not in scope for this specific user
          }
        }
      }
      filteredRows = scopedRows;
    }

    const pagingData = getPagingData(
      { count: filteredRows.length, rows: filteredRows },
      page,
      limit
    );

    return sendResponse(res, {
      message: 'Approvals queue retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /applications?type=&status=&scholar=&guide=&department=&centre=&q=&page=&limit=
   * Returns list of applications scoped to the caller's role.
   */
  async getApplications(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { type, status, scholar, guide, department, centre, q } = req.query;

    const where = {};
    if (type) where.application_type_id = type;
    if (status) where.status = status;
    if (scholar) where.scholar_id = scholar;
    if (guide) where.guide_id = guide;
    if (department) where.department_id = department;
    if (centre) where.research_centre_id = centre;
    if (q) {
      where[Op.or] = [
        { application_no: { [Op.like]: `%${q}%` } },
      ];
    }

    const userRoles = user.roles.map((r) => r.code);
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    // Apply role scoping
    if (!isAdmin) {
      if (userRoles.includes(ROLES.SCHOLAR)) {
        where.subject_user_id = user.id;
      } else if (userRoles.includes(ROLES.GUIDE)) {
        const guideProfile = await Guide.findOne({ where: { user_id: user.id } });
        if (guideProfile) {
          where[Op.or] = [
            { guide_id: guideProfile.id },
            { subject_user_id: user.id },
          ];
        } else {
          where.subject_user_id = user.id;
        }
      } else if (userRoles.includes(ROLES.CENTRE_HEAD)) {
        const myCentre = await ResearchCentre.findOne({ where: { centre_head_user_id: user.id } });
        if (myCentre) {
          where.research_centre_id = myCentre.id;
        }
      } else if (userRoles.includes(ROLES.DRC_CONVENOR)) {
        const myDept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
        if (myDept) {
          where.department_id = myDept.id;
        }
      } else if (userRoles.includes(ROLES.STAFF)) {
        const staffAssignments = await StaffCentre.findAll({ where: { user_id: user.id } });
        if (staffAssignments.length > 0) {
          where.research_centre_id = { [Op.in]: staffAssignments.map((s) => s.research_centre_id) };
        }
      }
    }

    const result = await Application.findAndCountAll({
      where,
      include: [
        { model: ApplicationType, as: 'application_type' },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: User, as: 'subject_user', attributes: ['id', 'full_name', 'email'] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }] },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(result, page, limit);

    return sendResponse(res, {
      message: 'Applications retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /applications/:id
   * Full application detail + instance steps + documents + history + available actions.
   */
  async getApplicationById(req, res) {
    const user = req.user;
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [
        { model: ApplicationType, as: 'application_type' },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: User, as: 'subject_user', attributes: ['id', 'full_name', 'email'] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }] },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }] },
        {
          model: WorkflowInstanceStep,
          as: 'instance_steps',
          include: [{ model: User, as: 'actor', attributes: ['id', 'full_name'] }],
        },
        {
          model: ApplicationDocument,
          as: 'documents',
          include: [{ model: FileAsset, as: 'file' }],
        },
        {
          model: ApplicationHistory,
          as: 'history',
          include: [{ model: User, as: 'actor', attributes: ['id', 'full_name'] }],
        },
        {
          model: OfficialReply,
          as: 'official_replies',
          include: [
            { model: User, as: 'sender', attributes: ['id', 'full_name'] },
            { model: OfficialReplyFile, as: 'files', include: [{ model: FileAsset, as: 'file' }] },
          ],
        },
      ],
      order: [
        [{ model: WorkflowInstanceStep, as: 'instance_steps' }, 'step_order', 'ASC'],
        [{ model: ApplicationHistory, as: 'history' }, 'at', 'ASC'],
      ],
    });

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const availableActions = await workflowService.availableActions(application, user);

    return sendResponse(res, {
      message: 'Application details retrieved successfully',
      data: {
        application,
        availableActions,
      },
    });
  }

  /**
   * GET /applications/:id/timeline
   */
  async getApplicationTimeline(req, res) {
    const { id } = req.params;

    const history = await ApplicationHistory.findAll({
      where: { application_id: id },
      include: [{ model: User, as: 'actor', attributes: ['id', 'full_name', 'email'] }],
      order: [['at', 'ASC']],
    });

    return sendResponse(res, {
      message: 'Timeline events retrieved successfully',
      data: history,
    });
  }

  /**
   * POST /applications
   * Creates a new application draft or submits directly if autoSubmit=true.
   */
  async createDraft(req, res) {
    const user = req.user;
    const {
      applicationTypeCode,
      departmentId,
      researchCentreId,
      guideId,
      scholarId,
      formData,
      documents,
      autoSubmit,
      submit,
    } = req.body;

    const appType = await ApplicationType.findOne({
      where: { code: applicationTypeCode || req.body.type },
    });
    if (!appType) {
      throw ApiError.badRequest('Invalid application type code', 'INVALID_TYPE');
    }

    let resolvedScholarId = scholarId || null;
    let resolvedGuideId = guideId || null;
    let resolvedDeptId = departmentId || null;
    let resolvedCentreId = researchCentreId || null;

    if (!resolvedScholarId) {
      const scholarProfile = await Scholar.findOne({ where: { user_id: user.id } });
      if (scholarProfile) {
        resolvedScholarId = scholarProfile.id;
        resolvedGuideId = resolvedGuideId || scholarProfile.guide_id;
        resolvedDeptId = resolvedDeptId || scholarProfile.department_id;
        resolvedCentreId = resolvedCentreId || scholarProfile.research_centre_id;
      }
    }

    if (!resolvedCentreId) {
      throw ApiError.badRequest('Research centre could not be determined for this application', 'INVALID_CENTRE');
    }

    const centre = await ResearchCentre.findByPk(resolvedCentreId);
    if (!centre) {
      throw ApiError.badRequest('Research centre not found', 'INVALID_CENTRE');
    }

    resolvedDeptId = resolvedDeptId || centre.department_id;

    const application = await withTx(async (tx) => {
      const applicationNo = await getNextSequence(tx, 'application_no', 'APP', 6);

      const app = await Application.create(
        {
          application_no: applicationNo,
          application_type_id: appType.id,
          scholar_id: resolvedScholarId,
          guide_id: resolvedGuideId,
          subject_user_id: user.id,
          department_id: resolvedDeptId,
          research_centre_id: centre.id,
          institution_type: centre.institution_type,
          form_data: formData || {},
          status: 'DRAFT',
          version: 1,
        },
        { transaction: tx }
      );

      if (documents && Array.isArray(documents)) {
        for (const doc of documents) {
          const fId = doc.file_id || doc.fileId;
          if (fId) {
            await ApplicationDocument.create(
              {
                application_id: app.id,
                doc_key: doc.doc_key || doc.docKey || 'SUPPORTING_DOC',
                label: doc.label || 'Supporting Document',
                file_id: fId,
              },
              { transaction: tx }
            );
          }
        }
      }

      return app;
    });

    if (autoSubmit || submit) {
      const submittedApp = await workflowService.submit(application.id, user);
      return sendResponse(res, {
        status: 201,
        message: 'Application created and submitted successfully',
        data: submittedApp,
      });
    }

    return sendResponse(res, {
      status: 201,
      message: 'Application draft created successfully',
      data: application,
    });
  }

  /**
   * PATCH /applications/:id
   * Edit draft or returned application.
   */
  async updateDraft(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { formData } = req.body;

    const application = await Application.findByPk(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (application.status !== 'DRAFT' && application.status !== 'RETURNED') {
      throw ApiError.badRequest('Only DRAFT or RETURNED applications can be edited', 'INVALID_STATUS');
    }

    if (application.subject_user_id !== user.id && !user.roles?.some((r) => r.code === ROLES.ADMIN)) {
      throw ApiError.forbidden('You are not authorized to edit this application');
    }

    application.form_data = {
      ...(application.form_data || {}),
      ...(formData || {}),
    };
    await application.save();

    return sendResponse(res, {
      message: 'Application updated successfully',
      data: application,
    });
  }

  /**
   * POST /applications/:id/submit
   * Submits application and starts workflow instance.
   */
  async submitApplication(req, res) {
    const user = req.user;
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (application.subject_user_id !== user.id && !user.roles?.some((r) => r.code === ROLES.ADMIN)) {
      throw ApiError.forbidden('You are not authorized to submit this application');
    }

    const updatedApp = await workflowService.submit(id, user);

    return sendResponse(res, {
      message: 'Application submitted successfully and routed to first approver.',
      data: updatedApp,
    });
  }

  /**
   * POST /applications/:id/actions
   * Core workflow action endpoint: VERIFY | FORWARD | APPROVE | REJECT | RETURN | REPLY
   */
  async actOnApplication(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { action, remarks, attachmentFileIds, expectedStep } = req.body;

    if (!action) {
      throw ApiError.badRequest('Action is required', 'MISSING_ACTION');
    }

    const updatedApp = await workflowService.act(id, user, {
      action,
      remarks,
      attachmentFileIds,
      expectedStep,
    });

    return sendResponse(res, {
      message: `Action ${action} executed successfully`,
      data: updatedApp,
    });
  }

  /**
   * POST /applications/:id/cancel
   */
  async cancelApplication(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { remarks } = req.body;

    const application = await Application.findByPk(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (application.subject_user_id !== user.id) {
      throw ApiError.forbidden('Only the applicant can cancel their own application');
    }

    if (application.status !== 'DRAFT' && application.status !== 'IN_PROGRESS' && application.status !== 'RETURNED') {
      throw ApiError.badRequest(`Cannot cancel application in status ${application.status}`, 'INVALID_STATUS');
    }

    const prevStatus = application.status;
    application.status = 'CANCELLED';
    await application.save();

    await ApplicationHistory.create({
      application_id: application.id,
      step_order: application.current_step_order,
      action: 'CANCEL',
      from_status: prevStatus,
      to_status: 'CANCELLED',
      actor_user_id: user.id,
      actor_role: 'APPLICANT',
      remarks: remarks || 'Cancelled by applicant',
    });

    return sendResponse(res, {
      message: 'Application cancelled successfully',
      data: application,
    });
  }

  /**
   * POST /applications/:id/documents
   * Attaches a document to an application.
   */
  async uploadDocument(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { docKey, label, fileId } = req.body;

    if (!fileId) {
      throw ApiError.badRequest('fileId is required');
    }

    const application = await Application.findByPk(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const doc = await ApplicationDocument.create({
      application_id: application.id,
      doc_key: docKey || 'DOCUMENT',
      label: label || 'Supporting Document',
      file_id: fileId,
    });

    return sendResponse(res, {
      status: 201,
      message: 'Document attached successfully',
      data: doc,
    });
  }

  /**
   * PATCH /applications/:id/status
   * Manual administrative status override (audited) for Staff or Admin.
   */
  async updateApplicationStatus(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { status, remarks } = req.body;

    const userRoles = (user.roles || []).map((r) => r.code);
    if (!userRoles.includes(ROLES.ADMIN) && !userRoles.includes(ROLES.STAFF)) {
      throw ApiError.forbidden('Only Staff or Admin may manually update application status');
    }

    const application = await Application.findByPk(id);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const prevStatus = application.status;
    application.status = status;
    await application.save();

    await ApplicationHistory.create({
      application_id: application.id,
      step_order: application.current_step_order || 1,
      action: 'STATUS_UPDATE',
      from_status: prevStatus,
      to_status: status,
      actor_user_id: user.id,
      actor_role: userRoles.includes(ROLES.ADMIN) ? ROLES.ADMIN : ROLES.STAFF,
      remarks: remarks || `Status manually updated to ${status}`,
    });

    return sendResponse(res, {
      message: `Application status updated to ${status}`,
      data: application,
    });
  }

  /**
   * GET /applications/:id/documents/:fileId/download
   */
  async downloadDocument(req, res) {
    const { id, fileId } = req.params;

    const doc = await ApplicationDocument.findOne({
      where: { application_id: id, file_id: fileId },
      include: [{ model: FileAsset, as: 'file' }],
    });
    if (!doc || !doc.file) {
      throw ApiError.notFound('Document not found for this application');
    }

    res.download(doc.file.storage_path, doc.file.original_name);
  }

  /**
   * POST /applications/:id/replies
   */
  async addReply(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { text, attachmentFileIds } = req.body;

    if (!text || !text.trim()) {
      throw ApiError.badRequest('Reply text is required');
    }

    const reply = await withTx(async (tx) => {
      const rep = await OfficialReply.create(
        {
          application_id: id,
          by_user_id: user.id,
          text,
          visible_to_scholar: true,
        },
        { transaction: tx }
      );

      if (attachmentFileIds && attachmentFileIds.length > 0) {
        for (const fileId of attachmentFileIds) {
          await OfficialReplyFile.create(
            {
              reply_id: rep.id,
              file_id: fileId,
            },
            { transaction: tx }
          );
        }
      }
      return rep;
    });

    return sendResponse(res, {
      status: 201,
      message: 'Official reply issued successfully',
      data: reply,
    });
  }

  /**
   * GET /public/guides?centreId=
   * Lists ONLY APPROVED guides with free capacity (< max_scholars) from chosen centre.
   */
  async getPublicGuides(req, res) {
    const centreId = req.params.centreId || req.query.centreId;
    if (!centreId) {
      throw ApiError.badRequest('centreId query parameter is required');
    }

    const whereClause = {
      research_centre_id: centreId,
      registration_status: 'APPROVED',
    };
    if (req.query.department_id || req.query.departmentId) {
      whereClause.department_id = req.query.department_id || req.query.departmentId;
    }

    const guides = await Guide.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: Scholar, as: 'scholars', attributes: ['id', 'status'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name'] },
        { model: GuideSpecialization, as: 'specializations', attributes: ['id', 'area'] },
      ],
    });

    // Filter guides with free capacity (< max_scholars active scholars)
    const availableGuides = guides
      .map((g) => {
        const activeScholarsCount = (g.scholars || []).filter(
          (s) => s.status === 'ACTIVE' || s.status === 'PENDING'
        ).length;
        const freeSlots = Math.max(0, g.max_scholars - activeScholarsCount);
        const specAreas = (g.specializations || []).map((s) => s.area).filter(Boolean);
        return {
          id: g.id,
          userId: g.user_id,
          name: g.user?.full_name || g.user?.name || 'Faculty Guide',
          email: g.user?.email,
          designation: g.designation?.name || 'Faculty Guide',
          designationId: g.designation_id,
          maxScholars: g.max_scholars,
          activeScholarsCount,
          freeSlots,
          available_slots: freeSlots,
          specialization: specAreas.length > 0 ? specAreas.join(', ') : (g.bio || 'Doctoral Research Supervisor'),
        };
      })
      .filter((g) => g.freeSlots > 0);

    return sendResponse(res, {
      message: 'Available approved research guides retrieved successfully',
      data: availableGuides,
    });
  }
}

export const workflowController = new WorkflowController();
export default workflowController;
