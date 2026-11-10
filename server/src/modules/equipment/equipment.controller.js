import { Op } from 'sequelize';
import {
  Equipment,
  EquipmentUnit,
  EquipmentCategory,
  EquipmentRequest,
  EquipmentAllocation,
  EquipmentRequestHistory,
  EquipmentMaintenanceLog,
  Department,
  ResearchCentre,
  Scholar,
  Guide,
  User,
  FileAsset,
} from '../../models/index.js';
import { equipmentService } from './equipment.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/response.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';
import { ROLES } from '../../config/constants.js';

export class EquipmentController {
  /**
   * GET /equipment
   * Browse equipment catalog.
   */
  async getCatalog(req, res) {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { departmentId, categoryId, availability, q } = req.query;

    const where = { is_active: true };
    if (departmentId) where.department_id = departmentId;
    if (categoryId) where.category_id = categoryId;
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { code: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    const equipmentList = await Equipment.findAndCountAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
        { model: ResearchCentre, as: 'research_centre', attributes: ['id', 'name', 'code'] },
        { model: EquipmentCategory, as: 'category', attributes: ['id', 'name'] },
        { model: EquipmentUnit, as: 'units' },
      ],
      order: [['name', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    const enriched = equipmentList.rows.map((eq) => {
      let availableCount = 0;
      if (eq.tracking_mode === 'SERIALIZED') {
        availableCount = (eq.units || []).filter((u) => u.status === 'AVAILABLE').length;
      } else {
        availableCount = eq.available_quantity;
      }

      let availabilityStatus = 'AVAILABLE';
      if (availableCount === 0) {
        availabilityStatus = 'UNAVAILABLE';
      } else if (availableCount <= 2) {
        availabilityStatus = 'LIMITED';
      }

      return {
        ...eq.toJSON(),
        availableCount,
        availabilityStatus,
      };
    });

    let filtered = enriched;
    if (availability === 'AVAILABLE') {
      filtered = enriched.filter((eq) => eq.availableCount > 0);
    } else if (availability === 'UNAVAILABLE') {
      filtered = enriched.filter((eq) => eq.availableCount === 0);
    }

    const pagingData = getPagingData({ count: filtered.length, rows: filtered }, page, limit);

    return sendResponse(res, {
      message: 'Equipment catalog retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /equipment/:id
   */
  async getEquipmentById(req, res) {
    const { id } = req.params;

    const equipment = await Equipment.findByPk(id, {
      include: [
        { model: Department, as: 'department' },
        { model: ResearchCentre, as: 'research_centre' },
        { model: EquipmentCategory, as: 'category' },
        { model: EquipmentUnit, as: 'units' },
      ],
    });

    if (!equipment) {
      throw ApiError.notFound('Equipment not found');
    }

    let availableCount = 0;
    if (equipment.tracking_mode === 'SERIALIZED') {
      availableCount = (equipment.units || []).filter((u) => u.status === 'AVAILABLE').length;
    } else {
      availableCount = equipment.available_quantity;
    }

    return sendResponse(res, {
      message: 'Equipment details retrieved successfully',
      data: {
        ...equipment.toJSON(),
        availableCount,
        availabilityStatus: availableCount === 0 ? 'UNAVAILABLE' : availableCount <= 2 ? 'LIMITED' : 'AVAILABLE',
      },
    });
  }

  /**
   * GET /equipment-categories
   */
  async getCategories(req, res) {
    const categories = await EquipmentCategory.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    return sendResponse(res, {
      message: 'Equipment categories retrieved successfully',
      data: categories,
    });
  }

  /**
   * POST /equipment-requests
   * Scholar submits request.
   */
  async submitRequest(req, res) {
    const user = req.user;
    const { equipmentId, quantity, purpose, requestedFrom, expectedReturnDate } = req.body;

    const request = await equipmentService.submitRequest(user.id, {
      equipmentId,
      quantity,
      purpose,
      requestedFrom,
      expectedReturnDate,
    });

    return sendResponse(res, {
      status: 201,
      message: 'Equipment request submitted successfully',
      data: request,
    });
  }

  /**
   * GET /equipment-requests/mine
   */
  async getMyRequests(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { status } = req.query;

    const scholar = await Scholar.findOne({ where: { user_id: user.id } });
    if (!scholar) {
      throw ApiError.notFound('Scholar record not found');
    }

    const where = { scholar_id: scholar.id };
    if (status) where.status = status;

    const requests = await EquipmentRequest.findAndCountAll({
      where,
      include: [
        { model: Equipment, as: 'equipment' },
        { model: Department, as: 'department' },
        {
          model: EquipmentAllocation,
          as: 'allocation',
          include: [{ model: EquipmentUnit, as: 'unit' }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(requests, page, limit);

    return sendResponse(res, {
      message: 'Scholar equipment requests retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /equipment-requests/:id
   */
  async getRequestById(req, res) {
    const { id } = req.params;

    const request = await EquipmentRequest.findByPk(id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: Department, as: 'department' },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] },
        {
          model: EquipmentAllocation,
          as: 'allocation',
          include: [
            { model: EquipmentUnit, as: 'unit' },
            { model: User, as: 'allotter', attributes: ['full_name'] },
            { model: User, as: 'receiver', attributes: ['full_name'] },
          ],
        },
        {
          model: EquipmentRequestHistory,
          as: 'history',
          include: [{ model: User, as: 'actor', attributes: ['full_name'] }],
        },
      ],
    });

    if (!request) {
      throw ApiError.notFound('Equipment request not found');
    }

    return sendResponse(res, {
      message: 'Request details retrieved successfully',
      data: request,
    });
  }

  /**
   * POST /equipment-requests/:id/cancel
   */
  async cancelRequest(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { remarks } = req.body;

    const cancelled = await equipmentService.cancelRequest(id, user.id, { remarks });

    return sendResponse(res, {
      message: 'Equipment request cancelled successfully',
      data: cancelled,
    });
  }

  /**
   * POST /drc/equipment
   * DRC adds new equipment (+ optional units).
   */
  async createEquipment(req, res) {
    const user = req.user;
    const {
      name,
      code,
      categoryId,
      description,
      usageInstructions,
      specifications,
      trackingMode,
      totalQuantity,
      maxLoanDays,
      requiresTraining,
      units,
    } = req.body;

    const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
    if (!dept) {
      throw ApiError.forbidden('Only DRC Convenors may add equipment for their department');
    }

    const eq = await Equipment.create({
      department_id: dept.id,
      category_id: categoryId,
      name,
      code,
      description,
      usage_instructions: usageInstructions,
      specifications: specifications || {},
      tracking_mode: trackingMode || 'SERIALIZED',
      total_quantity: totalQuantity || (units ? units.length : 1),
      available_quantity: trackingMode === 'BULK' ? (totalQuantity || 1) : 0,
      max_loan_days: maxLoanDays || 14,
      requires_training: requiresTraining || false,
      is_active: true,
    });

    if (trackingMode !== 'BULK' && units && Array.isArray(units)) {
      for (const u of units) {
        await EquipmentUnit.create({
          equipment_id: eq.id,
          asset_tag: u.assetTag || u.asset_tag,
          serial_no: u.serialNo || u.serial_no || null,
          condition: u.condition || 'NEW',
          status: 'AVAILABLE',
        });
      }
    }

    return sendResponse(res, {
      status: 201,
      message: 'Equipment added successfully to department inventory',
      data: eq,
    });
  }

  /**
   * PATCH /drc/equipment/:id
   */
  async updateEquipment(req, res) {
    const { id } = req.params;
    const eq = await Equipment.findByPk(id);
    if (!eq) throw ApiError.notFound('Equipment not found');

    const fields = ['name', 'description', 'usage_instructions', 'specifications', 'max_loan_days', 'requires_training', 'is_active'];
    for (const f of fields) {
      if (req.body[f] !== undefined) eq[f] = req.body[f];
    }
    await eq.save();

    return sendResponse(res, {
      message: 'Equipment updated successfully',
      data: eq,
    });
  }

  /**
   * POST /drc/equipment/:id/deactivate
   */
  async deactivateEquipment(req, res) {
    const { id } = req.params;
    const eq = await Equipment.findByPk(id);
    if (!eq) throw ApiError.notFound('Equipment not found');

    const activeAlloc = await EquipmentAllocation.count({
      where: { equipment_id: id, status: { [Op.in]: ['ACTIVE', 'OVERDUE'] } },
    });
    if (activeAlloc > 0) {
      throw ApiError.badRequest('Cannot deactivate equipment with active or overdue allocations', 'ACTIVE_ALLOCATIONS_EXIST');
    }

    eq.is_active = false;
    await eq.save();

    return sendResponse(res, {
      message: 'Equipment record deactivated successfully',
      data: eq,
    });
  }

  /**
   * POST /drc/equipment-requests/:id/approve
   */
  async approveRequest(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await equipmentService.approveRequest(id, user.id, { remarks });

    return sendResponse(res, {
      message: 'Equipment request approved',
      data: request,
    });
  }

  /**
   * POST /drc/equipment-requests/:id/reject
   */
  async rejectRequest(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await equipmentService.rejectRequest(id, user.id, { remarks });

    return sendResponse(res, {
      message: 'Equipment request rejected',
      data: request,
    });
  }

  /**
   * POST /drc/equipment-requests/:id/allocate
   */
  async allocateRequest(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { unitId, quantity, allocatedOn, expectedReturnDate } = req.body;

    const result = await equipmentService.allocateRequest(id, user.id, {
      unitId,
      quantity,
      allocatedOn,
      expectedReturnDate,
    });

    return sendResponse(res, {
      message: 'Equipment allotted to scholar successfully',
      data: result,
    });
  }

  /**
   * POST /drc/equipment-allocations/:id/return
   */
  async returnAllocation(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { returnedOn, returnCondition, returnNotes } = req.body;

    const result = await equipmentService.returnAllocation(id, user.id, {
      returnedOn,
      returnCondition,
      returnNotes,
    });

    return sendResponse(res, {
      message: 'Equipment return checked in successfully',
      data: result,
    });
  }

  /**
   * GET /drc/equipment-requests
   */
  async getDrcRequests(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { status, scholarId, equipmentId } = req.query;

    const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
    const deptId = dept ? dept.id : null;

    const where = {};
    if (deptId) where.department_id = deptId;
    if (status) where.status = status;
    if (scholarId) where.scholar_id = scholarId;
    if (equipmentId) where.equipment_id = equipmentId;

    const requests = await EquipmentRequest.findAndCountAll({
      where,
      include: [
        { model: Equipment, as: 'equipment' },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] },
        { model: EquipmentAllocation, as: 'allocation' },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(requests, page, limit);

    return sendResponse(res, {
      message: 'DRC equipment requests retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * GET /drc/equipment/dashboard
   * Counters per 06 §4.
   */
  async getDrcDashboard(req, res) {
    const user = req.user;
    const dept = await Department.findOne({ where: { drc_convenor_user_id: user.id } });
    const deptId = dept ? dept.id : -1;

    const totalEquipment = await Equipment.count({ where: { department_id: deptId, is_active: true } });
    const totalRequests = await EquipmentRequest.count({ where: { department_id: deptId } });
    const pendingRequests = await EquipmentRequest.count({ where: { department_id: deptId, status: 'PENDING' } });
    const approvedRequests = await EquipmentRequest.count({ where: { department_id: deptId, status: 'APPROVED' } });
    const rejectedRequests = await EquipmentRequest.count({ where: { department_id: deptId, status: 'REJECTED' } });
    const currentlyAllocated = await EquipmentAllocation.count({
      include: [{ model: Equipment, as: 'equipment', where: { department_id: deptId } }],
      where: { status: { [Op.in]: ['ACTIVE', 'OVERDUE'] } },
    });

    return sendResponse(res, {
      message: 'DRC equipment dashboard retrieved successfully',
      data: {
        totalEquipment,
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        currentlyAllocated,
      },
    });
  }

  /**
   * GET /admin/equipment/dashboard
   */
  async getAdminDashboard(req, res) {
    const totalDepartments = await Department.count();
    const totalEquipment = await Equipment.count({ where: { is_active: true } });
    const totalRequests = await EquipmentRequest.count();
    const pendingRequests = await EquipmentRequest.count({ where: { status: 'PENDING' } });
    const activeAllocations = await EquipmentAllocation.count({ where: { status: 'ACTIVE' } });
    const overdueAllocations = await EquipmentAllocation.count({ where: { status: 'OVERDUE' } });

    return sendResponse(res, {
      message: 'Admin equipment monitoring dashboard retrieved successfully',
      data: {
        totalDepartments,
        totalEquipment,
        totalRequests,
        pendingRequests,
        activeAllocations,
        overdueAllocations,
      },
    });
  }
}

export const equipmentController = new EquipmentController();
export default equipmentController;
