import { Op } from 'sequelize';
import {
  User,
  Role,
  Guide,
  GuideQualification,
  GuideSpecialization,
  Scholar,
  ScholarQualification,
  ScholarTimeline,
  ScholarMilestone,
  RacSchedule,
  Department,
  ResearchCentre,
  Application,
  ApplicationType,
  WorkflowInstanceStep,
  ApplicationHistory,
  Notification,
  FileAsset,
  StaffCentre,
} from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/response.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';
import { ROLES, USER_STATUS } from '../../config/constants.js';
import { withTx } from '../../db/transaction.js';

export class PeopleController {
  /**
   * GET /dashboard
   * Role-aware dashboard counters and "Needs your action" strip.
   */
  async getDashboard(req, res) {
    const user = req.user;
    const userRoles = (user.roles || []).map((r) => r.code);
    const primaryRole = userRoles[0] || ROLES.SCHOLAR;

    let counters = {};
    let pendingTasks = [];
    let recentActivities = [];

    // Helper: query recent history
    const getRecentHistory = async (whereCondition = {}) => {
      const history = await ApplicationHistory.findAll({
        where: whereCondition,
        include: [
          { model: User, as: 'actor', attributes: ['id', 'full_name'] },
          {
            model: Application,
            as: 'application',
            attributes: ['id', 'application_no', 'status'],
            include: [{ model: ApplicationType, as: 'application_type' }],
          },
        ],
        order: [['at', 'DESC']],
        limit: 5,
      });

      return history.map((h) => ({
        id: h.application?.id || h.id,
        application_no: h.application?.application_no || `APP-${h.application_id}`,
        application_type: h.application?.application_type,
        subject_user: h.actor,
        status: h.to_status || h.application?.status || 'IN_PROGRESS',
        updated_at: h.at,
        created_at: h.at,
      }));
    };

    if (userRoles.includes(ROLES.ADMIN)) {
      const totalScholars = await Scholar.count();
      const totalGuides = await Guide.count();
      const totalCentres = await ResearchCentre.count();
      const totalApplications = await Application.count();
      const pending = await Application.count({ where: { status: 'IN_PROGRESS' } });
      const approved = await Application.count({ where: { status: 'APPROVED' } });
      const rejected = await Application.count({ where: { status: 'REJECTED' } });

      counters = {
        totalScholars,
        totalGuides,
        totalCentres,
        totalApplications,
        pending,
        approved,
        rejected,
      };

      pendingTasks = await Application.findAll({
        where: { status: 'IN_PROGRESS' },
        include: [
          { model: ApplicationType, as: 'application_type' },
          { model: User, as: 'subject_user', attributes: ['id', 'full_name'] },
        ],
        limit: 5,
        order: [['created_at', 'DESC']],
      });

      recentActivities = await getRecentHistory();
    } else if (userRoles.includes(ROLES.DRC_CONVENOR)) {
      const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
      const deptId = dept ? dept.id : null;

      const totalGuides = deptId ? await Guide.count({ where: { department_id: deptId } }) : 0;
      const totalScholars = deptId ? await Scholar.count({ where: { department_id: deptId } }) : 0;

      // Pending registrations vs service applications
      const guideRegType = await ApplicationType.findOne({ where: { code: 'GUIDE_REGISTRATION' } });
      const scholarRegType = await ApplicationType.findOne({ where: { code: 'SCHOLAR_REGISTRATION' } });

      const pendingGuideRegistrations = deptId && guideRegType
        ? await Application.count({
            where: {
              department_id: deptId,
              application_type_id: guideRegType.id,
              status: 'IN_PROGRESS',
            },
            include: [{ model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.DRC_CONVENOR } }],
          })
        : 0;

      const pendingScholarRegistrations = deptId && scholarRegType
        ? await Application.count({
            where: {
              department_id: deptId,
              application_type_id: scholarRegType.id,
              status: 'IN_PROGRESS',
            },
            include: [{ model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.DRC_CONVENOR } }],
          })
        : 0;

