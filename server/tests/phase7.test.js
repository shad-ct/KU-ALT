import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Certificate, CertificateTemplate, Scholar } from '../src/models/index.js';

describe('Phase 7: Staff Processing & Certificates', () => {
  let staffToken;
  let adminToken;
  let scholarToken;
  let template;
  let scholar;

  beforeAll(async () => {
    const stLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff@kannur.ac.in',
      password: 'Password123!',
    });
    staffToken = stLogin.body.data.accessToken;

    const aLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@kannur.ac.in',
      password: 'Password123!',
    });
    adminToken = aLogin.body.data.accessToken;

    const sLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'scholar@kannur.ac.in',
      password: 'Password123!',
    });
    scholarToken = sLogin.body.data.accessToken;

    template = await CertificateTemplate.findOne();
    scholar = await Scholar.findOne();
  });

  it('1. GET /certificate-templates lists available templates', async () => {
    const res = await request(app)
      .get('/api/v1/certificate-templates')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('2. POST /certificates generates certificate with sequential number and rendered placeholders', async () => {
    const res = await request(app)
      .post('/api/v1/certificates')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        templateId: template.id,
        scholarId: scholar.id,
        data: {},
      });

    expect(res.status).toBe(201);
    expect(res.body.data.certificate_no).toMatch(/^KU-CERT(-\d{4})?-\d{5}$/);
    expect(res.body.data.status).toBe('ISSUED');
    expect(res.body.data.data_snapshot).toBeDefined();

    const certNo = res.body.data.certificate_no;

    // Public verification of active certificate
    const verifyRes = await request(app).get(`/api/v1/public/verify-certificate/${certNo}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.isValid).toBe(true);
    expect(verifyRes.body.data.status).toBe('ISSUED');
  });

  it('3. POST /certificates/:id/revoke marks certificate as REVOKED and public verify confirms', async () => {
    const cert = await Certificate.findOne({ order: [['id', 'DESC']] });

    const revokeRes = await request(app)
      .post(`/api/v1/certificates/${cert.id}/revoke`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Issued with clerical typographic error in scholar name',
      });

    expect(revokeRes.status).toBe(200);
    expect(revokeRes.body.data.status).toBe('REVOKED');

    // Public verification of revoked certificate
    const verifyRes = await request(app).get(`/api/v1/public/verify-certificate/${cert.certificate_no}`);
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.isValid).toBe(false);
    expect(verifyRes.body.data.status).toBe('REVOKED');
  });
});
