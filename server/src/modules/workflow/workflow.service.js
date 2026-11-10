import { Op } from 'sequelize';
import { withTx } from '../../db/transaction.js';
import {
  Application,
  ApplicationType,
  WorkflowDefinition,
  WorkflowStep,
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
  StaffCentre,
} from '../../models/index.js';
import { workflowHooks } from './hooks/index.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { getNextSequence } from '../../utils/counter.js';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES, USER_STATUS } from '../../config/constants.js';

export class WorkflowService {
  /**
   * Resolves steps from the definition template filtered by applicant's institution_type.
   * Steps are renumbered 1..n.
   */
  async resolveChain(applicationTypeId, institutionType) {
    const appType = await ApplicationType.findByPk(applicationTypeId, {
      include: [
        {
          model: WorkflowDefinition,
          as: 'workflow_definition',
          include: [
            {
              model: WorkflowStep,
              as: 'steps',
            },
          ],
        },
      ],
    });

    if (!appType || !appType.workflow_definition) {
      throw ApiError.badRequest('Workflow definition not configured for application type', 'WORKFLOW_DEF_NOT_FOUND');
    }

    const allSteps = appType.workflow_definition.steps || [];
    allSteps.sort((a, b) => a.step_order - b.step_order);

    // Keep steps where step.institution_type IN ('ANY', centre.institution_type)
    const filtered = allSteps.filter(
      (s) => s.institution_type === 'ANY' || s.institution_type === institutionType
    );

    if (filtered.length === 0) {
      throw ApiError.badRequest('No workflow steps found for institution type', 'WORKFLOW_EMPTY_CHAIN');
    }

    // Renumber 1..n and ensure the last step is flagged is_final
    return filtered.map((step, index) => ({
      template_step_id: step.id,
      step_order: index + 1,
      name: step.name,
      role_code: step.role_code,
      scope_rule: step.scope_rule,
      allowed_actions: step.allowed_actions,
      require_remarks_on_reject: step.require_remarks_on_reject,
      sla_days: step.sla_days,
      is_final: index === filtered.length - 1 ? true : step.is_final,
    }));
  }

  /**
   * Section 4 Assignee Resolution: validates that an eligible approver exists for every step.
   * If any step has no eligible user, throws WORKFLOW_NO_ASSIGNEE.
   */
  async assertAssigneesExist(resolvedSteps, context) {
    const { departmentId, researchCentreId, guideId, subjectUserId } = context;

    const [centre, dept] = await Promise.all([
      ResearchCentre.findByPk(researchCentreId),
      Department.findByPk(departmentId),
    ]);

    if (!centre) {
      throw ApiError.notFound('Research centre not found');
    }
    if (!dept) {
      throw ApiError.notFound('Department not found');
    }

    for (const step of resolvedSteps) {
      switch (step.role_code) {
        case ROLES.GUIDE: {
          let assignedGuide = null;
          if (guideId) {
            assignedGuide = await Guide.findByPk(guideId);
          } else if (subjectUserId) {
            const scholar = await Scholar.findOne({ where: { user_id: subjectUserId } });
            if (scholar?.guide_id) {
              assignedGuide = await Guide.findByPk(scholar.guide_id);
            }
          }
          if (!assignedGuide) {
            throw ApiError.badRequest(
              `Step "${step.name}" requires an assigned research guide, but none is associated.`,
              'WORKFLOW_NO_ASSIGNEE'
            );
          }
          break;
        }

        case ROLES.CENTRE_HEAD: {
          if (!centre.centre_head_user_id) {
            throw ApiError.badRequest(
              `Step "${step.name}" requires Research Centre Head endorsement, but "${centre.name}" has no assigned Centre Head.`,
              'WORKFLOW_NO_ASSIGNEE'
            );
          }
          break;
        }

        case ROLES.DRC_CONVENOR: {
          if (!dept.drc_convenor_user_id) {
            throw ApiError.badRequest(
              `Step "${step.name}" requires DRC Convenor approval, but "${dept.name}" has no assigned DRC Convenor.`,
              'WORKFLOW_NO_ASSIGNEE'
            );
          }
          break;
        }

        case ROLES.STAFF: {
          // Check if specific staff is assigned to centre, or if any staff user exists
          const assignedCount = await StaffCentre.count({
            where: { research_centre_id: researchCentreId },
          });
          if (assignedCount === 0) {
            const generalStaffCount = await User.count({
              include: [{ model: Role, as: 'roles', where: { code: ROLES.STAFF } }],
              where: { status: USER_STATUS.ACTIVE },
            });
            if (generalStaffCount === 0) {
              throw ApiError.badRequest(
                `Step "${step.name}" requires Section Staff processing, but no active Staff is available.`,
                'WORKFLOW_NO_ASSIGNEE'
              );
            }
          }
          break;
        }

        default:
          break;
      }
    }
  }

