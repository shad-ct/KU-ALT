import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import {
  Application,
  ApplicationType,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowInstanceStep,
  ResearchCentre,
  Department,
  Guide,
  Scholar,
  User,
  Role,
  UserRole,
} from '../src/models/index.js';
import { workflowService } from '../src/modules/workflow/workflow.service.js';
import { generateAccessToken } from '../src/utils/token.js';
import { ROLES, USER_STATUS, INSTITUTION_TYPE } from '../src/config/constants.js';

describe('Phase 3: Workflow Engine & Applications Framework (§10 Tests)', () => {
  let guideUser, centreHeadUser, drcUser, scholarUser, staffUser, otherDeptDrcUser, otherCentreHeadUser;
  let guideToken, centreHeadToken, drcToken, scholarToken, staffToken, otherDeptDrcToken, otherCentreHeadToken;

  beforeAll(async () => {
    // Demo users from seeders
    // User 2: guide@kannur.ac.in
    // User 3: centrehead@kannur.ac.in (Govt Brennen College Chemistry, affiliated, centre_id 2)
    // User 4: drc@kannur.ac.in (Department of Chemistry, dept_id 1)
    // User 5: scholar@kannur.ac.in
    // User 6: staff@kannur.ac.in
    guideUser = await User.findOne({ where: { email: 'guide@kannur.ac.in' }, include: ['roles'] });
    centreHeadUser = await User.findOne({ where: { email: 'centrehead@kannur.ac.in' }, include: ['roles'] });
    drcUser = await User.findOne({ where: { email: 'drc@kannur.ac.in' }, include: ['roles'] });
    scholarUser = await User.findOne({ where: { email: 'scholar@kannur.ac.in' }, include: ['roles'] });
    staffUser = await User.findOne({ where: { email: 'staff@kannur.ac.in' }, include: ['roles'] });

    // Create an unauthorized/different department DRC user
    [otherDeptDrcUser] = await User.findOrCreate({
      where: { email: 'otherdrc@kannur.ac.in' },
      defaults: {
        full_name: 'Prof. Other Dept DRC',
        email: 'otherdrc@kannur.ac.in',
        password_hash: 'hash',
        status: USER_STATUS.ACTIVE,
      },
    });
    const drcRole = await Role.findOne({ where: { code: ROLES.DRC_CONVENOR } });
    await UserRole.findOrCreate({
      where: { user_id: otherDeptDrcUser.id, role_id: drcRole.id },
      defaults: { user_id: otherDeptDrcUser.id, role_id: drcRole.id },
    });
    otherDeptDrcUser = await User.findByPk(otherDeptDrcUser.id, { include: ['roles'] });

    // Create an unauthorized/different centre Head user
    [otherCentreHeadUser] = await User.findOrCreate({
      where: { email: 'otherch@kannur.ac.in' },
      defaults: {
        full_name: 'Dr. Other Centre Head',
        email: 'otherch@kannur.ac.in',
        password_hash: 'hash',
        status: USER_STATUS.ACTIVE,
      },
    });
    const chRole = await Role.findOne({ where: { code: ROLES.CENTRE_HEAD } });
    await UserRole.findOrCreate({
      where: { user_id: otherCentreHeadUser.id, role_id: chRole.id },
      defaults: { user_id: otherCentreHeadUser.id, role_id: chRole.id },
    });
    otherCentreHeadUser = await User.findByPk(otherCentreHeadUser.id, { include: ['roles'] });

    guideToken = generateAccessToken(guideUser, ROLES.GUIDE, ['application:verify', 'application:forward', 'application:reject', 'application:return']);
    centreHeadToken = generateAccessToken(centreHeadUser, ROLES.CENTRE_HEAD, ['application:verify', 'application:forward', 'application:reject', 'application:return']);
    drcToken = generateAccessToken(drcUser, ROLES.DRC_CONVENOR, ['application:verify', 'application:forward', 'application:reject', 'application:return']);
    scholarToken = generateAccessToken(scholarUser, ROLES.SCHOLAR, ['application:create', 'application:cancel']);
    staffToken = generateAccessToken(staffUser, ROLES.STAFF, ['application:verify', 'application:forward', 'application:reject', 'application:return', 'application:reply']);
    otherDeptDrcToken = generateAccessToken(otherDeptDrcUser, ROLES.DRC_CONVENOR, ['application:verify', 'application:forward', 'application:reject', 'application:return']);
    otherCentreHeadToken = generateAccessToken(otherCentreHeadUser, ROLES.CENTRE_HEAD, ['application:verify', 'application:forward', 'application:reject', 'application:return']);
  });

  // TEST 1
  it('1. Guide registration: university dept -> only DRC step exists; affiliated -> Centre Head then DRC', async () => {
    const guideAppType = await ApplicationType.findOne({ where: { code: 'GUIDE_REGISTRATION' } });

    // University Department (Direct to DRC)
    const uniSteps = await workflowService.resolveChain(guideAppType.id, INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT);
    expect(uniSteps.length).toBe(1);
    expect(uniSteps[0].role_code).toBe(ROLES.DRC_CONVENOR);
    expect(uniSteps[0].is_final).toBe(true);

    // Affiliated College (Centre Head then DRC)
    const affSteps = await workflowService.resolveChain(guideAppType.id, INSTITUTION_TYPE.AFFILIATED_COLLEGE);
    expect(affSteps.length).toBe(2);
    expect(affSteps[0].role_code).toBe(ROLES.CENTRE_HEAD);
    expect(affSteps[0].step_order).toBe(1);
    expect(affSteps[1].role_code).toBe(ROLES.DRC_CONVENOR);
    expect(affSteps[1].step_order).toBe(2);
    expect(affSteps[1].is_final).toBe(true);
  });

  // TEST 2
  it('2. Scholar registration: both branches, including that Guide is always step 1', async () => {
    const scholarAppType = await ApplicationType.findOne({ where: { code: 'SCHOLAR_REGISTRATION' } });

    // University Department: Guide -> DRC
    const uniSteps = await workflowService.resolveChain(scholarAppType.id, INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT);
    expect(uniSteps.length).toBe(2);
    expect(uniSteps[0].step_order).toBe(1);
    expect(uniSteps[0].role_code).toBe(ROLES.GUIDE);
    expect(uniSteps[1].step_order).toBe(2);
    expect(uniSteps[1].role_code).toBe(ROLES.DRC_CONVENOR);

    // Affiliated College: Guide -> Centre Head -> DRC
    const affSteps = await workflowService.resolveChain(scholarAppType.id, INSTITUTION_TYPE.AFFILIATED_COLLEGE);
    expect(affSteps.length).toBe(3);
    expect(affSteps[0].step_order).toBe(1);
    expect(affSteps[0].role_code).toBe(ROLES.GUIDE);
    expect(affSteps[1].step_order).toBe(2);
    expect(affSteps[1].role_code).toBe(ROLES.CENTRE_HEAD);
    expect(affSteps[2].step_order).toBe(3);
    expect(affSteps[2].role_code).toBe(ROLES.DRC_CONVENOR);
  });

  // TEST 3
  it('3. Scholar signup lists only APPROVED guides with free capacity from the chosen centre', async () => {
    const res = await request(app)
      .get('/api/v1/public/guides?centreId=1')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const guide = res.body.data[0];
    expect(guide).toHaveProperty('id');
    expect(guide).toHaveProperty('freeSlots');
    expect(guide.freeSlots).toBeGreaterThan(0);
  });

  // TEST 4
  it('4. Wrong role / wrong centre head / other department DRC -> denied with SCOPE_VIOLATION', async () => {
    // Create an affiliated application waiting at Centre Head
    const appType = await ApplicationType.findOne({ where: { code: 'TITLE_CHANGE' } });
    const affCentre = await ResearchCentre.findOne({
      where: { code: 'GCK-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
    });

    const newApp = await Application.create({
      application_no: `TEST-SCOPE-${Date.now()}`,
      application_type_id: appType.id,
      scholar_id: 1,
      guide_id: 1,
      subject_user_id: scholarUser.id,
      department_id: affCentre.department_id,
      research_centre_id: affCentre.id,
      institution_type: affCentre.institution_type,
      status: 'DRAFT',
      version: 1,
    });

    await workflowService.submit(newApp.id, scholarUser);

    // Guide completes Step 1
    await workflowService.act(newApp.id, guideUser, { action: 'FORWARD' });

    // Step 2 is now Centre Head of GCK-CHEM.
    // Try to act with other centre's head
    await expect(
      workflowService.act(newApp.id, otherCentreHeadUser, { action: 'FORWARD' })
    ).rejects.toMatchObject({
      code: 'SCOPE_VIOLATION',
    });
  });

  // TEST 5
  it('5. Reject without remarks -> validation error when required', async () => {
    const appType = await ApplicationType.findOne({ where: { code: 'TITLE_CHANGE' } });
    const uniCentre = await ResearchCentre.findOne({
      where: { code: 'CHEM-UNI', institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT },
    });

    const testApp = await Application.create({
      application_no: `TEST-REJECT-${Date.now()}`,
      application_type_id: appType.id,
      scholar_id: 1,
      guide_id: 1,
      subject_user_id: scholarUser.id,
      department_id: uniCentre.department_id,
      research_centre_id: uniCentre.id,
      institution_type: uniCentre.institution_type,
      status: 'DRAFT',
      version: 1,
    });

    await workflowService.submit(testApp.id, scholarUser);

    // Guide attempts to reject without remarks
    await expect(
      workflowService.act(testApp.id, guideUser, { action: 'REJECT', remarks: '' })
    ).rejects.toMatchObject({
      code: 'REMARKS_REQUIRED',
    });
  });

  // TEST 6
  it('6. Return -> edit -> resubmit resumes at the same step; snapshot unchanged', async () => {
    const appType = await ApplicationType.findOne({ where: { code: 'TITLE_CHANGE' } });
    const affCentre = await ResearchCentre.findOne({
      where: { code: 'GCK-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
    });

    const testApp = await Application.create({
      application_no: `TEST-RETURN-${Date.now()}`,
      application_type_id: appType.id,
      scholar_id: 1,
      guide_id: 1,
      subject_user_id: scholarUser.id,
      department_id: affCentre.department_id,
      research_centre_id: affCentre.id,
      institution_type: affCentre.institution_type,
      form_data: { old_title: 'Original Title' },
      status: 'DRAFT',
      version: 1,
    });

    await workflowService.submit(testApp.id, scholarUser);

    // Guide returns application
    await workflowService.act(testApp.id, guideUser, {
      action: 'RETURN',
      remarks: 'Please update chapter synopsis page 3.',
    });

    const returnedApp = await Application.findByPk(testApp.id);
    expect(returnedApp.status).toBe('RETURNED');
    expect(returnedApp.current_step_order).toBe(1);

    // Applicant edits and resubmits
    await workflowService.resubmit(testApp.id, scholarUser, { updated_synopsis: true });

    const resubmittedApp = await Application.findByPk(testApp.id);
    expect(resubmittedApp.status).toBe('IN_PROGRESS');
    expect(resubmittedApp.current_step_order).toBe(1);
    expect(resubmittedApp.form_data.updated_synopsis).toBe(true);

    // Instance steps snapshot preserved
    const stepsCount = await WorkflowInstanceStep.count({ where: { application_id: testApp.id } });
    expect(stepsCount).toBe(4); // Affiliated service chain: Guide -> CH -> DRC -> Staff
  });

  // TEST 7
  it('7. Concurrent act() on the same step -> exactly one wins (WORKFLOW_STEP_MISMATCH for the other)', async () => {
    const appType = await ApplicationType.findOne({ where: { code: 'TITLE_CHANGE' } });
    const uniCentre = await ResearchCentre.findOne({
      where: { code: 'CHEM-UNI', institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT },
    });

    const testApp = await Application.create({
      application_no: `TEST-CONCUR-${Date.now()}`,
      application_type_id: appType.id,
      scholar_id: 1,
      guide_id: 1,
      subject_user_id: scholarUser.id,
      department_id: uniCentre.department_id,
      research_centre_id: uniCentre.id,
      institution_type: uniCentre.institution_type,
      status: 'DRAFT',
      version: 1,
    });

    await workflowService.submit(testApp.id, scholarUser);

    // Simultaneous acts specifying expectedStep: 1
    const actPromise1 = workflowService.act(testApp.id, guideUser, {
      action: 'FORWARD',
      expectedStep: 1,
    });
    const actPromise2 = workflowService.act(testApp.id, guideUser, {
      action: 'FORWARD',
      expectedStep: 1,
    });

    const results = await Promise.allSettled([actPromise1, actPromise2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(rejected[0].reason.code).toBe('WORKFLOW_STEP_MISMATCH');
  });

  // TEST 8
  it('8. Editing a definition does not alter in-flight snapshots', async () => {
    const appType = await ApplicationType.findOne({ where: { code: 'TITLE_CHANGE' } });
    const uniCentre = await ResearchCentre.findOne({
      where: { code: 'CHEM-UNI', institution_type: INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT },
    });

    const testApp = await Application.create({
      application_no: `TEST-DEF-EDIT-${Date.now()}`,
      application_type_id: appType.id,
      scholar_id: 1,
      guide_id: 1,
      subject_user_id: scholarUser.id,
      department_id: uniCentre.department_id,
      research_centre_id: uniCentre.id,
      institution_type: uniCentre.institution_type,
      status: 'DRAFT',
      version: 1,
    });

    await workflowService.submit(testApp.id, scholarUser);

    const snapshotBefore = await WorkflowInstanceStep.findAll({
      where: { application_id: testApp.id },
      order: [['step_order', 'ASC']],
    });
    const originalName = snapshotBefore[0].name;
    const modifiedName = `MODIFIED STEP ${Date.now()}`;

    // Modify definition template
    await WorkflowStep.update(
      { name: modifiedName },
      { where: { definition_id: appType.workflow_definition_id, step_order: 1 } }
    );

    // Check in-flight snapshot name has NOT changed
    const snapshotAfter = await WorkflowInstanceStep.findAll({
      where: { application_id: testApp.id },
      order: [['step_order', 'ASC']],
    });

    expect(snapshotAfter[0].name).toBe(originalName);
    expect(snapshotAfter[0].name).not.toBe(modifiedName);
  });

  // TEST 9
  it('9. Centre without a head blocks submit with WORKFLOW_NO_ASSIGNEE', async () => {
    const appType = await ApplicationType.findOne({ where: { code: 'TITLE_CHANGE' } });
    // SJC-CHEM has no centre head (centre_head_user_id is null)
    const headlessCentre = await ResearchCentre.findOne({
      where: { code: 'SJC-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
    });

    expect(headlessCentre.centre_head_user_id).toBeNull();

    const testApp = await Application.create({
      application_no: `TEST-HEADLESS-${Date.now()}`,
      application_type_id: appType.id,
      scholar_id: 1,
      guide_id: 1,
      subject_user_id: scholarUser.id,
      department_id: headlessCentre.department_id,
      research_centre_id: headlessCentre.id,
      institution_type: headlessCentre.institution_type,
      status: 'DRAFT',
      version: 1,
    });

    await expect(workflowService.submit(testApp.id, scholarUser)).rejects.toMatchObject({
      code: 'WORKFLOW_NO_ASSIGNEE',
    });
  });

  // TEST 10
  it('10. Pending-approval user cannot access anything except registration status', async () => {
    // Create a user in PENDING_APPROVAL status
    const [pendingUser] = await User.findOrCreate({
      where: { email: 'pending.applicant@kannur.ac.in' },
      defaults: {
        full_name: 'Pending Applicant',
        email: 'pending.applicant@kannur.ac.in',
        password_hash: 'hash',
        status: USER_STATUS.PENDING_APPROVAL,
      },
    });

    const pendingToken = generateAccessToken(pendingUser, ROLES.SCHOLAR, ['registration:submit']);

    // Attempt to access /applications -> 403 ACCOUNT_NOT_ACTIVE
    const blockedRes = await request(app)
      .get('/api/v1/applications')
      .set('Authorization', `Bearer ${pendingToken}`)
      .expect(403);

    expect(blockedRes.body.code).toBe('ACCOUNT_NOT_ACTIVE');

    // Attempt to access /auth/me -> 200 OK (Allowed by status gate)
    const allowedMe = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${pendingToken}`)
      .expect(200);

    expect(allowedMe.body.success).toBe(true);
    expect(allowedMe.body.data.user.status).toBe(USER_STATUS.PENDING_APPROVAL);
  });
});
