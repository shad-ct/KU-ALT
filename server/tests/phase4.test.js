import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import {
  User,
  Guide,
  Scholar,
  Application,
  WorkflowInstanceStep,
  ResearchCentre,
  Department,
} from '../src/models/index.js';
import { INSTITUTION_TYPE, USER_STATUS } from '../src/config/constants.js';

describe('Phase 4: Signup & Registrations Verification', () => {
  let uniCentre, affCentreWithHead, affCentreWithoutHead;

  beforeAll(async () => {
    // Clean up temporary test scholars so guide capacity is pristine
    const tempScholars = await Scholar.findAll({
      where: {
        id: { [Scholar.sequelize.Sequelize.Op.ne]: 1 },
      },
    });
    for (const s of tempScholars) {
      await Application.destroy({ where: { subject_user_id: s.user_id } });
      await s.destroy();
      await User.destroy({ where: { id: s.user_id } });
    }

    uniCentre = await ResearchCentre.findOne({
      where: { code: 'CHEM-UNI', institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT },
    });
    affCentreWithHead = await ResearchCentre.findOne({
      where: { code: 'GCK-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
    });
    affCentreWithoutHead = await ResearchCentre.findOne({
      where: { code: 'SJC-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
    });
  });

  // TEST 1: Guide Signup
  it('1. Guide signup: creates user (PENDING_APPROVAL), guide (PENDING), and submits GUIDE_REGISTRATION application', async () => {
    const email = `new.guide.${Date.now()}@kannur.ac.in`;

    const res = await request(app)
      .post('/api/v1/public/signup/guide')
      .send({
        email,
        password: 'Password123!',
        full_name: 'Dr. New Research Guide',
        phone: '+91 94471 99999',
        research_centre_id: affCentreWithHead.id,
        designation_id: 1,
        qualifications: JSON.stringify([
          { degree: 'Ph.D. in Chemistry', institution: 'IISc Bangalore', year: 2018 },
        ]),
        specializations: JSON.stringify(['Polymer Chemistry']),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.status).toBe(USER_STATUS.PENDING_APPROVAL);
    expect(res.body.data.accessToken).toBeDefined();

    // Verify DB records
    const createdUser = await User.findOne({ where: { email } });
    expect(createdUser).toBeDefined();
    expect(createdUser.status).toBe(USER_STATUS.PENDING_APPROVAL);

    const createdGuide = await Guide.findOne({ where: { user_id: createdUser.id } });
    expect(createdGuide).toBeDefined();
    expect(createdGuide.registration_status).toBe('PENDING');

    const createdApp = await Application.findOne({ where: { subject_user_id: createdUser.id } });
    expect(createdApp).toBeDefined();
    expect(createdApp.status).toBe('IN_PROGRESS');
    expect(createdApp.current_step_order).toBe(1);

    // Because it is an Affiliated College, Step 1 is Centre Head
    expect(createdApp.current_role_code).toBe('CENTRE_HEAD');

    const steps = await WorkflowInstanceStep.findAll({ where: { application_id: createdApp.id } });
    expect(steps.length).toBe(2); // Centre Head -> DRC Convenor
  });

  // TEST 2: Scholar Signup
  it('2. Scholar signup: creates user (PENDING_APPROVAL), scholar (PENDING), and submits SCHOLAR_REGISTRATION application', async () => {
    const email = `new.scholar.${Date.now()}@gmail.com`;

    const res = await request(app)
      .post('/api/v1/public/signup/scholar')
      .send({
        email,
        password: 'Password123!',
        full_name: 'New Doctoral Scholar',
        phone: '+91 98460 11111',
        department_id: uniCentre.department_id,
        research_centre_id: uniCentre.id,
        guide_id: 1, // Demo Guide in CHEM-UNI
        programme_id: 1,
        research_topic: 'Synthesis of Advanced Organic Frameworks',
        research_title: 'Studies on Advanced Organic Frameworks',
        research_area: 'Organic Chemistry',
        dob: '2000-01-01',
        gender: 'FEMALE',
        qualifications: JSON.stringify([
          { degree: 'M.Sc. Chemistry', institution: 'Calicut University', year: 2023, percentage: 84.5 },
        ]),
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.status).toBe(USER_STATUS.PENDING_APPROVAL);

    const createdApp = await Application.findOne({ where: { subject_user_id: res.body.data.user.id } });
    expect(createdApp).toBeDefined();
    expect(createdApp.status).toBe('IN_PROGRESS');
    expect(createdApp.current_step_order).toBe(1);
    expect(createdApp.current_role_code).toBe('GUIDE'); // Step 1 is always Guide
  });

  // TEST 3: Block signup for Affiliated Centre without Head
  it('3. Block signup when affiliated centre has no Centre Head (CENTRE_NOT_ACCEPTING_SIGNUPS)', async () => {
    const email = `blocked.guide.${Date.now()}@kannur.ac.in`;

    const res = await request(app)
      .post('/api/v1/public/signup/guide')
      .send({
        email,
        password: 'Password123!',
        full_name: 'Blocked Guide',
        research_centre_id: affCentreWithoutHead.id,
      })
      .expect(400);

    expect(res.body.code).toBe('CENTRE_NOT_ACCEPTING_SIGNUPS');
  });

  // TEST 4: Guide Capacity Check & Free Slot Deduction
  it('4. Guide Capacity Check: blocks assignment when guide max quota reached', async () => {
    // Create a temporary guide with max_scholars = 1 and 1 active scholar
    const [testGuideUser] = await User.findOrCreate({
      where: { email: 'quota.guide@kannur.ac.in' },
      defaults: {
        full_name: 'Dr. Quota Guide',
        email: 'quota.guide@kannur.ac.in',
        password_hash: 'hash',
        status: USER_STATUS.ACTIVE,
      },
    });

    const [testGuide] = await Guide.findOrCreate({
      where: { user_id: testGuideUser.id },
      defaults: {
        user_id: testGuideUser.id,
        department_id: uniCentre.department_id,
        research_centre_id: uniCentre.id,
        registration_status: 'APPROVED',
        max_scholars: 1,
      },
    });

    // Create 1 active scholar assigned to this guide to saturate capacity
    const [dummyScholarUser] = await User.findOrCreate({
      where: { email: 'dummy.scholar@kannur.ac.in' },
      defaults: {
        full_name: 'Dummy Scholar',
        email: 'dummy.scholar@kannur.ac.in',
        password_hash: 'hash',
        status: USER_STATUS.ACTIVE,
      },
    });

    await Scholar.findOrCreate({
      where: { user_id: dummyScholarUser.id },
      defaults: {
        user_id: dummyScholarUser.id,
        programme_id: 1,
        department_id: uniCentre.department_id,
        research_centre_id: uniCentre.id,
        guide_id: testGuide.id,
        status: 'ACTIVE',
        registration_status: 'APPROVED',
      },
    });

    // Attempt to register a 2nd scholar to this guide -> Should fail with GUIDE_NOT_AVAILABLE
    const res = await request(app)
      .post('/api/v1/public/signup/scholar')
      .send({
        email: `overcapacity.scholar.${Date.now()}@gmail.com`,
        password: 'Password123!',
        full_name: 'Overcapacity Scholar',
        department_id: uniCentre.department_id,
        research_centre_id: uniCentre.id,
        guide_id: testGuide.id,
        programme_id: 1,
        research_topic: 'Testing Quota',
      })
      .expect(400);

    expect(res.body.code).toBe('GUIDE_NOT_AVAILABLE');
  });

  // TEST 5: Registration Status Endpoint
  it('5. Pending applicant can query registration status with own token', async () => {
    // Signup a fresh scholar
    const email = `status.check.${Date.now()}@gmail.com`;
    const signupRes = await request(app)
      .post('/api/v1/public/signup/scholar')
      .send({
        email,
        password: 'Password123!',
        full_name: 'Status Check Scholar',
        department_id: uniCentre.department_id,
        research_centre_id: uniCentre.id,
        guide_id: 1,
        programme_id: 1,
        research_topic: 'Topic for status checking',
      })
      .expect(201);

    const token = signupRes.body.data.accessToken;

    const statusRes = await request(app)
      .get('/api/v1/registration/status')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(statusRes.body.success).toBe(true);
    expect(statusRes.body.data.application).toBeDefined();
    expect(statusRes.body.data.application.status).toBe('IN_PROGRESS');
    expect(statusRes.body.data.currentStep).toBeDefined();
    expect(statusRes.body.data.currentStep.role_code).toBe('GUIDE');
  });

  // TEST 6: Resubmission when RETURNED
  it('6. Resubmit registration when RETURNED resumes in-progress workflow', async () => {
    const email = `resubmit.scholar.${Date.now()}@gmail.com`;
    const signupRes = await request(app)
      .post('/api/v1/public/signup/scholar')
      .send({
        email,
        password: 'Password123!',
        full_name: 'Resubmit Scholar',
        department_id: uniCentre.department_id,
        research_centre_id: uniCentre.id,
        guide_id: 1,
        programme_id: 1,
        research_topic: 'Original Topic Draft',
      })
      .expect(201);

    const token = signupRes.body.data.accessToken;
    const appId = signupRes.body.data.applicationId;

    // Simulate Guide returning the application with remarks
    await Application.update(
      { status: 'RETURNED', rejection_reason: 'Please revise proposed research topic.' },
      { where: { id: appId } }
    );

    // Call resubmit endpoint
    const resubmitRes = await request(app)
      .patch('/api/v1/registration/resubmit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        research_topic: 'Revised and Refined Research Topic',
      })
      .expect(200);

    expect(resubmitRes.body.success).toBe(true);
    expect(resubmitRes.body.data.status).toBe('IN_PROGRESS');

    const updatedApp = await Application.findByPk(appId);
    expect(updatedApp.status).toBe('IN_PROGRESS');
    expect(updatedApp.form_data.research_topic).toBe('Revised and Refined Research Topic');
  });
});