  /**
   * Submits an application, resolving the conditional workflow steps and snapshotting them.
   */
  async submit(applicationId, actor) {
    let postNotifications = [];

    const result = await withTx(async (tx) => {
      const application = await Application.findByPk(applicationId, {
        lock: true,
        transaction: tx,
      });

      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      if (application.status !== 'DRAFT' && application.status !== 'RETURNED') {
        throw ApiError.badRequest(
          `Application cannot be submitted while in status ${application.status}`,
          'INVALID_STATUS'
        );
      }

      const centre = await ResearchCentre.findByPk(application.research_centre_id, {
        transaction: tx,
      });
      if (!centre) {
        throw ApiError.notFound('Research centre not found');
      }

      // 1. Resolve conditional steps
      const resolvedSteps = await this.resolveChain(
        application.application_type_id,
        centre.institution_type
      );

      // 2. Validate assignees exist for all steps
      await this.assertAssigneesExist(resolvedSteps, {
        departmentId: application.department_id,
        researchCentreId: application.research_centre_id,
        guideId: application.guide_id,
        subjectUserId: application.subject_user_id,
      });

      // 3. Clear any existing instance steps if re-submitting fresh
      await WorkflowInstanceStep.destroy({
        where: { application_id: application.id },
        transaction: tx,
      });

      // 4. Snapshot instance steps
      const instanceStepsData = resolvedSteps.map((step) => ({
        application_id: application.id,
        step_order: step.step_order,
        name: step.name,
        role_code: step.role_code,
        scope_rule: step.scope_rule,
        allowed_actions: step.allowed_actions,
        is_final: step.is_final,
        sla_days: step.sla_days,
        status: step.step_order === 1 ? 'ACTIVE' : 'WAITING',
      }));

      await WorkflowInstanceStep.bulkInsertOrSave(instanceStepsData, tx);

      const prevStatus = application.status;
      const step1 = resolvedSteps[0];

      // 5. Update application
      application.status = 'IN_PROGRESS';
      application.institution_type = centre.institution_type;
      application.current_step_order = 1;
      application.current_role_code = step1.role_code;
      application.submitted_at = new Date();
      application.version += 1;
      await application.save({ transaction: tx });

      // 6. Record history
      await ApplicationHistory.create(
        {
          application_id: application.id,
          step_order: 1,
          action: 'SUBMIT',
          from_status: prevStatus,
          to_status: 'IN_PROGRESS',
          actor_user_id: actor.id,
          actor_role: actor.activeRole || 'APPLICANT',
          remarks: 'Application submitted for institutional processing.',
        },
        { transaction: tx }
      );

      // Collect eligible approvers for notification
      const approverUserIds = await this.resolveApproverUserIds(step1, application, tx);
      postNotifications = approverUserIds.map((uId) => ({
        userId: uId,
        title: 'New Application Pending Action',
        body: `Application ${application.application_no} awaits your review at step "${step1.name}".`,
        link: `/approvals?applicationId=${application.id}`,
      }));

      return application;
    });

    // Post-commit notifications
    for (const n of postNotifications) {
      await NotificationsService.send({
        recipientUserId: n.userId,
        title: n.title,
        body: n.body,
        link: n.link,
      }).catch(() => {});
    }

    return result;
  }

  /**
   * Finds the user IDs eligible to act on a step.
   */
  async resolveApproverUserIds(step, application, tx = null) {
    const userIds = [];
    const opt = tx ? { transaction: tx } : {};

    if (step.role_code === ROLES.GUIDE) {
      if (application.guide_id) {
        const guide = await Guide.findByPk(application.guide_id, opt);
        if (guide) userIds.push(guide.user_id);
      } else if (application.subject_user_id) {
        const scholar = await Scholar.findOne({ where: { user_id: application.subject_user_id }, ...opt });
        if (scholar?.guide_id) {
          const guide = await Guide.findByPk(scholar.guide_id, opt);
          if (guide) userIds.push(guide.user_id);
        }
      }
    } else if (step.role_code === ROLES.CENTRE_HEAD) {
      const centre = await ResearchCentre.findByPk(application.research_centre_id, opt);
      if (centre?.centre_head_user_id) {
        userIds.push(centre.centre_head_user_id);
      }
    } else if (step.role_code === ROLES.DRC_CONVENOR) {
      const dept = await Department.findByPk(application.department_id, opt);
      if (dept?.drc_convenor_user_id) {
        userIds.push(dept.drc_convenor_user_id);
      }
    } else if (step.role_code === ROLES.STAFF) {
      const staffAssignments = await StaffCentre.findAll({
        where: { research_centre_id: application.research_centre_id },
        ...opt,
      });
      if (staffAssignments.length > 0) {
        staffAssignments.forEach((sa) => userIds.push(sa.user_id));
      } else {
        const allStaff = await User.findAll({
          include: [{ model: Role, as: 'roles', where: { code: ROLES.STAFF } }],
          where: { status: USER_STATUS.ACTIVE },
          ...opt,
        });
        allStaff.forEach((s) => userIds.push(s.id));
      }
    }

    return userIds;
  }

