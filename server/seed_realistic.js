import {
  Application,
  ApplicationHistory,
  WorkflowInstanceStep,
  RacSchedule,
  Scholar,
  User,
  Department,
  ResearchCentre,
  Guide,
} from './src/models/index.js';

async function seedRealisticData() {
  console.log('Seeding realistic university records...');

  const scholar = await Scholar.findByPk(1);
  if (!scholar) {
    console.error('Scholar 1 not found!');
    process.exit(1);
  }

  // 1. Clean out existing test applications & related steps/history
  await WorkflowInstanceStep.destroy({ where: {} });
  await ApplicationHistory.destroy({ where: {} });
  await Application.destroy({ where: {} });
  console.log('Cleared test applications.');

  // 2. Clear out existing RAC schedules
  await RacSchedule.destroy({ where: {} });
  console.log('Cleared test RAC schedules.');

  // 3. Seed realistic RAC schedules with varied dates (6-month cadence)
  const racs = [
    {
      scholar_id: 1,
      meeting_date: new Date('2025-06-18T10:00:00Z'),
      venue: 'Department Seminar Complex Hall A',
      type: 'Half-Yearly Review',
      status: 'DONE',
    },
    {
      scholar_id: 1,
      meeting_date: new Date('2025-12-15T11:00:00Z'),
      venue: 'Central Library Conference Room',
      type: 'Half-Yearly Review',
      status: 'DONE',
    },
    {
      scholar_id: 1,
      meeting_date: new Date('2026-06-20T10:30:00Z'),
      venue: 'Dean Office Committee Room',
      type: 'Coursework Evaluation',
      status: 'DONE',
    },
    {
      scholar_id: 1,
      meeting_date: new Date('2026-12-15T10:00:00Z'),
      venue: 'Department Seminar Complex Hall A',
      type: 'Half-Yearly Review',
      status: 'SCHEDULED',
    },
    {
      scholar_id: 1,
      meeting_date: new Date('2027-06-18T14:00:00Z'),
      venue: 'Auditorium Presentation Room 2',
      type: 'Synopsis Defense',
      status: 'SCHEDULED',
    },
  ];

  for (const rac of racs) {
    await RacSchedule.create(rac);
  }
  console.log('Seeded 5 realistic RAC meetings.');

  // 4. Seed realistic Applications (7-8 records, clean dates, varied statuses)
  const applications = [
    {
      application_no: 'KU-RDC/2026/TC/00142',
      application_type_id: 4, // Title Change
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        proposed_title: 'Stereoselective Synthesis of Heterocycles in Aqueous Phase',
        justification: 'Broadened scope based on initial RAC recommendations in meeting 2.',
      },
      status: 'IN_PROGRESS',
      current_step_order: 1,
      current_role_code: 'GUIDE',
      submitted_at: new Date('2026-11-04T09:30:00Z'),
      created_at: new Date('2026-11-04T09:30:00Z'),
      updated_at: new Date('2026-11-04T09:30:00Z'),
    },
    {
      application_no: 'KU-RDC/2026/EXT/00089',
      application_type_id: 8, // Extension
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        extension_period: '12 Months',
        reason: 'Synthesis purification protocols require additional laboratory characterization.',
      },
      status: 'APPROVED',
      current_step_order: 3,
      current_role_code: 'DRC_CONVENOR',
      submitted_at: new Date('2026-10-10T11:00:00Z'),
      decided_at: new Date('2026-10-24T14:30:00Z'),
      created_at: new Date('2026-10-10T11:00:00Z'),
      updated_at: new Date('2026-10-24T14:30:00Z'),
    },
    {
      application_no: 'KU-RDC/2026/RAC/00201',
      application_type_id: 3, // RAC Review
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        review_term: 'Term 3 Review',
        presentation_date: '2026-06-20',
      },
      status: 'APPROVED',
      current_step_order: 2,
      current_role_code: 'DRC_CONVENOR',
      submitted_at: new Date('2026-06-12T10:00:00Z'),
      decided_at: new Date('2026-06-25T16:00:00Z'),
      created_at: new Date('2026-06-12T10:00:00Z'),
      updated_at: new Date('2026-06-25T16:00:00Z'),
    },
    {
      application_no: 'KU-RDC/2026/LV/00055',
      application_type_id: 7, // Leave
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        leave_type: 'Duty Leave for National Conference',
        start_date: '2026-08-10',
        end_date: '2026-08-16',
      },
      status: 'APPROVED',
      current_step_order: 2,
      current_role_code: 'CENTRE_HEAD',
      submitted_at: new Date('2026-08-01T08:30:00Z'),
      decided_at: new Date('2026-08-05T12:00:00Z'),
      created_at: new Date('2026-08-01T08:30:00Z'),
      updated_at: new Date('2026-08-05T12:00:00Z'),
    },
    {
      application_no: 'KU-RDC/2026/GC/00031',
      application_type_id: 6, // Guide Change
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        reason: 'Proposed co-guide addition for specialized crystallography instrumentation.',
      },
      status: 'RETURNED',
      current_step_order: 1,
      current_role_code: 'GUIDE',
      rejection_reason: 'Please attach NOC from the existing department head and CV of proposed co-guide.',
      submitted_at: new Date('2026-07-20T10:15:00Z'),
      decided_at: new Date('2026-07-28T15:20:00Z'),
      created_at: new Date('2026-07-20T10:15:00Z'),
      updated_at: new Date('2026-07-28T15:20:00Z'),
    },
    {
      application_no: 'KU-RDC/2026/CND/00018',
      application_type_id: 9, // Condonation
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        shortage_percentage: '4%',
        reason: 'Medical hospitalization during field study period.',
      },
      status: 'APPROVED',
      current_step_order: 2,
      current_role_code: 'DRC_CONVENOR',
      submitted_at: new Date('2026-05-10T09:00:00Z'),
      decided_at: new Date('2026-05-18T14:00:00Z'),
      created_at: new Date('2026-05-10T09:00:00Z'),
      updated_at: new Date('2026-05-18T14:00:00Z'),
    },
    {
      application_no: 'KU-RDC/2026/PS/00009',
      application_type_id: 10, // Pre-submission
      scholar_id: 1,
      guide_id: scholar.guide_id,
      subject_user_id: scholar.user_id,
      department_id: scholar.department_id,
      research_centre_id: scholar.research_centre_id,
      institution_type: 'AFFILIATED_COLLEGE',
      form_data: {
        synopsis_draft_title: 'Stereoselective Synthesis of Heterocycles in Aqueous Phase',
      },
      status: 'DRAFT',
      current_step_order: 1,
      current_role_code: 'SCHOLAR',
      created_at: new Date('2026-11-06T11:45:00Z'),
      updated_at: new Date('2026-11-06T11:45:00Z'),
    },
  ];

  for (const appData of applications) {
    const createdApp = await Application.create(appData);

    // Create workflow instance steps
    await WorkflowInstanceStep.create({
      application_id: createdApp.id,
      step_order: 1,
      role_code: 'GUIDE',
      name: 'Guide Endorsement',
      allowed_actions: 'FORWARD,REJECT,RETURN',
      status: appData.status === 'APPROVED' ? 'DONE' : appData.status === 'IN_PROGRESS' ? 'ACTIVE' : 'WAITING',
      acted_at: appData.status === 'APPROVED' ? appData.updated_at : null,
    });

    await WorkflowInstanceStep.create({
      application_id: createdApp.id,
      step_order: 2,
      role_code: 'CENTRE_HEAD',
      name: 'Centre Head Verification',
      allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
      status: appData.status === 'APPROVED' ? 'DONE' : 'WAITING',
      acted_at: appData.status === 'APPROVED' ? appData.updated_at : null,
    });

    await WorkflowInstanceStep.create({
      application_id: createdApp.id,
      step_order: 3,
      role_code: 'DRC_CONVENOR',
      name: 'DRC Convenor Approval',
      allowed_actions: 'APPROVE,REJECT,RETURN',
      status: appData.status === 'APPROVED' ? 'DONE' : 'WAITING',
      acted_at: appData.status === 'APPROVED' ? appData.updated_at : null,
    });

    // Create history
    await ApplicationHistory.create({
      application_id: createdApp.id,
      step_order: 1,
      action: appData.status === 'APPROVED' ? 'APPROVE' : appData.status === 'RETURNED' ? 'RETURN' : 'SUBMIT',
      from_status: 'DRAFT',
      to_status: appData.status,
      actor_user_id: scholar.user_id,
      actor_role: 'SCHOLAR',
      remarks: appData.status === 'RETURNED' ? appData.rejection_reason : 'Initial submission to portal.',
      at: appData.updated_at,
      created_at: appData.created_at,
      updated_at: appData.updated_at,
    });
  }

  console.log(`Successfully seeded ${applications.length} realistic applications!`);
  process.exit(0);
}

seedRealisticData().catch((err) => {
  console.error(err);
  process.exit(1);
});
