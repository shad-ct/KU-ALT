import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User, Scholar, Guide, Department, ResearchCentre, Application, ApplicationType, RacSchedule, FileAsset } from '../src/models/index.js';

describe('Phase 5: Scholar Service Applications & RAC', () => {
  let scholarToken;
  let guideToken;
  let centreHeadToken;
  let drcToken;
  let staffToken;
  let scholarUser;
  let scholarRecord;
  let guideRecord;

  beforeAll(async () => {
    // 1. Scholar login
    const sLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'scholar@kannur.ac.in',
      password: 'Password123!',
    });
    scholarToken = sLogin.body.data.accessToken;
    scholarUser = sLogin.body.data.user;

    // 2. Guide login
    const gLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'guide@kannur.ac.in',
      password: 'Password123!',
    });
    guideToken = gLogin.body.data.accessToken;

    // 3. Centre Head login
    const chLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'centrehead@kannur.ac.in',
      password: 'Password123!',
    });
    centreHeadToken = chLogin.body.data.accessToken;

    // 4. DRC Convenor login
    const drcLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'drc@kannur.ac.in',
      password: 'Password123!',
    });
    drcToken = drcLogin.body.data.accessToken;

    // 5. Staff login
    const staffLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff@kannur.ac.in',
      password: 'Password123!',
    });
    staffToken = staffLogin.body.data.accessToken;

    // Load scholar and guide records
    scholarRecord = await Scholar.findOne({ where: { user_id: scholarUser.id } });
    guideRecord = await Guide.findOne({ where: { id: scholarRecord.guide_id } });
  });

  it('1. Scholar submits TITLE_CHANGE service application and verifies auto-routing', async () => {
    const res = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        type: 'TITLE_CHANGE',
        formData: {
          previous_title: scholarRecord.research_title || 'Old Title',
          new_title: 'Advanced Organocatalysis in Aqueous Media',
          justification: 'Broadened scope following 2nd RAC recommendations',
        },
        autoSubmit: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.current_role_code).toBe('GUIDE');

    const appId = res.body.data.id;

    // Step 1: Guide approves/forwards
    const guideAct = await request(app)
      .post(`/api/v1/applications/${appId}/actions`)
      .set('Authorization', `Bearer ${guideToken}`)
      .send({
        action: 'FORWARD',
        remarks: 'Strongly recommended by supervising guide',
        expectedStep: 1,
      });
    expect(guideAct.status).toBe(200);

    // Step 2: In university dept, next step is DRC Convenor
    const drcAct = await request(app)
      .post(`/api/v1/applications/${appId}/actions`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        action: 'FORWARD',
        remarks: 'Endorsed by DRC committee meeting',
        expectedStep: 2,
      });
    expect(drcAct.status).toBe(200);

    // Step 3 (Final): Section Staff approves and issues official sanction
    const staffAct = await request(app)
      .post(`/api/v1/applications/${appId}/actions`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        action: 'APPROVE',
        remarks: 'Sanction order issued by R&D Cell',
        expectedStep: 3,
      });
    expect(staffAct.status).toBe(200);
    expect(staffAct.body.data.status).toBe('APPROVED');

    // Verify side-effect hook: scholar research_title updated
    await scholarRecord.reload();
    expect(scholarRecord.research_title).toBe('Advanced Organocatalysis in Aqueous Media');
  });

  it('2. Scholar can cancel own application while in progress', async () => {
    // Create new application
    const appRes = await request(app)
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        type: 'LEAVE',
        formData: {
          leave_type: 'Maternity/Medical Leave',
          from_date: '2026-12-01',
          to_date: '2026-12-31',
          reason: 'Medical recuperation',
        },
        autoSubmit: true,
      });

    const appId = appRes.body.data.id;

    const cancelRes = await request(app)
      .post(`/api/v1/applications/${appId}/cancel`)
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        remarks: 'No longer required',
      });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');
  });

  it('3. RAC Schedule: create meeting, upload minutes, and update status', async () => {
    // Create schedule
    const createRes = await request(app)
      .post(`/api/v1/scholars/${scholarRecord.id}/rac-schedule`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        meetingDate: '2026-12-15',
        venue: 'Department Seminar Complex Hall A',
        type: 'Half-Yearly Review',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe('SCHEDULED');

    const meetingId = createRes.body.data.id;

    // Scholar views schedule
    const viewRes = await request(app)
      .get(`/api/v1/scholars/me/rac-schedule`)
      .set('Authorization', `Bearer ${scholarToken}`);

    expect(viewRes.status).toBe(200);
    expect(viewRes.body.data.some((m) => m.id === meetingId)).toBe(true);

    // Ensure a test file asset exists
    const file = await FileAsset.create({
      original_name: 'rac_minutes.pdf',
      stored_name: `rac_minutes_${Date.now()}.pdf`,
      mime_type: 'application/pdf',
      size_bytes: 1024,
      checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      storage_path: 'uploads/rac_minutes.pdf',
      owner_type: 'RAC_SCHEDULE',
      owner_id: meetingId,
      uploaded_by: scholarUser.id,
    });

    // Upload minutes
    const minutesRes = await request(app)
      .post(`/api/v1/scholars/${scholarRecord.id}/rac-schedule/${meetingId}/minutes`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        fileId: file.id,
      });

    expect(minutesRes.status).toBe(200);
    expect(minutesRes.body.data.status).toBe('DONE');
  });
});