  /**
   * Asserts actor's role and scope eligibility on a specific step.
   */
  async assertActorEligible(actor, step, application, tx = null) {
    const roles = actor.roles || [];
    const roleCodes = roles.map((r) => (typeof r === 'string' ? r : r.code));
    const isAdmin = roleCodes.includes(ROLES.ADMIN);

    if (!isAdmin && !roleCodes.includes(step.role_code)) {
      throw ApiError.forbidden(
        `Role mismatch: step requires ${step.role_code}, but actor holds [${roleCodes.join(', ')}]`,
        'SCOPE_VIOLATION'
      );
    }

    if (isAdmin) {
      return true; // Admin bypass
    }

    const eligibleUserIds = await this.resolveApproverUserIds(step, application, tx);
    if (!eligibleUserIds.includes(actor.id)) {
      throw ApiError.forbidden(
        `Scope violation: user ${actor.id} is not the designated approver for ${step.role_code} at this institution.`,
        'SCOPE_VIOLATION'
      );
    }

    return true;
  }

  /**
   * Executes a workflow step action:
   * SELECT ... FOR UPDATE with deadlock retry via withTx
   */
  async act(applicationId, actor, { action, remarks, attachmentFileIds = [], expectedStep }) {
    let postNotifications = [];
    let hookResult = null;

    const result = await withTx(async (tx) => {
      // 1. Lock application row
      const application = await Application.findByPk(applicationId, {
        lock: true,
        transaction: tx,
      });

      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      if (application.status !== 'IN_PROGRESS') {
        throw ApiError.badRequest(
          `Application is in status ${application.status}; only IN_PROGRESS applications can be acted on.`,
          'WORKFLOW_INVALID_STATE'
        );
      }

      // 2. Lock active snapshot step
      const activeStep = await WorkflowInstanceStep.findOne({
        where: {
          application_id: application.id,
          status: 'ACTIVE',
        },
        lock: true,
        transaction: tx,
      });

      if (!activeStep) {
        throw ApiError.badRequest('No active workflow step found for application', 'WORKFLOW_NO_ACTIVE_STEP');
      }

      // 3. Optimistic / step-mismatch check
      if (
        expectedStep !== undefined &&
        expectedStep !== null &&
        Number(expectedStep) !== application.current_step_order
      ) {
        throw ApiError.conflict(
          `Workflow step mismatch: expected step ${expectedStep}, but current step is ${application.current_step_order}`,
          'WORKFLOW_STEP_MISMATCH'
        );
      }

      // 4. Verify Actor Role & Scope
      await this.assertActorEligible(actor, activeStep, application, tx);

      // 5. Allowed actions check
      const normAction = action.toUpperCase();
      const allowedList = activeStep.allowed_actions
        .split(',')
        .map((a) => a.trim().toUpperCase());

      // Treat FORWARD / VERIFY interchangeably on intermediate steps; on final step behave as APPROVE
      const effectiveAction =
        activeStep.is_final && (normAction === 'FORWARD' || normAction === 'VERIFY')
          ? 'APPROVE'
          : normAction;

      const isActionPermitted =
        allowedList.includes(normAction) ||
        allowedList.includes(effectiveAction) ||
        (activeStep.is_final && (normAction === 'APPROVE' || normAction === 'FORWARD' || normAction === 'VERIFY'));

      if (!isActionPermitted) {
        throw ApiError.badRequest(
          `Action "${normAction}" is not allowed on step "${activeStep.name}". Allowed actions: ${activeStep.allowed_actions}`,
          'ACTION_NOT_ALLOWED'
        );
      }

      // 6. Remarks validation
      if (
        (normAction === 'REJECT' && activeStep.require_remarks_on_reject !== false) ||
        normAction === 'RETURN'
      ) {
        if (!remarks || !remarks.trim() || remarks.trim().length < 5) {
          throw ApiError.badRequest(
            'Remarks are mandatory and must be at least 5 characters for REJECT or RETURN actions.',
            'REMARKS_REQUIRED'
          );
        }
      }

      const prevStatus = application.status;
      let nextStep = null;

      // 7. Transition execution
      if (effectiveAction === 'APPROVE') {
        // Final approval
        activeStep.status = 'DONE';
        activeStep.acted_by = actor.id;
        activeStep.acted_at = new Date();
        await activeStep.save({ transaction: tx });

        application.status = 'APPROVED';
        application.decided_at = new Date();
        application.current_role_code = null;
        application.version += 1;
        await application.save({ transaction: tx });

        // Run onApproved Hook
        const appType = await ApplicationType.findByPk(application.application_type_id, {
          transaction: tx,
        });
        const hook = workflowHooks[appType.code];
        if (hook && hook.onApproved) {
          hookResult = await hook.onApproved(application, tx);
          if (hookResult?.notify) {
            postNotifications.push(...hookResult.notify);
          }
        }
      } else if (normAction === 'VERIFY' || normAction === 'FORWARD') {
        // Advance to next snapshot step
        activeStep.status = 'DONE';
        activeStep.acted_by = actor.id;
        activeStep.acted_at = new Date();
        await activeStep.save({ transaction: tx });

        nextStep = await WorkflowInstanceStep.findOne({
          where: {
            application_id: application.id,
            step_order: activeStep.step_order + 1,
          },
          lock: true,
          transaction: tx,
        });

        if (!nextStep) {
          // If no next step, treat as final approval
          application.status = 'APPROVED';
          application.decided_at = new Date();
          application.current_role_code = null;
        } else {
          nextStep.status = 'ACTIVE';
          await nextStep.save({ transaction: tx });

          application.current_step_order = nextStep.step_order;
          application.current_role_code = nextStep.role_code;
        }

        application.version += 1;
        await application.save({ transaction: tx });

        if (nextStep) {
          const nextApprovers = await this.resolveApproverUserIds(nextStep, application, tx);
          postNotifications.push(
            ...nextApprovers.map((uId) => ({
              userId: uId,
              title: 'Application Forwarded To You',
              body: `Application ${application.application_no} forwarded to your queue at step "${nextStep.name}".`,
              link: `/approvals?applicationId=${application.id}`,
            }))
          );
        }
      } else if (normAction === 'REJECT') {
        activeStep.status = 'DONE';
        activeStep.acted_by = actor.id;
        activeStep.acted_at = new Date();
        await activeStep.save({ transaction: tx });

        application.status = 'REJECTED';
        application.rejection_reason = remarks;
        application.decided_at = new Date();
        application.current_role_code = null;
        application.version += 1;
        await application.save({ transaction: tx });

        const appType = await ApplicationType.findByPk(application.application_type_id, {
          transaction: tx,
        });
        if (appType.kind === 'REGISTRATION') {
          await User.update(
            { status: USER_STATUS.REJECTED },
            { where: { id: application.subject_user_id }, transaction: tx }
          );
        }

        postNotifications.push({
          userId: application.subject_user_id,
          title: 'Application Rejected',
          body: `Your application (${application.application_no}) was rejected at step "${activeStep.name}". Reason: ${remarks}`,
          link: `/registration-status`,
        });
      } else if (normAction === 'RETURN') {
        application.status = 'RETURNED';
        application.rejection_reason = remarks;
        application.version += 1;
        await application.save({ transaction: tx });

        postNotifications.push({
          userId: application.subject_user_id,
          title: 'Application Returned for Changes',
          body: `Your application (${application.application_no}) has been returned with remarks: ${remarks}. Please edit and resubmit.`,
          link: `/registration-status`,
        });
      } else if (normAction === 'REPLY') {
        // Staff reply
        const reply = await OfficialReply.create(
          {
            application_id: application.id,
            by_user_id: actor.id,
            text: remarks || 'Official R&D Cell Reply recorded.',
            visible_to_scholar: true,
          },
          { transaction: tx }
        );

        if (attachmentFileIds && attachmentFileIds.length > 0) {
          for (const fileId of attachmentFileIds) {
            await OfficialReplyFile.create(
              {
                reply_id: reply.id,
                file_id: fileId,
              },
              { transaction: tx }
            );
          }
        }

        postNotifications.push({
          userId: application.subject_user_id,
          title: 'Official Reply Issued',
          body: `An official order/reply has been issued for application ${application.application_no}.`,
          link: `/applications/${application.id}`,
        });
      }

      // 8. Insert history record
      await ApplicationHistory.create(
        {
          application_id: application.id,
          step_order: activeStep.step_order,
          action: normAction,
          from_status: prevStatus,
          to_status: application.status,
          actor_user_id: actor.id,
          actor_role: actor.activeRole || activeStep.role_code,
          remarks: remarks || null,
        },
        { transaction: tx }
      );

      return application;
    });

    // 9. Send notifications outside transaction
    for (const n of postNotifications) {
      await NotificationsService.send({
        recipientUserId: n.userId,
        title: n.title,
        body: n.body,
        link: n.link,
      }).catch(() => {});
    }

    return result;
  }

