import {
  User,
  Role,
  UserRole,
  Guide,
  Scholar,
  ScholarTimeline,
  ScholarMilestone,
  RacSchedule,
} from '../../../models/index.js';
import { getNextSequence } from '../../../utils/counter.js';
import { ROLES, USER_STATUS } from '../../../config/constants.js';

export const workflowHooks = {
  GUIDE_REGISTRATION: {
    async onApproved(application, tx) {
      // 1. Activate user
      await User.update(
        { status: USER_STATUS.ACTIVE },
        { where: { id: application.subject_user_id }, transaction: tx }
      );

      // 2. Approve guide profile
      await Guide.update(
        {
          registration_status: 'APPROVED',
          approved_at: new Date(),
        },
        { where: { user_id: application.subject_user_id }, transaction: tx }
      );

      // 3. Grant GUIDE role
      const guideRole = await Role.findOne({
        where: { code: ROLES.GUIDE },
        transaction: tx,
      });
      if (guideRole) {
        await UserRole.findOrCreate({
          where: {
            user_id: application.subject_user_id,
            role_id: guideRole.id,
          },
          defaults: {
            user_id: application.subject_user_id,
            role_id: guideRole.id,
          },
          transaction: tx,
        });
      }

      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Research Guide Recognition Approved',
            body: 'Congratulations! Your application for Research Guide recognition has been approved by the University DRC Convenor.',
            link: '/dashboard',
          },
        ],
      };
    },
  },

  SCHOLAR_REGISTRATION: {
    async onApproved(application, tx) {
      // 1. Generate formal registration number
      const registrationNo = await getNextSequence(tx, 'scholar_reg_no', 'KU-PHD', 4);

      // 2. Activate user
      await User.update(
        { status: USER_STATUS.ACTIVE },
        { where: { id: application.subject_user_id }, transaction: tx }
      );

      // 3. Approve scholar record
      await Scholar.update(
        {
          registration_status: 'APPROVED',
          status: 'ACTIVE',
          registration_no: registrationNo,
        },
        { where: { user_id: application.subject_user_id }, transaction: tx }
      );

      const scholar = await Scholar.findOne({
        where: { user_id: application.subject_user_id },
        transaction: tx,
      });

      if (scholar) {
        const today = new Date();
        const due = new Date();
        due.setFullYear(due.getFullYear() + 3);

        await ScholarTimeline.findOrCreate({
          where: { scholar_id: scholar.id },
          defaults: {
            scholar_id: scholar.id,
            date_of_registration: today,
            commencement_date: today,
            submission_due_date: due,
          },
          transaction: tx,
        });
      }

      // 4. Grant SCHOLAR role
      const scholarRole = await Role.findOne({
        where: { code: ROLES.SCHOLAR },
        transaction: tx,
      });
      if (scholarRole) {
        await UserRole.findOrCreate({
          where: {
            user_id: application.subject_user_id,
            role_id: scholarRole.id,
          },
          defaults: {
            user_id: application.subject_user_id,
            role_id: scholarRole.id,
          },
          transaction: tx,
        });
      }

      const notifications = [
        {
          userId: application.subject_user_id,
          title: 'Ph.D. Registration Approved',
          body: `Congratulations! Your Ph.D. registration has been approved. Your registration number is ${registrationNo}.`,
          link: '/dashboard',
        },
      ];

      // Notify assigned guide
      if (application.guide_id) {
        const guide = await Guide.findByPk(application.guide_id, { transaction: tx });
        if (guide) {
          notifications.push({
            userId: guide.user_id,
            title: 'New Scholar Assigned',
            body: `Scholar registration (${registrationNo}) has been confirmed and assigned to your research group.`,
            link: '/dashboard',
          });
        }
      }

      return { notify: notifications };
    },
  },

  TITLE_CHANGE: {
    async onApproved(application, tx) {
      const newTitle = application.form_data?.new_title;
      if (newTitle && application.scholar_id) {
        await Scholar.update(
          { research_title: newTitle },
          { where: { id: application.scholar_id }, transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Ph.D. Title Change Approved',
            body: `Your Ph.D. research title has been updated to "${newTitle}".`,
            link: '/dashboard',
          },
        ],
      };
    },
  },

  GUIDE_CHANGE: {
    async onApproved(application, tx) {
      const newGuideId = application.form_data?.new_guide_id;
      const oldGuideId = application.guide_id;
      if (newGuideId && application.scholar_id) {
        await Scholar.update(
          { guide_id: newGuideId },
          { where: { id: application.scholar_id }, transaction: tx }
        );
      }
      const notifications = [
        {
          userId: application.subject_user_id,
          title: 'Research Guide Transfer Approved',
          body: 'Your application for change of research guide has been approved.',
          link: '/dashboard',
        },
      ];
      if (oldGuideId) {
        const oldG = await Guide.findByPk(oldGuideId, { transaction: tx });
        if (oldG) {
          notifications.push({
            userId: oldG.user_id,
            title: 'Scholar Guide Transfer Effected',
            body: 'A doctoral scholar has been transferred to a new research guide pursuant to university sanction.',
            link: '/dashboard',
          });
        }
      }
      if (newGuideId) {
        const newG = await Guide.findByPk(newGuideId, { transaction: tx });
        if (newG) {
          notifications.push({
            userId: newG.user_id,
            title: 'New Scholar Transferred',
            body: 'A research scholar has been assigned to your guidance pursuant to approved transfer.',
            link: '/dashboard',
          });
        }
      }
      return { notify: notifications };
    },
  },

  CENTRE_CHANGE: {
    async onApproved(application, tx) {
      const newCentreId = application.form_data?.new_centre_id;
      const newDeptId = application.form_data?.new_department_id || application.department_id;
      if (newCentreId && application.scholar_id) {
        await Scholar.update(
          {
            research_centre_id: newCentreId,
            department_id: newDeptId,
          },
          { where: { id: application.scholar_id }, transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Research Centre Transfer Approved',
            body: 'Your research centre transfer has been sanctioned by the R&D Cell.',
            link: '/dashboard',
          },
        ],
      };
    },
  },

  EXTENSION: {
    async onApproved(application, tx) {
      const newDueDate = application.form_data?.new_due_date;
      if (newDueDate && application.scholar_id) {
        await ScholarTimeline.update(
          { submission_due_date: newDueDate },
          { where: { scholar_id: application.scholar_id }, transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Registration Period Extension Sanctioned',
            body: `Your Ph.D. registration extension until ${newDueDate} has been granted.`,
            link: '/dashboard',
          },
        ],
      };
    },
  },

  LEAVE: {
    async onApproved(application, tx) {
      if (application.scholar_id) {
        await ScholarMilestone.create(
          {
            scholar_id: application.scholar_id,
            label: `Approved Leave: ${application.form_data?.leave_type || 'Statutory Leave'}`,
            due_date: application.form_data?.from_date || null,
            completed_at: new Date(),
            notes: application.form_data?.reason || 'Sanctioned by DRC/Staff',
          },
          { transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Leave Application Sanctioned',
            body: 'Your statutory leave request has been endorsed and recorded in your timeline.',
            link: '/dashboard',
          },
        ],
      };
    },
  },

  CONDONATION: {
    async onApproved(application, tx) {
      if (application.scholar_id) {
        await ScholarMilestone.create(
          {
            scholar_id: application.scholar_id,
            label: 'Approved Attendance Condonation',
            completed_at: new Date(),
            notes: application.form_data?.reason || 'Condonation granted by DRC',
          },
          { transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Attendance Condonation Granted',
            body: 'Your condonation request has been processed and officially granted.',
            link: '/dashboard',
          },
        ],
      };
    },
  },

  RAC: {
    async onApproved(application, tx) {
      if (application.scholar_id) {
        await RacSchedule.create(
          {
            scholar_id: application.scholar_id,
            meeting_date: application.form_data?.meeting_date || new Date(),
            venue: application.form_data?.venue || 'Department Conference Hall',
            type: application.form_data?.type || 'RAC Review',
            status: 'DONE',
          },
          { transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'RAC Review Endorsed',
            body: 'The Research Advisory Committee review has been formally recorded.',
            link: '/dashboard',
          },
        ],
      };
    },
  },

  PRE_SUBMISSION: {
    async onApproved(application, tx) {
      if (application.scholar_id) {
        await ScholarTimeline.update(
          { date_of_submission: new Date() },
          { where: { scholar_id: application.scholar_id }, transaction: tx }
        );
      }
      return {
        notify: [
          {
            userId: application.subject_user_id,
            title: 'Pre-Submission Clearance Sanctioned',
            body: 'Your thesis pre-submission presentation and synopsis clearance have been granted.',
            link: '/dashboard',
          },
        ],
      };
    },
  },
};
