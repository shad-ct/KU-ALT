import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Scholar, ScholarTimeline } from '../src/models/index.js';

describe('Phase 6: Dashboards & People Management', () => {
  let adminToken;
  let drcToken;
  let guideToken;
  let scholarToken;
  let staffToken;

  beforeAll(async () => {
    const aLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@kannur.ac.in',
      password: 'Password123!',
    });
    adminToken = aLogin.body.data.accessToken;

    const dLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'drc@kannur.ac.in',
      password: 'Password123!',
    });
    drcToken = dLogin.body.data.accessToken;

    const gLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'guide@kannur.ac.in',
      password: 'Password123!',
    });
    guideToken = gLogin.body.data.accessToken;

    const sLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'scholar@kannur.ac.in',
      password: 'Password123!',
    });
    scholarToken = sLogin.body.data.accessToken;

    const stLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff@kannur.ac.in',
      password: 'Password123!',
    });
    staffToken = stLogin.body.data.accessToken;
  });

  it('1. GET /dashboard returns role-tailored counters and pending tasks strip for Guide', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${guideToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('GUIDE');
    expect(res.body.data.counters).toHaveProperty('totalAssignedScholars');
    expect(res.body.data.counters).toHaveProperty('activeScholars');
    expect(res.body.data.counters).toHaveProperty('pendingVerification');
    expect(Array.isArray(res.body.data.pendingTasks)).toBe(true);
  });

  it('2. GET /dashboard returns exact counters for DRC Convenor', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${drcToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('DRC_CONVENOR');
    expect(res.body.data.counters).toHaveProperty('totalGuides');
    expect(res.body.data.counters).toHaveProperty('totalScholars');
    expect(res.body.data.counters).toHaveProperty('pendingGuideRegistrations');
    expect(res.body.data.counters).toHaveProperty('pendingScholarRegistrations');
  });

  it('3. GET /scholars is scoped according to caller role', async () => {
    // Guide gets only own scholars
    const guideScholars = await request(app)
      .get('/api/v1/scholars')
      .set('Authorization', `Bearer ${guideToken}`);

    expect(guideScholars.status).toBe(200);
    expect(Array.isArray(guideScholars.body.data)).toBe(true);

    // Admin gets all scholars
    const adminScholars = await request(app)
      .get('/api/v1/scholars')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminScholars.status).toBe(200);
    expect(adminScholars.body.data.length).toBeGreaterThanOrEqual(guideScholars.body.data.length);
  });

  it('4. PATCH /scholars/:id/submission-date updates submission dates with audit trail', async () => {
    const scholar = await Scholar.findOne();
    expect(scholar).not.toBeNull();

    const res = await request(app)
      .patch(`/api/v1/scholars/${scholar.id}/submission-date`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        dateOfSubmission: '2026-11-20',
        submissionDueDate: '2026-11-30',
        remarks: 'Pre-submission synopsis formally accepted by DRC',
      });

    expect(res.status).toBe(200);

    const timeline = await ScholarTimeline.findOne({ where: { scholar_id: scholar.id } });
    expect(timeline.date_of_submission).toBe('2026-11-20');
  });

  it('5. GET/PATCH /profile updates basic contact information', async () => {
    const profileRes = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${scholarToken}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.user).toBeDefined();

    const patchRes = await request(app)
      .patch('/api/v1/profile')
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        phone: '9876543210',
        address: 'Kannur University Campus Hostel 2',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.phone).toBe('9876543210');
  });

  it('6. GET /dashboard returns Scholar dashboard with pending actions and recent activities', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard')
      .set('Authorization', `Bearer ${scholarToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.counters).toHaveProperty('totalApplications');
    expect(res.body.data.counters).toHaveProperty('registrationStatus');
    expect(Array.isArray(res.body.data.pendingActions)).toBe(true);
    expect(Array.isArray(res.body.data.recentActivities)).toBe(true);
  });
});