  /**
   * Resumes an application when returned for changes.
   * Applicant edits form_data and resubmits; snapshot is preserved and resumes at same step.
   */
  async resubmit(applicationId, actor, updatedFormData = null) {
    return withTx(async (tx) => {
      const application = await Application.findByPk(applicationId, {
        lock: true,
        transaction: tx,
      });

      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      if (application.status !== 'RETURNED') {
        throw ApiError.badRequest('Only returned applications can be resubmitted', 'INVALID_STATUS');
      }

      if (application.subject_user_id !== actor.id && !actor.roles?.some((r) => r.code === ROLES.ADMIN)) {
        throw ApiError.forbidden('You are not authorized to resubmit this application', 'FORBIDDEN');
      }

      if (updatedFormData) {
        application.form_data = {
          ...(application.form_data || {}),
          ...updatedFormData,
        };
      }

      const prevStatus = application.status;
      application.status = 'IN_PROGRESS';
      application.rejection_reason = null;
      application.version += 1;
      await application.save({ transaction: tx });

      await ApplicationHistory.create(
        {
          application_id: application.id,
          step_order: application.current_step_order,
          action: 'RESUBMIT',
          from_status: prevStatus,
          to_status: 'IN_PROGRESS',
          actor_user_id: actor.id,
          actor_role: 'APPLICANT',
          remarks: 'Corrections updated and application resubmitted by applicant.',
        },
        { transaction: tx }
      );

      return application;
    });
  }

