import { INSTITUTION_TYPE } from '../src/config/constants.js';

export const up = async (queryInterface) => {
  const now = new Date();

  // 1. Seed 3 Departments
  const departmentsData = [
    { id: 1, name: 'Department of Chemistry', code: 'CHEM', drc_convenor_user_id: 4, is_active: true, created_at: now, updated_at: now },
    { id: 2, name: 'Department of Physics', code: 'PHYS', drc_convenor_user_id: 4, is_active: true, created_at: now, updated_at: now },
    { id: 3, name: 'Department of History', code: 'HIST', drc_convenor_user_id: 4, is_active: true, created_at: now, updated_at: now },
  ];

  await queryInterface.bulkInsert('departments', departmentsData);

  // 2. Seed Research Centres (per department: 1 university-department centre + 1-2 affiliated colleges)
  const centresData = [
    // Chemistry
    {
      id: 1,
      name: 'Centre for Chemical Sciences (University Campus)',
      code: 'CHEM-UNI',
      department_id: 1,
      institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT,
      centre_head_user_id: null,
      college_name: 'Kannur University Campus',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      name: 'Govt. College Kasaragod (Chemistry Research Centre)',
      code: 'GCK-CHEM',
      department_id: 1,
      institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE,
      centre_head_user_id: 3, // Dr. S. Nambiar
      college_name: 'Govt. College Kasaragod',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      name: "St. Joseph's College Pilathara (Chemistry Centre - Vacant Head)",
      code: 'SJC-CHEM',
      department_id: 1,
      institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE,
      centre_head_user_id: null, // Intentionally null to test signup-blocking rule
      college_name: "St. Joseph's College Pilathara",
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    // Physics
    {
      id: 4,
      name: 'Department of Physics (University Campus)',
      code: 'PHYS-UNI',
      department_id: 2,
      institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT,
      centre_head_user_id: null,
      college_name: 'Kannur University Campus',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 5,
      name: 'Payyanur College (Physics Research Centre)',
      code: 'PAY-PHYS',
      department_id: 2,
      institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE,
      centre_head_user_id: 3,
      college_name: 'Payyanur College',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    // History
    {
      id: 6,
      name: 'Department of History (University Campus)',
      code: 'HIST-UNI',
      department_id: 3,
      institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT,
      centre_head_user_id: null,
      college_name: 'Kannur University Campus',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 7,
      name: 'Nehru Arts & Science College Kanhangad (History Centre)',
      code: 'NAS-HIST',
      department_id: 3,
      institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE,
      centre_head_user_id: 3,
      college_name: 'Nehru Arts & Science College',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ];

  await queryInterface.bulkInsert('research_centres', centresData);

  // 3. Programmes
  const programmesData = [
    { id: 1, name: 'Ph.D. in Chemistry', code: 'PHD-CHEM', duration_years: 3, is_active: true, created_at: now, updated_at: now },
    { id: 2, name: 'Ph.D. in Physics', code: 'PHD-PHYS', duration_years: 3, is_active: true, created_at: now, updated_at: now },
    { id: 3, name: 'Ph.D. in History', code: 'PHD-HIST', duration_years: 3, is_active: true, created_at: now, updated_at: now },
  ];
  await queryInterface.bulkInsert('research_programmes', programmesData);

  // 4. Academic Years
  const yearsData = [
    { id: 1, label: '2026-27', start_date: '2026-06-01', end_date: '2027-05-31', is_current: true, created_at: now, updated_at: now },
    { id: 2, label: '2025-26', start_date: '2025-06-01', end_date: '2026-05-31', is_current: false, created_at: now, updated_at: now },
  ];
  await queryInterface.bulkInsert('academic_years', yearsData);

  // 5. Designations
  const designationsData = [
    { id: 1, name: 'Assistant Professor', created_at: now, updated_at: now },
    { id: 2, name: 'Associate Professor', created_at: now, updated_at: now },
    { id: 3, name: 'Professor', created_at: now, updated_at: now },
  ];
  await queryInterface.bulkInsert('designations', designationsData);

  // 6. Application Types
  const applicationTypesData = [
    { id: 1, code: 'SCHOLAR_REGISTRATION', name: 'Scholar Registration', kind: 'REGISTRATION', is_active: true, created_at: now, updated_at: now },
    { id: 2, code: 'GUIDE_REGISTRATION', name: 'Guide Registration / Guideship Application', kind: 'REGISTRATION', is_active: true, created_at: now, updated_at: now },
    { id: 3, code: 'RAC', name: 'RAC / Three-Member Committee Review', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 4, code: 'TITLE_CHANGE', name: 'Ph.D. Title Change', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 5, code: 'CENTRE_CHANGE', name: 'Research Centre Transfer', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 6, code: 'GUIDE_CHANGE', name: 'Research Guide Transfer', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 7, code: 'LEAVE', name: 'Scholar Leave Application', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 8, code: 'EXTENSION', name: 'Registration Period Extension', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 9, code: 'CONDONATION', name: 'Attendance Condonation', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
    { id: 10, code: 'PRE_SUBMISSION', name: 'Pre-Submission & Thesis Clearance', kind: 'SERVICE', is_active: true, created_at: now, updated_at: now },
  ];
  await queryInterface.bulkInsert('application_types', applicationTypesData);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('application_types', null, {});
  await queryInterface.bulkDelete('designations', null, {});
  await queryInterface.bulkDelete('academic_years', null, {});
  await queryInterface.bulkDelete('research_programmes', null, {});
  await queryInterface.bulkDelete('research_centres', null, {});
  await queryInterface.bulkDelete('departments', null, {});
};

