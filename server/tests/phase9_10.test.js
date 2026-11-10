import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { AuditLog, User } from '../src/models/index.js';

describe('Phase 9 & 10: Reports, Admin Management & Hardening', () => {
  let adminToken;
  let drcToken;
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

    const sLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff@kannur.ac.in',
      password: 'Password123!',
    });
    staffToken = sLogin.body.data.accessToken;
  });

  it('1. GET /reports/:reportKey executes parameterised aggregation queries for all report keys', async () => {
    const keys = [
      'scholar-registration',
      'guide-registration',
      'application-status',
      'centre-wise',
      'guide-wise-scholars',
      'pending-applications',
      'date-of-submission',
      'equipment-utilization',
    ];

    for (const key of keys) {
      const res = await request(app)
        .get(`/api/v1/reports/${key}`)
        .set('Authorization', `Bearer ${adminToken}`);

      if (res.status !== 200) {
        console.error('FAILED REPORT KEY:', key, res.status, res.body);
      }

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('2. GET /reports/:reportKey/export?format=csv generates CSV and writes audit log', async () => {
    const auditBefore = await AuditLog.count({ where: { action: 'EXPORT_REPORT' } });

    const res = await request(app)
      .get('/api/v1/reports/scholar-registration/export?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('scholarId');

    const auditAfter = await AuditLog.count({ where: { action: 'EXPORT_REPORT' } });
    expect(auditAfter).toBe(auditBefore + 1);
  });

  it('3. GET /admin/reports/missing-approvers detects centres without head or depts without convenor', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/missing-approvers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('centresWithoutHead');
    expect(res.body.data).toHaveProperty('departmentsWithoutConvenor');
    expect(Array.isArray(res.body.data.centresWithoutHead)).toBe(true);
  });

  it('4. Admin User Management: create user, activate, deactivate, and role assignment', async () => {
    const email = `test.user.${Date.now()}@kannur.ac.in`;

    // Create
    const createRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email,
        password: 'Password123!',
        fullName: 'Test Administrative Officer',
        phone: '9988776655',
        roleCodes: ['STAFF'],
      });

    expect(createRes.status).toBe(201);
    const userId = createRes.body.data.id;

    // Deactivate
    const deactRes = await request(app)
      .post(`/api/v1/admin/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deactRes.status).toBe(200);

    // Activate
    const actRes = await request(app)
      .post(`/api/v1/admin/users/${userId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(actRes.status).toBe(200);
  });

  it('5. POST /admin/backup initializes database snapshot', async () => {
    const res = await request(app)
      .post('/api/v1/admin/backup')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.snapshotName).toMatch(/\.sql$/);
  });
});