      const pendingScholarApplications = deptId
        ? await Application.count({
            where: {
              department_id: deptId,
              status: 'IN_PROGRESS',
              application_type_id: { [Op.notIn]: [guideRegType?.id || 0, scholarRegType?.id || 0] },
            },
            include: [{ model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.DRC_CONVENOR } }],
          })
        : 0;

      const approved = deptId ? await Application.count({ where: { department_id: deptId, status: 'APPROVED' } }) : 0;
      const rejected = deptId ? await Application.count({ where: { department_id: deptId, status: 'REJECTED' } }) : 0;

      counters = {
        totalGuides,
        totalScholars,
        pendingGuideRegistrations,
        pendingScholarRegistrations,
        pendingScholarApplications,
        approved,
        rejected,
      };

      pendingTasks = deptId
        ? await Application.findAll({
            where: { department_id: deptId, status: 'IN_PROGRESS' },
            include: [
              { model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.DRC_CONVENOR }, required: true },
              { model: ApplicationType, as: 'application_type' },
              { model: User, as: 'subject_user', attributes: ['id', 'full_name'] },
            ],
            limit: 5,
          })
        : [];

      recentActivities = await getRecentHistory(deptId ? { '$application.department_id$': deptId } : {});
    } else if (userRoles.includes(ROLES.CENTRE_HEAD)) {
      const centre = await ResearchCentre.findOne({ where: { centre_head_user_id: user.id } });
      const centreId = centre ? centre.id : null;

      const guideRegType = await ApplicationType.findOne({ where: { code: 'GUIDE_REGISTRATION' } });

      const totalGuideshipApplications = centreId && guideRegType
        ? await Application.count({ where: { research_centre_id: centreId, application_type_id: guideRegType.id } })
        : 0;

      const pending = centreId
        ? await Application.count({
            where: { research_centre_id: centreId, status: 'IN_PROGRESS' },
            include: [{ model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.CENTRE_HEAD } }],
          })
        : 0;

      const approved = centreId
        ? await Application.count({ where: { research_centre_id: centreId, status: 'APPROVED' } })
        : 0;

      const rejected = centreId
        ? await Application.count({ where: { research_centre_id: centreId, status: 'REJECTED' } })
        : 0;

      counters = {
        totalGuideshipApplications,
        pending,
        approved,
        rejected,
      };

      pendingTasks = centreId
        ? await Application.findAll({
            where: { research_centre_id: centreId, status: 'IN_PROGRESS' },
            include: [
              { model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.CENTRE_HEAD }, required: true },
              { model: ApplicationType, as: 'application_type' },
              { model: User, as: 'subject_user', attributes: ['id', 'full_name'] },
            ],
            limit: 5,
          })
        : [];

      recentActivities = await getRecentHistory(centreId ? { '$application.research_centre_id$': centreId } : {});
    } else if (userRoles.includes(ROLES.GUIDE)) {
      const guide = await Guide.findOne({ where: { user_id: user.id } });
      const guideId = guide ? guide.id : null;

      const totalAssignedScholars = guideId ? await Scholar.count({ where: { guide_id: guideId } }) : 0;
      const activeScholars = guideId ? await Scholar.count({ where: { guide_id: guideId, status: 'ACTIVE' } }) : 0;
      const totalApplicationsReceived = guideId ? await Application.count({ where: { guide_id: guideId } }) : 0;

      const pendingVerification = guideId
        ? await Application.count({
            where: { guide_id: guideId, status: 'IN_PROGRESS' },
            include: [{ model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.GUIDE } }],
          })
        : 0;

      const approved = guideId ? await Application.count({ where: { guide_id: guideId, status: 'APPROVED' } }) : 0;

      counters = {
        totalAssignedScholars,
        activeScholars,
        totalApplicationsReceived,
        pendingVerification,
        approved,
      };

      pendingTasks = guideId
        ? await Application.findAll({
            where: { guide_id: guideId, status: 'IN_PROGRESS' },
            include: [
              { model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.GUIDE }, required: true },
              { model: ApplicationType, as: 'application_type' },
              { model: User, as: 'subject_user', attributes: ['id', 'full_name'] },
            ],
            limit: 5,
          })
        : [];

      recentActivities = await getRecentHistory(guideId ? { '$application.guide_id$': guideId } : {});
    } else if (userRoles.includes(ROLES.STAFF)) {
      const staffCentres = await StaffCentre.findAll({ where: { user_id: user.id } });
      const centreIds = staffCentres.map((s) => s.research_centre_id);

      const whereCentre = centreIds.length > 0 ? { research_centre_id: { [Op.in]: centreIds } } : {};

      const totalScholars = await Scholar.count({ where: whereCentre });
      const totalGuides = await Guide.count({ where: whereCentre });
      const totalApplications = await Application.count({ where: whereCentre });
      const pending = await Application.count({
        where: { ...whereCentre, status: 'IN_PROGRESS' },
        include: [{ model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.STAFF } }],
      });
      const underProcessing = await Application.count({ where: { ...whereCentre, status: 'IN_PROGRESS' } });
      const approved = await Application.count({ where: { ...whereCentre, status: 'APPROVED' } });
      const rejected = await Application.count({ where: { ...whereCentre, status: 'REJECTED' } });

      counters = {
        totalScholars,
        totalGuides,
        totalApplications,
        pending,
        underProcessing,
        approved,
        rejected,
      };

      pendingTasks = await Application.findAll({
        where: { ...whereCentre, status: 'IN_PROGRESS' },
        include: [
          { model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE', role_code: ROLES.STAFF }, required: true },
          { model: ApplicationType, as: 'application_type' },
          { model: User, as: 'subject_user', attributes: ['id', 'full_name'] },
        ],
        limit: 5,
      });

      recentActivities = await getRecentHistory();
    } else {
      // Default: Scholar
      const scholar = await Scholar.findOne({ where: { user_id: user.id } });
      const totalApplications = await Application.count({ where: { subject_user_id: user.id } });
      const pendingApplications = await Application.count({ where: { subject_user_id: user.id, status: 'IN_PROGRESS' } });
      const approvedApplications = await Application.count({ where: { subject_user_id: user.id, status: 'APPROVED' } });
      const rejectedApplications = await Application.count({ where: { subject_user_id: user.id, status: 'REJECTED' } });

      counters = {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        registrationStatus: scholar?.registration_status || 'PENDING',
      };

      // For pending tasks, returned applications require scholar action
      const returnedApps = await Application.findAll({
        where: { subject_user_id: user.id, status: 'RETURNED' },
        include: [{ model: ApplicationType, as: 'application_type' }],
        limit: 5,
      });

      pendingTasks = returnedApps.map((app) => ({
        id: app.id,
        application_id: app.id,
        application: app,
        step_order: app.current_step_order || 1,
        assigned_at: app.updated_at,
      }));

      recentActivities = await Application.findAll({
        where: { subject_user_id: user.id },
        include: [
          { model: ApplicationType, as: 'application_type' },
          { model: User, as: 'subject_user', attributes: ['id', 'full_name'] },
        ],
        order: [['updated_at', 'DESC']],
        limit: 5,
      });
    }

    return sendResponse(res, {
      message: 'Dashboard data retrieved successfully',
      data: {
        role: primaryRole,
        counters,
        pendingTasks,
        pendingActions: pendingTasks,
        recentActivities,
        recentActivity: recentActivities,
      },
    });
  }

  /**
   * GET /scholars
   * Scoped scholar list with search and filters.
   */
  async getScholars(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { departmentId, centreId, guideId, status, q } = req.query;

    const where = {};
    if (departmentId) where.department_id = departmentId;
    if (centreId) where.research_centre_id = centreId;
    if (guideId) where.guide_id = guideId;
    if (status) where.status = status;

    const userRoles = (user.roles || []).map((r) => r.code);
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    if (!isAdmin) {
      if (userRoles.includes(ROLES.SCHOLAR)) {
        where.user_id = user.id;
      } else if (userRoles.includes(ROLES.GUIDE)) {
        const guide = await Guide.findOne({ where: { user_id: user.id } });
        where.guide_id = guide ? guide.id : -1;
      } else if (userRoles.includes(ROLES.CENTRE_HEAD)) {
        const centre = await ResearchCentre.findOne({ where: { centre_head_user_id: user.id } });
        where.research_centre_id = centre ? centre.id : -1;
      } else if (userRoles.includes(ROLES.DRC_CONVENOR)) {
        const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
        where.department_id = dept ? dept.id : -1;
      } else if (userRoles.includes(ROLES.STAFF)) {
        const staffCentres = await StaffCentre.findAll({ where: { user_id: user.id } });
        if (staffCentres.length > 0) {
          where.research_centre_id = { [Op.in]: staffCentres.map((s) => s.research_centre_id) };
        }
      }
    }

    const userWhere = {};
    if (q) {
      userWhere[Op.or] = [
        { full_name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
    }

    const scholars = await Scholar.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', where: Object.keys(userWhere).length ? userWhere : undefined, attributes: ['id', 'full_name', 'email', 'status'] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }] },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: ScholarTimeline, as: 'timeline' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(scholars, page, limit);

    return sendResponse(res, {
      message: 'Scholars retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /scholars/:id
   * Full scholar dossier.
   */
  async getScholarById(req, res) {
    const { id } = req.params;

    const scholar = await Scholar.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone', 'status'] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }] },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: ScholarQualification, as: 'qualifications' },
        { model: ScholarTimeline, as: 'timeline' },
        { model: ScholarMilestone, as: 'milestones' },
        { model: RacSchedule, as: 'rac_schedules' },
        {
          model: Application,
          as: 'applications',
          include: [{ model: ApplicationType, as: 'application_type' }],
        },
      ],
    });

    if (!scholar) {
      throw ApiError.notFound('Scholar not found');
    }

    return sendResponse(res, {
      message: 'Scholar dossier retrieved successfully',
      data: scholar,
    });
  }

  /**
   * PATCH /scholars/:id/submission-date
   * Section Staff / DRC / Admin updates date of submission and/or due date.
   */
  async updateScholarSubmissionDate(req, res) {
    const { id } = req.params;
    const { dateOfSubmission, submissionDueDate, remarks } = req.body;

    const scholar = await Scholar.findByPk(id);
    if (!scholar) {
      throw ApiError.notFound('Scholar not found');
    }

    let timeline = await ScholarTimeline.findOne({ where: { scholar_id: id } });
    if (!timeline) {
      timeline = await ScholarTimeline.create({ scholar_id: id });
    }

    if (dateOfSubmission !== undefined) timeline.date_of_submission = dateOfSubmission;
    if (submissionDueDate !== undefined) timeline.submission_due_date = submissionDueDate;
    await timeline.save();

    if (remarks) {
      await ScholarMilestone.create({
        scholar_id: id,
        label: 'Date of Submission Updated',
        completed_at: new Date(),
        notes: remarks,
      });
    }

    return sendResponse(res, {
      message: 'Scholar submission date updated successfully',
      data: timeline,
    });
  }

  /**
   * GET /scholars/:id/rac-schedule
   */
  async getScholarRacSchedules(req, res) {
    let { id } = req.params;

    if (id === 'me') {
      const scholar = await Scholar.findOne({ where: { user_id: req.user.id } });
      if (!scholar) throw ApiError.notFound('Scholar profile not found for user');
      id = scholar.id;
    }

    const schedules = await RacSchedule.findAll({
      where: { scholar_id: id },
      include: [{ model: FileAsset, as: 'minutes_file' }],
      order: [['meeting_date', 'ASC']],
    });

    return sendResponse(res, {
      message: 'RAC schedules retrieved successfully',
      data: schedules,
    });
  }

  /**
   * POST /scholars/:id/rac-schedule
   */
  async createScholarRacSchedule(req, res) {
    const { id } = req.params;
    const { meetingDate, venue, type, status } = req.body;

    const scholar = await Scholar.findByPk(id);
    if (!scholar) {
      throw ApiError.notFound('Scholar not found');
    }

    const schedule = await RacSchedule.create({
      scholar_id: id,
      meeting_date: meetingDate,
      venue: venue || 'Department Meeting Hall',
      type: type || 'Annual Review',
      status: status || 'SCHEDULED',
    });

    return sendResponse(res, {
      status: 201,
      message: 'RAC schedule created successfully',
      data: schedule,
    });
  }

  /**
   * PATCH /scholars/:id/rac-schedule/:meetingId
   */
  async updateScholarRacSchedule(req, res) {
    const { id, meetingId } = req.params;
    const { meetingDate, venue, status, minutesFileId } = req.body;

    const schedule = await RacSchedule.findOne({
      where: { id: meetingId, scholar_id: id },
    });
    if (!schedule) {
      throw ApiError.notFound('RAC meeting schedule not found');
    }

    if (meetingDate !== undefined) schedule.meeting_date = meetingDate;
    if (venue !== undefined) schedule.venue = venue;
    if (status !== undefined) schedule.status = status;
    if (minutesFileId !== undefined) schedule.minutes_file_id = minutesFileId;

    await schedule.save();

    return sendResponse(res, {
      message: 'RAC schedule updated successfully',
      data: schedule,
    });
  }

  /**
   * POST /scholars/:id/rac-schedule/:meetingId/minutes
   */
  async uploadRacMinutes(req, res) {
    const { id, meetingId } = req.params;
    const { fileId } = req.body;

    if (!fileId) {
      throw ApiError.badRequest('fileId is required');
    }

    const schedule = await RacSchedule.findOne({
      where: { id: meetingId, scholar_id: id },
    });
    if (!schedule) {
      throw ApiError.notFound('RAC meeting schedule not found');
    }

    schedule.minutes_file_id = fileId;
    schedule.status = 'DONE';
    await schedule.save();

    return sendResponse(res, {
      message: 'RAC meeting minutes uploaded and status marked as completed',
      data: schedule,
    });
  }

  /**
   * GET /guides
   * Scoped guides list.
   */
  async getGuides(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { departmentId, centreId, designationId, status, vacancy, q } = req.query;

    const where = {};
    if (departmentId) where.department_id = departmentId;
    if (centreId) where.research_centre_id = centreId;
    if (designationId) where.designation_id = designationId;
    if (status) where.registration_status = status;

    const userRoles = (user.roles || []).map((r) => r.code);
    const isAdmin = userRoles.includes(ROLES.ADMIN);

    if (!isAdmin) {
      if (userRoles.includes(ROLES.GUIDE)) {
        where.user_id = user.id;
      } else if (userRoles.includes(ROLES.CENTRE_HEAD)) {
        const centre = await ResearchCentre.findOne({ where: { centre_head_user_id: user.id } });
        where.research_centre_id = centre ? centre.id : -1;
      } else if (userRoles.includes(ROLES.DRC_CONVENOR)) {
        const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
        where.department_id = dept ? dept.id : -1;
      }
    }

    const userWhere = {};
    if (q) {
      userWhere[Op.or] = [
        { full_name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
    }

    const guides = await Guide.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', where: Object.keys(userWhere).length ? userWhere : undefined, attributes: ['id', 'full_name', 'email', 'status'] },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: Scholar, as: 'scholars', attributes: ['id', 'status'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    // Compute active scholars and vacancy
    let processed = guides.rows.map((g) => {
      const activeCount = (g.scholars || []).filter((s) => s.status === 'ACTIVE' || s.status === 'PENDING').length;
      const freeSlots = Math.max(0, g.max_scholars - activeCount);
      return {
        ...g.toJSON(),
        activeScholarsCount: activeCount,
        freeSlots,
      };
    });

    if (vacancy === 'true' || vacancy === true) {
      processed = processed.filter((g) => g.freeSlots > 0);
    }

    const pagingData = getPagingData({ count: processed.length, rows: processed }, page, limit);

    return sendResponse(res, {
      message: 'Guides retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /guides/:id
   */
  async getGuideById(req, res) {
    const { id } = req.params;

    const guide = await Guide.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: GuideQualification, as: 'qualifications' },
        { model: GuideSpecialization, as: 'specializations' },
        {
          model: Scholar,
          as: 'scholars',
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }],
        },
      ],
    });

    if (!guide) {
      throw ApiError.notFound('Guide not found');
    }

    return sendResponse(res, {
      message: 'Guide details retrieved successfully',
      data: guide,
    });
  }

  /**
   * GET /guides/:id/scholars?status=ACTIVE|COMPLETED|ALL
   */
  async getGuideScholars(req, res) {
    const { id } = req.params;
    const { status } = req.query;

    const where = { guide_id: id };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const scholars = await Scholar.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: ScholarTimeline, as: 'timeline' },
      ],
    });

    return sendResponse(res, {
      message: 'Guide scholars retrieved successfully',
      data: scholars,
    });
  }

  /**
   * PATCH /guides/:id/assign-scholar
   * Reassign scholar to this guide (with capacity check).
   */
  async assignScholarToGuide(req, res) {
    const { id } = req.params;
    const { scholarId } = req.body;

    if (!scholarId) {
      throw ApiError.badRequest('scholarId is required');
    }

    const updatedScholar = await withTx(async (tx) => {
      const guide = await Guide.findByPk(id, { transaction: tx, lock: tx.LOCK.UPDATE });
      if (!guide) {
        throw ApiError.notFound('Guide not found');
      }

      const activeCount = await Scholar.count({
        where: { guide_id: id, status: { [Op.in]: ['ACTIVE', 'PENDING'] } },
        transaction: tx,
      });

      if (activeCount >= guide.max_scholars) {
        throw ApiError.badRequest('Guide capacity has been reached', 'GUIDE_CAPACITY_EXCEEDED');
      }

      const scholar = await Scholar.findByPk(scholarId, { transaction: tx, lock: tx.LOCK.UPDATE });
      if (!scholar) {
        throw ApiError.notFound('Scholar not found');
      }

      scholar.guide_id = guide.id;
      await scholar.save({ transaction: tx });

      return scholar;
    });

    return sendResponse(res, {
      message: 'Scholar assigned to guide successfully',
      data: updatedScholar,
    });
  }

  /**
   * GET /profile
   */
  async getProfile(req, res) {
    const user = req.user;

    const fullUser = await User.findByPk(user.id, {
      attributes: ['id', 'full_name', 'email', 'phone', 'status', 'created_at'],
      include: [{ model: Role, as: 'roles', attributes: ['id', 'name', 'code'] }],
    });

    const scholarProfile = await Scholar.findOne({
      where: { user_id: user.id },
      include: [
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }] },
        { model: ScholarTimeline, as: 'timeline' },
        { model: ScholarQualification, as: 'qualifications' },
      ],
    });

    const guideProfile = await Guide.findOne({
      where: { user_id: user.id },
      include: [
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: GuideQualification, as: 'qualifications' },
        { model: GuideSpecialization, as: 'specializations' },
      ],
    });

    return sendResponse(res, {
      message: 'User profile retrieved successfully',
      data: {
        user: fullUser,
        scholar: scholarProfile,
        guide: guideProfile,
      },
    });
  }

  /**
   * PATCH /profile
   */
  async updateProfile(req, res) {
    const user = req.user;
    const { fullName, phone, address } = req.body;

    const u = await User.findByPk(user.id);
    if (fullName) u.full_name = fullName;
    if (phone !== undefined) u.phone = phone;
    await u.save();

    if (address !== undefined) {
      const scholar = await Scholar.findOne({ where: { user_id: user.id } });
      if (scholar) {
        scholar.address = address;
        await scholar.save();
      }
    }

    return sendResponse(res, {
      message: 'Profile updated successfully',
      data: u,
    });
  }

  /**
   * PATCH /profile/academic or /profile/research
   */
  async updateAcademicProfile(req, res) {
    const user = req.user;
    const { researchTitle, category } = req.body;

    const scholar = await Scholar.findOne({ where: { user_id: user.id } });
    if (scholar) {
      if (researchTitle) scholar.research_title = researchTitle;
      if (category) scholar.category = category;
      await scholar.save();
      return sendResponse(res, { message: 'Academic profile updated', data: scholar });
    }

    const guide = await Guide.findOne({ where: { user_id: user.id } });
    if (guide) {
      return sendResponse(res, { message: 'Guide profile updated', data: guide });
    }

    throw ApiError.notFound('Profile record not found');
  }

  /**
   * PATCH /profile/qualifications
   */
  async updateQualifications(req, res) {
    const user = req.user;
    const { qualifications } = req.body;

    const guide = await Guide.findOne({ where: { user_id: user.id } });
    if (guide && Array.isArray(qualifications)) {
      await GuideQualification.destroy({ where: { guide_id: guide.id } });
      for (const q of qualifications) {
        await GuideQualification.create({
          guide_id: guide.id,
          degree: q.degree,
          subject: q.subject,
          institution: q.institution,
          year_of_passing: q.yearOfPassing || q.year_of_passing,
          percentage_or_cgpa: q.percentageOrCgpa || q.percentage_or_cgpa,
        });
      }
      return sendResponse(res, { message: 'Qualifications updated successfully' });
    }

    throw ApiError.badRequest('Could not update qualifications');
  }
}

export const peopleController = new PeopleController();
export default peopleController;