  /**
   * Reassigns a specific workflow step to a new user (Admin governance only, audited per 05 §7).
   */
  async reassignStep(applicationId, stepOrder, newUserId, adminActor) {
    return withTx(async (tx) => {
      const application = await Application.findByPk(applicationId, { lock: true, transaction: tx });
      if (!application) throw ApiError.notFound('Application not found');

      const step = await WorkflowInstanceStep.findOne({
        where: { application_id: applicationId, step_order: stepOrder },
        lock: true,
        transaction: tx,
      });
      if (!step) throw ApiError.notFound('Workflow step not found');

      const newUser = await User.findByPk(newUserId, { transaction: tx });
      if (!newUser) throw ApiError.notFound('New assignee user not found');

      await ApplicationHistory.create(
        {
          application_id: applicationId,
          step_order: stepOrder,
          action: 'REASSIGN',
          from_status: application.status,
          to_status: application.status,
          actor_user_id: adminActor.id,
          actor_role: ROLES.ADMIN,
          remarks: `Administrator reassigned step ${stepOrder} (${step.name}) to user ${newUser.name} (${newUser.email}).`,
        },
        { transaction: tx }
      );

      return step;
    });
  }

  /**
   * Returns list of allowed actions for the current caller on this application.
   */
  async availableActions(application, actor) {
    if (!application || !actor) return [];

    const isApplicant = application.subject_user_id === actor.id;
    const roles = actor.roles || [];
    const roleCodes = roles.map((r) => (typeof r === 'string' ? r : r.code));
    const isAdmin = roleCodes.includes(ROLES.ADMIN);

    if (application.status === 'DRAFT' && (isApplicant || isAdmin)) {
      return ['SUBMIT'];
    }

    if (application.status === 'RETURNED' && (isApplicant || isAdmin)) {
      return ['RESUBMIT'];
    }

    if (application.status === 'IN_PROGRESS') {
      const activeStep = await WorkflowInstanceStep.findOne({
        where: {
          application_id: application.id,
          status: 'ACTIVE',
        },
      });

      if (!activeStep) return [];

      try {
        await this.assertActorEligible(actor, activeStep, application);
        const actions = activeStep.allowed_actions.split(',').map((a) => a.trim().toUpperCase());
        if (isApplicant) {
          actions.push('CANCEL');
        }
        return actions;
      } catch {
        return isApplicant ? ['CANCEL'] : [];
      }
    }

    return [];
  }
}

// Helper to support bulk insert with safe fallback
WorkflowInstanceStep.bulkInsertOrSave = async function (data, tx) {
  for (const item of data) {
    await WorkflowInstanceStep.create(item, { transaction: tx });
  }
};

export const workflowService = new WorkflowService();
export default workflowService;
