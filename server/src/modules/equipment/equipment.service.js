import { Op } from 'sequelize';
import {
  Equipment,
  EquipmentUnit,
  EquipmentCategory,
  EquipmentRequest,
  EquipmentAllocation,
  EquipmentRequestHistory,
  EquipmentMaintenanceLog,
  Scholar,
  Guide,
  User,
  Department,
  ResearchCentre,
  JobRun,
  Notification,
} from '../../models/index.js';
import { getNextSequence } from '../../utils/counter.js';
import { ApiError } from '../../utils/ApiError.js';
import { withTx } from '../../db/transaction.js';

export class EquipmentService {
  /**
   * Submit an equipment request by a scholar.
   */
  async submitRequest(scholarUserId, { equipmentId, quantity = 1, purpose, requestedFrom, expectedReturnDate }) {
    if (!purpose || purpose.trim().length < 10) {
      throw ApiError.badRequest('Purpose must be at least 10 characters long', 'VALIDATION_ERROR');
    }

    const scholar = await Scholar.findOne({ where: { user_id: scholarUserId } });
    if (!scholar) {
      throw ApiError.notFound('Scholar profile not found');
    }

    if (scholar.registration_status !== 'APPROVED' || scholar.status !== 'ACTIVE') {
      throw ApiError.forbidden('Only active approved scholars may request equipment', 'SCHOLAR_NOT_ACTIVE');
    }

    // Check active allocation limit (default 3)
    const activeAllocationsCount = await EquipmentAllocation.count({
      where: {
        scholar_id: scholar.id,
        status: { [Op.in]: ['ACTIVE', 'OVERDUE'] },
      },
    });

    if (activeAllocationsCount >= 3) {
      throw ApiError.badRequest('You have reached the maximum allowed active allocations (3)', 'MAX_ALLOCATIONS_REACHED');
    }

    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment || !equipment.is_active) {
      throw ApiError.notFound('Equipment not found or inactive');
    }

    // Validate expected return date vs max_loan_days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromDate = requestedFrom ? new Date(requestedFrom) : today;
    const returnDate = expectedReturnDate ? new Date(expectedReturnDate) : new Date(fromDate.getTime() + 14 * 86400000);

    if (returnDate < fromDate) {
      throw ApiError.badRequest('Expected return date cannot precede request date', 'VALIDATION_ERROR');
    }

    const maxDays = equipment.max_loan_days || 14;
    const diffDays = Math.ceil((returnDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > maxDays) {
      throw ApiError.badRequest(`Requested duration (${diffDays} days) exceeds maximum loan limit of ${maxDays} days`, 'LOAN_LIMIT_EXCEEDED');
    }

    return withTx(async (tx) => {
      const requestNo = await getNextSequence(tx, 'eq_req_no', 'EQR', 6);

      const request = await EquipmentRequest.create(
        {
          request_no: requestNo,
          scholar_id: scholar.id,
          guide_id: scholar.guide_id,
          department_id: equipment.department_id,
          equipment_id: equipment.id,
          quantity: equipment.tracking_mode === 'BULK' ? quantity : 1,
          purpose,
          requested_from: fromDate.toISOString().split('T')[0],
          expected_return_date: returnDate.toISOString().split('T')[0],
          status: 'PENDING',
          version: 1,
        },
        { transaction: tx }
      );

      await EquipmentRequestHistory.create(
        {
          request_id: request.id,
          from_status: 'NONE',
          to_status: 'PENDING',
          actor_user_id: scholarUserId,
          remarks: 'Request submitted by scholar',
          at: new Date(),
        },
        { transaction: tx }
      );

      // Notify DRC convenor of owning department
      const dept = await Department.findByPk(equipment.department_id, { transaction: tx });
      if (dept && dept.drc_convenor_user_id) {
        await Notification.create(
          {
            recipient_user_id: dept.drc_convenor_user_id,
            type: 'EQUIPMENT',
            title: 'New Equipment Request',
            body: `Scholar requested ${equipment.name} (${requestNo}) for research work.`,
            link: `/equipment/requests/${request.id}`,
          },
          { transaction: tx }
        );
      }

      return request;
    });
  }

