export const up = async (queryInterface) => {
  const now = new Date();

  // 1. Seed Workflow Definitions
  const workflowDefinitionsData = [
    { id: 1, code: 'SCHOLAR_REGISTRATION', name: 'Ph.D. Scholar Registration Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 2, code: 'GUIDE_REGISTRATION', name: 'Research Guide Recognition Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 3, code: 'RAC', name: 'RAC / Advisory Review Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 4, code: 'TITLE_CHANGE', name: 'Ph.D. Title Change Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 5, code: 'CENTRE_CHANGE', name: 'Research Centre Transfer Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 6, code: 'GUIDE_CHANGE', name: 'Research Guide Transfer Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 7, code: 'LEAVE', name: 'Scholar Statutory Leave Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 8, code: 'EXTENSION', name: 'Tenure Extension Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 9, code: 'CONDONATION', name: 'Attendance Condonation Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
    { id: 10, code: 'PRE_SUBMISSION', name: 'Pre-Submission & Synopsis Clearance Workflow', version: 1, is_active: true, created_at: now, updated_at: now },
  ];

  await queryInterface.bulkInsert('workflow_definitions', workflowDefinitionsData);

  // 2. Seed Workflow Steps per 05 §2
  const stepsData = [];

  // GUIDE_REGISTRATION:
  // Step 1: Centre Head [AC]
  // Step 2: DRC Convenor (final)
  stepsData.push(
    {
      definition_id: 2,
      step_order: 1,
      name: 'Research Centre Head Verification',
      role_code: 'CENTRE_HEAD',
      institution_type: 'AFFILIATED_COLLEGE',
      scope_rule: 'SAME_CENTRE',
      allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
      require_remarks_on_reject: true,
      sla_days: 7,
      is_final: false,
      created_at: now,
      updated_at: now,
    },
    {
      definition_id: 2,
      step_order: 2,
      name: 'DRC Convenor Endorsement & Approval',
      role_code: 'DRC_CONVENOR',
      institution_type: 'ANY',
      scope_rule: 'SAME_DEPARTMENT',
      allowed_actions: 'APPROVE,REJECT,RETURN',
      require_remarks_on_reject: true,
      sla_days: 7,
      is_final: true,
      created_at: now,
      updated_at: now,
    }
  );

  // SCHOLAR_REGISTRATION:
  // Step 1: Guide
  // Step 2: Centre Head [AC]
  // Step 3: DRC Convenor (final)
  stepsData.push(
    {
      definition_id: 1,
      step_order: 1,
      name: 'Research Guide Verification',
      role_code: 'GUIDE',
      institution_type: 'ANY',
      scope_rule: 'ASSIGNED_GUIDE',
      allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
      require_remarks_on_reject: true,
      sla_days: 7,
      is_final: false,
      created_at: now,
      updated_at: now,
    },
    {
      definition_id: 1,
      step_order: 2,
      name: 'Research Centre Head Verification',
      role_code: 'CENTRE_HEAD',
      institution_type: 'AFFILIATED_COLLEGE',
      scope_rule: 'SAME_CENTRE',
      allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
      require_remarks_on_reject: true,
      sla_days: 7,
      is_final: false,
      created_at: now,
      updated_at: now,
    },
    {
      definition_id: 1,
      step_order: 3,
      name: 'DRC Convenor Final Approval',
      role_code: 'DRC_CONVENOR',
      institution_type: 'ANY',
      scope_rule: 'SAME_DEPARTMENT',
      allowed_actions: 'APPROVE,REJECT,RETURN',
      require_remarks_on_reject: true,
      sla_days: 7,
      is_final: true,
      created_at: now,
      updated_at: now,
    }
  );

  // Service applications (IDs 3 to 10):
  // Step 1: Guide
  // Step 2: Centre Head [AC]
  // Step 3: DRC Convenor
  // Step 4: Staff (final)
  for (let defId = 3; defId <= 10; defId++) {
    stepsData.push(
      {
        definition_id: defId,
        step_order: 1,
        name: 'Research Guide Verification',
        role_code: 'GUIDE',
        institution_type: 'ANY',
        scope_rule: 'ASSIGNED_GUIDE',
        allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
        require_remarks_on_reject: true,
        sla_days: 7,
        is_final: false,
        created_at: now,
        updated_at: now,
      },
      {
        definition_id: defId,
        step_order: 2,
        name: 'Research Centre Head Verification',
        role_code: 'CENTRE_HEAD',
        institution_type: 'AFFILIATED_COLLEGE',
        scope_rule: 'SAME_CENTRE',
        allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
        require_remarks_on_reject: true,
        sla_days: 7,
        is_final: false,
        created_at: now,
        updated_at: now,
      },
      {
        definition_id: defId,
        step_order: 3,
        name: 'DRC Convenor Scrutiny',
        role_code: 'DRC_CONVENOR',
        institution_type: 'ANY',
        scope_rule: 'SAME_DEPARTMENT',
        allowed_actions: 'VERIFY,FORWARD,REJECT,RETURN',
        require_remarks_on_reject: true,
        sla_days: 7,
        is_final: false,
        created_at: now,
        updated_at: now,
      },
      {
        definition_id: defId,
        step_order: 4,
        name: 'Section Staff Processing & Decision',
        role_code: 'STAFF',
        institution_type: 'ANY',
        scope_rule: 'SAME_CENTRE',
        allowed_actions: 'APPROVE,REJECT,RETURN,REPLY',
        require_remarks_on_reject: true,
        sla_days: 7,
        is_final: true,
        created_at: now,
        updated_at: now,
      }
    );
  }

  await queryInterface.bulkInsert('workflow_steps', stepsData);

  // 3. Link workflow definitions to application_types
  for (let id = 1; id <= 10; id++) {
    await queryInterface.sequelize.query(
      'UPDATE application_types SET workflow_definition_id = ? WHERE id = ?',
      { replacements: [id, id] }
    );
  }

  // 4. Seed Demo Guide & Scholar Profiles
  // User 2: Guide (guide@kannur.ac.in)
  await queryInterface.bulkInsert('guides', [
    {
      id: 1,
      user_id: 2,
      designation_id: 1,
      department_id: 1,
      research_centre_id: 1,
      registration_status: 'APPROVED',
      approved_at: now,
      max_scholars: 8,
      phone_alt: '+91 94471 23456',
      bio: 'Professor of Organic Chemistry with 15+ years of doctoral research guidance experience.',
      created_at: now,
      updated_at: now,
    },
  ]);

  await queryInterface.bulkInsert('guide_specializations', [
    { id: 1, guide_id: 1, area: 'Organic Synthesis', created_at: now, updated_at: now },
    { id: 2, guide_id: 1, area: 'Phytochemistry', created_at: now, updated_at: now },
  ]);

  // User 1: Scholar (scholar@kannur.ac.in)
  await queryInterface.bulkInsert('scholars', [
    {
      id: 1,
      user_id: 1,
      registration_no: 'KU-PHD-2026-0001',
      programme_id: 1,
      department_id: 1,
      research_centre_id: 1,
      guide_id: 1,
      research_topic: 'Synthesis and Characterization of Novel Heterocyclic Compounds',
      research_title: 'Studies on Bioactive Heterocycles Derived from Natural Precursors',
      research_area: 'Organic Chemistry',
      dob: '1998-05-15',
      gender: 'MALE',
      address: 'Kannur University Campus, Mangattuparamba, Kerala 670567',
      status: 'ACTIVE',
      registration_status: 'APPROVED',
      created_at: now,
      updated_at: now,
    },
  ]);

  await queryInterface.bulkInsert('scholar_timeline', [
    {
      id: 1,
      scholar_id: 1,
      date_of_registration: '2026-01-15',
      commencement_date: '2026-01-15',
      submission_due_date: '2029-01-14',
      date_of_submission: null,
      created_at: now,
      updated_at: now,
    },
  ]);

  // User 5: Staff (staff@kannur.ac.in) assigned to centres 1, 2, 3
  await queryInterface.bulkInsert('staff_centres', [
    { user_id: 5, research_centre_id: 1, created_at: now, updated_at: now },
    { user_id: 5, research_centre_id: 2, created_at: now, updated_at: now },
    { user_id: 5, research_centre_id: 3, created_at: now, updated_at: now },
  ]);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('staff_centres', null, {});
  await queryInterface.bulkDelete('scholar_timeline', null, {});
  await queryInterface.bulkDelete('scholars', null, {});
  await queryInterface.bulkDelete('guide_specializations', null, {});
  await queryInterface.bulkDelete('guides', null, {});
  await queryInterface.bulkDelete('workflow_steps', null, {});
  await queryInterface.bulkDelete('workflow_definitions', null, {});
};

