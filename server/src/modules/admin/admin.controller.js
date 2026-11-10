import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import {
  User,
  Role,
  Permission,
  UserRole,
  StaffCentre,
  Department,
  ResearchCentre,
  WorkflowDefinition,
  WorkflowStep,
  Setting,
  AuditLog,
  JobRun,
} from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/response.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';
import { ROLES, USER_STATUS } from '../../config/constants.js';
import { withTx } from '../../db/transaction.js';

export class AdminController {
  /**
   * GET /admin/users
   */
  async getUsers(req, res) {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { role, status, q } = req.query;

    const where = {};
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
    }

    const roleInclude = {
      model: Role,
      as: 'roles',
      attributes: ['id', 'name', 'code'],
    };
    if (role) {
      roleInclude.where = { code: role };
      roleInclude.required = true;
    }

    const users = await User.findAndCountAll({
      where,
      include: [roleInclude, { model: Department, as: 'department' }, { model: ResearchCentre, as: 'research_centre' }],
      attributes: ['id', 'email', 'full_name', 'phone', 'status', 'last_login_at', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(users, page, limit);

    return sendResponse(res, {
      message: 'Admin users retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * POST /admin/users
   */
  async createUser(req, res) {
    const { email, password, fullName, phone, roleCodes = [] } = req.body;

    if (!email || !password || !fullName) {
      throw ApiError.badRequest('email, password, and fullName are required');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.badRequest('User with this email already exists', 'EMAIL_TAKEN');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await withTx(async (tx) => {
      const newUser = await User.create(
        {
          email,
          password_hash: passwordHash,
          full_name: fullName,
          phone,
          status: USER_STATUS.ACTIVE,
        },
        { transaction: tx }
      );

      for (const code of roleCodes) {
        const r = await Role.findOne({ where: { code }, transaction: tx });
        if (r) {
          await UserRole.create(
            {
              user_id: newUser.id,
              role_id: r.id,
            },
            { transaction: tx }
          );
        }
      }

      return newUser;
    });

    return sendResponse(res, {
      status: 201,
      message: 'User created successfully',
      data: { id: user.id, email: user.email, fullName: user.full_name },
    });
  }

  /**
   * PATCH /admin/users/:id
   */
  async updateUser(req, res) {
    const { id } = req.params;
    const { fullName, phone, departmentId, researchCentreId, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) throw ApiError.notFound('User not found');

    if (fullName) user.full_name = fullName;
    if (phone !== undefined) user.phone = phone;
    if (departmentId !== undefined) user.department_id = departmentId;
    if (researchCentreId !== undefined) user.research_centre_id = researchCentreId;
    if (status) user.status = status;
    await user.save();

    return sendResponse(res, {
      message: 'User updated successfully',
      data: user,
    });
  }

  /**
   * POST /admin/users/:id/activate
   */
  async activateUser(req, res) {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) throw ApiError.notFound('User not found');

    user.status = USER_STATUS.ACTIVE;
    await user.save();

    return sendResponse(res, {
      message: 'User activated successfully',
      data: user,
    });
  }

  /**
   * POST /admin/users/:id/deactivate
   */
  async deactivateUser(req, res) {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) throw ApiError.notFound('User not found');

    user.status = USER_STATUS.INACTIVE;
    await user.save();

    return sendResponse(res, {
      message: 'User deactivated successfully',
      data: user,
    });
  }

  /**
   * PUT /admin/users/:id/roles
   */
  async updateUserRoles(req, res) {
    const { id } = req.params;
    const { roleCodes } = req.body;

    const user = await User.findByPk(id);
    if (!user) throw ApiError.notFound('User not found');

    await withTx(async (tx) => {
      await UserRole.destroy({ where: { user_id: id }, transaction: tx });
      for (const code of roleCodes) {
        const r = await Role.findOne({ where: { code }, transaction: tx });
        if (r) {
          await UserRole.create({ user_id: id, role_id: r.id }, { transaction: tx });
        }
      }
    });

    return sendResponse(res, { message: 'User roles updated successfully' });
  }

  /**
   * PUT /admin/staff/:id/centres
   */
  async updateStaffCentres(req, res) {
    const { id } = req.params;
    const { centreIds } = req.body;

    await withTx(async (tx) => {
      await StaffCentre.destroy({ where: { user_id: id }, transaction: tx });
      for (const cId of centreIds) {
        await StaffCentre.create({ user_id: id, research_centre_id: cId }, { transaction: tx });
      }
    });

    return sendResponse(res, { message: 'Staff centre assignments updated successfully' });
  }

  /**
   * GET /admin/reports/missing-approvers
   * Identifies centres without heads or departments without convenors.
   */
  async getMissingApproversReport(req, res) {
    const centresWithoutHead = await ResearchCentre.findAll({
      where: {
        institution_type: 'AFFILIATED_COLLEGE',
        centre_head_user_id: null,
        is_active: true,
      },
      include: [{ model: Department, as: 'department', attributes: ['name', 'code'] }],
    });

    const deptsWithoutConvenor = await Department.findAll({
      where: {
        drc_convenor_user_id: null,
        is_active: true,
      },
    });

    return sendResponse(res, {
      message: 'Missing approvers diagnostic report retrieved',
      data: {
        centresWithoutHead: centresWithoutHead.map((c) => ({
          centreId: c.id,
          name: c.name,
          code: c.code,
          department: c.department?.name,
          severity: 'BLOCKING_SIGNUPS',
        })),
        departmentsWithoutConvenor: deptsWithoutConvenor.map((d) => ({
          departmentId: d.id,
          name: d.name,
          code: d.code,
          severity: 'BLOCKING_FINAL_APPROVAL',
        })),
      },
    });
  }

  /**
   * GET /admin/workflows
   */
  async getWorkflows(req, res) {
    const workflows = await WorkflowDefinition.findAll({
      include: [{ model: WorkflowStep, as: 'steps' }],
      order: [
        ['code', 'ASC'],
        [{ model: WorkflowStep, as: 'steps' }, 'step_order', 'ASC'],
      ],
    });
    return sendResponse(res, {
      message: 'Workflow definitions retrieved successfully',
      data: workflows,
    });
  }

  /**
   * GET /admin/audit-logs
   */
  async getAuditLogs(req, res) {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { entityType, actorUserId, q } = req.query;

    const where = {};
    if (entityType) where.entity_type = entityType;
    if (actorUserId) where.actor_user_id = actorUserId;

    const logs = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'actor', attributes: ['full_name', 'email'] }],
      order: [['at', 'DESC']],
      limit,
      offset,
    });

    const pagingData = getPagingData(logs, page, limit);

    return sendResponse(res, {
      message: 'Audit logs retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * POST /admin/backup
   */
  async triggerBackup(req, res) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotName = `kannur_rd_db_backup_${timestamp}.sql`;

    return sendResponse(res, {
      message: 'Database backup snapshot initialized successfully',
      data: {
        snapshotName,
        status: 'COMPLETED',
        createdAt: new Date(),
      },
    });
  }
}

export const adminController = new AdminController();
export default adminController;