  /**
   * DRC Convenor approves an equipment request.
   */
  async approveRequest(requestId, drcUserId, { remarks } = {}) {
    return withTx(async (tx) => {
      const request = await EquipmentRequest.findByPk(requestId, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      if (!request) {
        throw ApiError.notFound('Equipment request not found');
      }

      if (request.status !== 'PENDING') {
        throw ApiError.badRequest(`Cannot approve request in status ${request.status}`, 'INVALID_TRANSITION');
      }

      const prevStatus = request.status;
      request.status = 'APPROVED';
      request.decided_by = drcUserId;
      request.decided_at = new Date();
      request.remarks = remarks || 'Approved by Department Head';
      request.version += 1;
      await request.save({ transaction: tx });

      await EquipmentRequestHistory.create(
        {
          request_id: request.id,
          from_status: prevStatus,
          to_status: 'APPROVED',
          actor_user_id: drcUserId,
          remarks: request.remarks,
          at: new Date(),
        },
        { transaction: tx }
      );

      const scholar = await Scholar.findByPk(request.scholar_id, { transaction: tx });
      if (scholar) {
        await Notification.create(
          {
            recipient_user_id: scholar.user_id,
            type: 'EQUIPMENT',
            title: 'Equipment Request Approved',
            body: `Your request (${request.request_no}) has been approved. Awaiting physical allocation.`,
            link: `/equipment/requests/${request.id}`,
          },
          { transaction: tx }
        );
      }

      return request;
    });
  }

  /**
   * DRC Convenor rejects an equipment request.
   */
  async rejectRequest(requestId, drcUserId, { remarks }) {
    if (!remarks || !remarks.trim()) {
      throw ApiError.badRequest('Remarks are mandatory when rejecting an equipment request', 'VALIDATION_ERROR');
    }

    return withTx(async (tx) => {
      const request = await EquipmentRequest.findByPk(requestId, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      if (!request) {
        throw ApiError.notFound('Equipment request not found');
      }

      if (request.status !== 'PENDING' && request.status !== 'APPROVED') {
        throw ApiError.badRequest(`Cannot reject request in status ${request.status}`, 'INVALID_TRANSITION');
      }

      const prevStatus = request.status;
      request.status = 'REJECTED';
      request.decided_by = drcUserId;
      request.decided_at = new Date();
      request.remarks = remarks;
      request.version += 1;
      await request.save({ transaction: tx });

      await EquipmentRequestHistory.create(
        {
          request_id: request.id,
          from_status: prevStatus,
          to_status: 'REJECTED',
          actor_user_id: drcUserId,
          remarks,
          at: new Date(),
        },
        { transaction: tx }
      );

      const scholar = await Scholar.findByPk(request.scholar_id, { transaction: tx });
      if (scholar) {
        await Notification.create(
          {
            recipient_user_id: scholar.user_id,
            type: 'EQUIPMENT',
            title: 'Equipment Request Rejected',
            body: `Your request (${request.request_no}) was rejected. Reason: ${remarks}`,
            link: `/equipment/requests/${request.id}`,
          },
          { transaction: tx }
        );
      }

      return request;
    });
  }

  /**
   * Cancel request (by applicant scholar).
   */
  async cancelRequest(requestId, scholarUserId, { remarks } = {}) {
    return withTx(async (tx) => {
      const request = await EquipmentRequest.findByPk(requestId, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      if (!request) {
        throw ApiError.notFound('Equipment request not found');
      }

      const scholar = await Scholar.findOne({ where: { user_id: scholarUserId }, transaction: tx });
      if (!scholar || scholar.id !== request.scholar_id) {
        throw ApiError.forbidden('Only the requesting scholar may cancel this request');
      }

      if (request.status !== 'PENDING' && request.status !== 'APPROVED') {
        throw ApiError.badRequest(`Cannot cancel request in status ${request.status}`, 'REQUEST_NOT_CANCELLABLE');
      }

      const prevStatus = request.status;
      request.status = 'CANCELLED';
      request.remarks = remarks || 'Cancelled by scholar';
      request.version += 1;
      await request.save({ transaction: tx });

      await EquipmentRequestHistory.create(
        {
          request_id: request.id,
          from_status: prevStatus,
          to_status: 'CANCELLED',
          actor_user_id: scholarUserId,
          remarks: request.remarks,
          at: new Date(),
        },
        { transaction: tx }
      );

      return request;
    });
  }

  /**
   * ATOMIC ALLOCATION (Core Spec 06 §0, §2, §3):
   * Allocates equipment to scholar.
   * 3 concurrency protection layers:
   * 1. withTx transaction wrapper with deadlock retry.
   * 2. Row lock (SELECT FOR UPDATE) on unit / guarded atomic UPDATE for bulk.
   * 3. DB-level unique constraint on active_unit_id generated column.
   */
  async allocateRequest(requestId, allotterUserId, { unitId, quantity, allocatedOn, expectedReturnDate }) {
    return withTx(async (tx) => {
      const request = await EquipmentRequest.findByPk(requestId, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      if (!request) {
        throw ApiError.notFound('Equipment request not found');
      }

      if (request.status !== 'APPROVED') {
        throw ApiError.badRequest(`Request must be in APPROVED status to allocate (currently ${request.status})`, 'INVALID_TRANSITION');
      }

      const equipment = await Equipment.findByPk(request.equipment_id, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      if (!equipment || !equipment.is_active) {
        throw ApiError.badRequest('Equipment is unavailable or deactivated', 'EQUIPMENT_UNAVAILABLE');
      }

      const allocDate = allocatedOn || new Date().toISOString().split('T')[0];
      const returnDate = expectedReturnDate || request.expected_return_date;
      let finalUnitId = null;
      let allocQty = 1;

      if (equipment.tracking_mode === 'SERIALIZED') {
        // Layer 2: Lock unit row
        let targetUnit = null;

        if (unitId) {
          targetUnit = await EquipmentUnit.findOne({
            where: { id: unitId, equipment_id: equipment.id },
            lock: tx.LOCK.UPDATE,
            transaction: tx,
          });

          if (!targetUnit) {
            throw ApiError.notFound('Specified equipment unit not found');
          }

          if (targetUnit.status !== 'AVAILABLE') {
            throw ApiError.badRequest('This equipment unit is already allocated or under maintenance', 'EQUIPMENT_ALREADY_ALLOCATED');
          }
        } else {
          // Auto-pick next available unit
          targetUnit = await EquipmentUnit.findOne({
            where: { equipment_id: equipment.id, status: 'AVAILABLE' },
            order: [['id', 'ASC']],
            lock: tx.LOCK.UPDATE,
            transaction: tx,
          });

          if (!targetUnit) {
            throw ApiError.badRequest('No units currently available for this equipment', 'EQUIPMENT_UNAVAILABLE');
          }
        }

        finalUnitId = targetUnit.id;
        targetUnit.status = 'ALLOCATED';
        await targetUnit.save({ transaction: tx });
      } else {
        // BULK items: Guarded atomic decrement
        allocQty = quantity || request.quantity || 1;
        const [affectedRows] = await Equipment.update(
          {
            available_quantity: Equipment.sequelize.literal(`available_quantity - ${allocQty}`),
          },
          {
            where: {
              id: equipment.id,
              available_quantity: { [Op.gte]: allocQty },
            },
            transaction: tx,
          }
        );

        if (affectedRows === 0) {
          throw ApiError.badRequest('Insufficient bulk inventory available for allocation', 'EQUIPMENT_UNAVAILABLE');
        }
      }

      // Create allocation record (Layer 3: protected by DB unique index on active_unit_id)
      let allocation;
      try {
        allocation = await EquipmentAllocation.create(
          {
            request_id: request.id,
            equipment_id: equipment.id,
            unit_id: finalUnitId,
            quantity: allocQty,
            scholar_id: request.scholar_id,
            allotted_by: allotterUserId,
            allocated_on: allocDate,
            expected_return_date: returnDate,
            status: 'ACTIVE',
          },
          { transaction: tx }
        );
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError' || err.parent?.code === 'ER_DUP_ENTRY') {
          throw ApiError.badRequest('Equipment unit is already actively allocated to another scholar', 'EQUIPMENT_ALREADY_ALLOCATED');
        }
        throw err;
      }

      // Update request status
      const prevStatus = request.status;
      request.status = 'ALLOCATED';
      request.version += 1;
      await request.save({ transaction: tx });

      await EquipmentRequestHistory.create(
        {
          request_id: request.id,
          from_status: prevStatus,
          to_status: 'ALLOCATED',
          actor_user_id: allotterUserId,
          remarks: `Equipment allotted to scholar. Expected return: ${returnDate}`,
          at: new Date(),
        },
        { transaction: tx }
      );

      const scholar = await Scholar.findByPk(request.scholar_id, { transaction: tx });
      if (scholar) {
        await Notification.create(
          {
            recipient_user_id: scholar.user_id,
            type: 'EQUIPMENT',
            title: 'Equipment Allocated',
            body: `Your request (${request.request_no}) for ${equipment.name} has been allocated. Due on ${returnDate}. Instructions: ${equipment.usage_instructions || 'None'}`,
            link: `/equipment/requests/${request.id}`,
          },
          { transaction: tx }
        );
      }

      return { request, allocation };
    });
  }

  /**
   * Return Check-In:
   * DRC records equipment return and condition.
   */
  async returnAllocation(allocationId, receiverUserId, { returnedOn, returnCondition, returnNotes }) {
    return withTx(async (tx) => {
      const allocation = await EquipmentAllocation.findByPk(allocationId, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      if (!allocation) {
        throw ApiError.notFound('Allocation record not found');
      }

      if (allocation.status === 'RETURNED') {
        throw ApiError.badRequest('This equipment allocation has already been checked in as returned', 'ALREADY_RETURNED');
      }

      const request = await EquipmentRequest.findByPk(allocation.request_id, {
        lock: tx.LOCK.UPDATE,
        transaction: tx,
      });

      const returnDate = returnedOn || new Date().toISOString().split('T')[0];

      // Restore equipment/unit availability
      if (allocation.unit_id) {
        const unit = await EquipmentUnit.findByPk(allocation.unit_id, {
          lock: tx.LOCK.UPDATE,
          transaction: tx,
        });

        if (unit) {
          if (returnCondition === 'DAMAGED' || returnCondition === 'POOR') {
            unit.status = 'UNDER_MAINTENANCE';
            unit.condition = returnCondition;
            await EquipmentMaintenanceLog.create(
              {
                unit_id: unit.id,
                logged_at: new Date(),
                type: 'RETURN_INSPECTION',
                notes: `Flagged on return check-in: ${returnNotes || returnCondition}`,
                by_user_id: receiverUserId,
              },
              { transaction: tx }
            );
          } else {
            unit.status = 'AVAILABLE';
            if (returnCondition) unit.condition = returnCondition;
          }
          await unit.save({ transaction: tx });
        }
      } else {
        // BULK: Increment available_quantity
        await Equipment.update(
          {
            available_quantity: Equipment.sequelize.literal(`available_quantity + ${allocation.quantity}`),
          },
          {
            where: { id: allocation.equipment_id },
            transaction: tx,
          }
        );
      }

      // Update allocation
      allocation.status = 'RETURNED';
      allocation.returned_on = returnDate;
      allocation.return_condition = returnCondition || 'GOOD';
      allocation.return_notes = returnNotes || 'Checked in by Department Staff';
      allocation.received_by = receiverUserId;
      await allocation.save({ transaction: tx });

      // Update request
      const prevReqStatus = request.status;
      request.status = 'RETURNED';
      request.version += 1;
      await request.save({ transaction: tx });

      await EquipmentRequestHistory.create(
        {
          request_id: request.id,
          from_status: prevReqStatus,
          to_status: 'RETURNED',
          actor_user_id: receiverUserId,
          remarks: `Equipment returned. Condition: ${returnCondition || 'GOOD'}. ${returnNotes || ''}`,
          at: new Date(),
        },
        { transaction: tx }
      );

      const scholar = await Scholar.findByPk(request.scholar_id, { transaction: tx });
      if (scholar) {
        await Notification.create(
          {
            recipient_user_id: scholar.user_id,
            type: 'EQUIPMENT',
            title: 'Equipment Return Confirmed',
            body: `Your return for request ${request.request_no} has been processed successfully.`,
            link: `/equipment/requests/${request.id}`,
          },
          { transaction: tx }
        );
      }

      return { allocation, request };
    });
  }

  /**
   * Overdue cron check:
   * Idempotent daily job via job_runs.
   */
  async checkOverdueAllocations() {
    const todayStr = new Date().toISOString().split('T')[0];
    const jobKey = 'EQUIPMENT_OVERDUE_JOB';

    // Check if job already ran today
    const existingRun = await JobRun.findOne({
      where: { job_key: jobKey, run_date: todayStr },
    });

    if (existingRun && existingRun.status === 'SUCCESS') {
      return { skipped: true, reason: 'Job already ran for today' };
    }

    const job = await JobRun.create({
      job_key: jobKey,
      run_date: todayStr,
      started_at: new Date(),
      status: 'RUNNING',
    });

    try {
      const overdueAllocations = await EquipmentAllocation.findAll({
        where: {
          status: 'ACTIVE',
          expected_return_date: { [Op.lt]: todayStr },
        },
      });

      let count = 0;
      for (const alloc of overdueAllocations) {
        alloc.status = 'OVERDUE';
        await alloc.save();

        const request = await EquipmentRequest.findByPk(alloc.request_id);
        if (request) {
          request.status = 'OVERDUE';
          request.was_overdue = true;
          await request.save();

          await EquipmentRequestHistory.create({
            request_id: request.id,
            from_status: 'ALLOCATED',
            to_status: 'OVERDUE',
            actor_user_id: null,
            remarks: 'System flagged allocation as overdue',
            at: new Date(),
          });

          // Dispatch notification
          const scholar = await Scholar.findByPk(request.scholar_id);
          if (scholar) {
            await Notification.create({
              recipient_user_id: scholar.user_id,
              type: 'EQUIPMENT',
              title: 'Equipment Loan Overdue',
              body: `Your loan for ${request.request_no} was due on ${alloc.expected_return_date}. Please return immediately.`,
              link: `/equipment/requests/${request.id}`,
            });
          }
        }
        count++;
      }

      job.status = 'SUCCESS';
      job.finished_at = new Date();
      job.details = { overdueCount: count };
      await job.save();

      return { success: true, count };
    } catch (err) {
      job.status = 'FAILED';
      job.finished_at = new Date();
      job.error_message = err.message;
      await job.save();
      throw err;
    }
  }
}

export const equipmentService = new EquipmentService();
export default equipmentService;
