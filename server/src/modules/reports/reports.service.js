import { Op } from 'sequelize';
import {
  Scholar,
  Guide,
  Application,
  ApplicationType,
  WorkflowInstanceStep,
  Department,
  ResearchCentre,
  User,
  Equipment,
  EquipmentAllocation,
  EquipmentRequest,
  ScholarTimeline,
  AuditLog,
} from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../config/constants.js';

export class ReportsService {
  /**
   * Generates report data based on reportKey and caller scope.
   */
  async generateReport(reportKey, user, filters = {}) {
    const userRoles = (user.roles || []).map((r) => r.code);
    const isAdmin = userRoles.includes(ROLES.ADMIN);
    const isDrc = userRoles.includes(ROLES.DRC_CONVENOR);
    const isStaff = userRoles.includes(ROLES.STAFF);

    // Scoping rules
    let scopedDeptId = filters.departmentId || null;
    let scopedCentreId = filters.centreId || null;

    if (!isAdmin) {
      if (isDrc) {
        const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
        scopedDeptId = dept ? dept.id : -1;
      }
    }

    switch (reportKey) {
      case 'active-scholars':
      case 'scholar-registration': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;
        if (scopedCentreId) where.research_centre_id = scopedCentreId;
        if (filters.status) where.status = filters.status;

        const scholars = await Scholar.findAll({
          where,
          include: [
            { model: User, as: 'user', attributes: ['full_name', 'email'] },
            { model: Department, as: 'department', attributes: ['name', 'code'] },
            { model: ResearchCentre, as: 'research_centre', attributes: ['name', 'code'] },
            { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
            { model: ScholarTimeline, as: 'timeline' },
          ],
          order: [['created_at', 'DESC']],
        });

        return scholars.map((s) => ({
          scholarId: s.id,
          name: s.user?.full_name,
          email: s.user?.email,
          registrationNo: s.registration_no || 'PENDING',
          status: s.status,
          department: s.department?.name,
          centre: s.research_centre?.name,
          guide: s.guide?.user?.full_name,
          researchTitle: s.research_title || s.research_topic || '',
          registeredOn: s.timeline?.date_of_registration || '',
          submissionDueDate: s.timeline?.submission_due_date || '',
        }));
      }

      case 'vacancies':
      case 'guide-registration': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;
        if (scopedCentreId) where.research_centre_id = scopedCentreId;
        if (filters.status) where.registration_status = filters.status;

        const guides = await Guide.findAll({
          where,
          include: [
            { model: User, as: 'user', attributes: ['full_name', 'email'] },
            { model: Department, as: 'department', attributes: ['name', 'code'] },
            { model: ResearchCentre, as: 'research_centre', attributes: ['name', 'code'] },
            { model: Scholar, as: 'scholars', attributes: ['id', 'status'] },
          ],
          order: [['created_at', 'DESC']],
        });

        return guides.map((g) => {
          const activeScholars = (g.scholars || []).filter((s) => s.status === 'ACTIVE' || s.status === 'PENDING').length;
          return {
            guideId: g.id,
            name: g.user?.full_name,
            email: g.user?.email,
            status: g.registration_status,
            department: g.department?.name,
            centre: g.research_centre?.name,
            maxCapacity: g.max_scholars,
            activeScholars,
            freeSlots: Math.max(0, g.max_scholars - activeScholars),
            approvedAt: g.approved_at || '',
          };
        });
      }

      case 'stage-distribution':
      case 'application-status': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;
        if (scopedCentreId) where.research_centre_id = scopedCentreId;
        if (filters.status) where.status = filters.status;
        if (filters.type) where.application_type_id = filters.type;

        const applications = await Application.findAll({
          where,
          include: [
            { model: ApplicationType, as: 'application_type', attributes: ['name', 'code'] },
            { model: Department, as: 'department', attributes: ['name'] },
            { model: ResearchCentre, as: 'research_centre', attributes: ['name'] },
            { model: User, as: 'subject_user', attributes: ['full_name', 'email'] },
          ],
          order: [['created_at', 'DESC']],
        });

        return applications.map((a) => ({
          applicationNo: a.application_no,
          applicant: a.subject_user?.full_name,
          type: a.application_type?.name,
          status: a.status,
          department: a.department?.name,
          centre: a.research_centre?.name,
          submittedAt: a.submitted_at || a.created_at,
          decidedAt: a.decided_at || '',
        }));
      }

      case 'centre-wise': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;

        const centres = await ResearchCentre.findAll({
          where,
          include: [
            { model: Department, as: 'department', attributes: ['name'] },
            { model: Scholar, as: 'scholars', attributes: ['id', 'status'] },
            { model: Guide, as: 'guides', attributes: ['id', 'registration_status'] },
          ],
        });

        return centres.map((c) => ({
          centreId: c.id,
          name: c.name,
          code: c.code,
          institutionType: c.institution_type,
          department: c.department?.name,
          totalScholars: (c.scholars || []).length,
          activeScholars: (c.scholars || []).filter((s) => s.status === 'ACTIVE').length,
          totalGuides: (c.guides || []).length,
          approvedGuides: (c.guides || []).filter((g) => g.registration_status === 'APPROVED').length,
        }));
      }

      case 'guide-scholars':
      case 'guide-wise-scholars': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;

        const guides = await Guide.findAll({
          where,
          include: [
            { model: User, as: 'user', attributes: ['full_name'] },
            { model: Department, as: 'department', attributes: ['name'] },
            { model: ResearchCentre, as: 'research_centre', attributes: ['name'] },
            { model: Scholar, as: 'scholars', include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
          ],
        });

        return guides.map((g) => ({
          guideName: g.user?.full_name,
          department: g.department?.name,
          centre: g.research_centre?.name,
          maxScholars: g.max_scholars,
          assignedCount: (g.scholars || []).length,
          activeCount: (g.scholars || []).filter((s) => s.status === 'ACTIVE').length,
          scholars: (g.scholars || []).map((s) => s.user?.full_name).join('; '),
        }));
      }

      case 'turnaround':
      case 'pending-applications': {
        const where = { status: 'IN_PROGRESS' };
        if (scopedDeptId) where.department_id = scopedDeptId;

        const pending = await Application.findAll({
          where,
          include: [
            { model: ApplicationType, as: 'application_type' },
            { model: User, as: 'subject_user', attributes: ['full_name'] },
            { model: Department, as: 'department', attributes: ['name'] },
            { model: WorkflowInstanceStep, as: 'instance_steps', where: { status: 'ACTIVE' }, required: false },
          ],
          order: [['created_at', 'ASC']],
        });

        return pending.map((p) => {
          const activeStep = (p.instance_steps || [])[0];
          const daysElapsed = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return {
            applicationNo: p.application_no,
            applicant: p.subject_user?.full_name,
            type: p.application_type?.name,
            currentRoleWaiting: activeStep?.role_code || p.current_role_code,
            stepName: activeStep?.name || '',
            daysElapsed,
            department: p.department?.name,
          };
        });
      }

      case 'at-risk':
      case 'date-of-submission': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;

        const scholars = await Scholar.findAll({
          where,
          include: [
            { model: User, as: 'user', attributes: ['full_name', 'email'] },
            { model: Department, as: 'department', attributes: ['name'] },
            { model: ScholarTimeline, as: 'timeline' },
          ],
        });

        return scholars.map((s) => ({
          registrationNo: s.registration_no || 'PENDING',
          scholarName: s.user?.full_name,
          department: s.department?.name,
          commencementDate: s.timeline?.commencement_date || '',
          submissionDueDate: s.timeline?.submission_due_date || '',
          actualSubmissionDate: s.timeline?.date_of_submission || 'NOT_SUBMITTED',
          status: s.timeline?.date_of_submission ? 'SUBMITTED' : 'IN_PROGRESS',
        }));
      }

      case 'fellowships':
      case 'equipment-utilization': {
        const where = {};
        if (scopedDeptId) where.department_id = scopedDeptId;

        const equipment = await Equipment.findAll({
          where,
          include: [
            { model: Department, as: 'department', attributes: ['name'] },
            { model: EquipmentAllocation, as: 'allocations' },
          ],
        });

        return equipment.map((eq) => {
          const totalAllocations = (eq.allocations || []).length;
          const activeAllocations = (eq.allocations || []).filter((a) => a.status === 'ACTIVE' || a.status === 'OVERDUE').length;
          return {
            equipmentCode: eq.code,
            name: eq.name,
            department: eq.department?.name,
            trackingMode: eq.tracking_mode,
            totalInventory: eq.total_quantity,
            availableInventory: eq.available_quantity,
            totalHistoricalAllocations: totalAllocations,
            activeAllocations,
          };
        });
      }

      default:
        throw ApiError.badRequest(`Unknown report key: ${reportKey}`, 'INVALID_REPORT_KEY');
    }
  }

  /**
   * Converts JSON dataset to CSV string.
   */
  convertToCsv(data = []) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((h) => {
          const val = row[h] == null ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Log export in audit_logs.
   */
  async logExport(user, reportKey, format, rowCount) {
    await AuditLog.create({
      actor_user_id: user.id,
      actor_role: (user.roles || [])[0]?.code || 'USER',
      action: 'EXPORT_REPORT',
      entity_type: 'REPORT',
      entity_id: 0,
      after_json: { reportKey, format, rowCount },
      at: new Date(),
    });
  }
}

export const reportsService = new ReportsService();
export default reportsService;
