import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User, RefreshToken } from '../src/models/index.js';
import { buildScope, assertInScope } from '../src/utils/scope.js';
import { generateAccessToken } from '../src/utils/token.js';
import { ROLES, USER_STATUS, ERROR_CODES } from '../src/config/constants.js';

describe('Phase 1: Auth & RBAC Verification Tests', () => {
  // Test User Credentials
  const validEmail = 'scholar@kannur.ac.in';
  const validPassword = 'Password123!';

  it('1. Login should authenticate seeded demo user and issue JWT and refresh cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validEmail, password: validPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(validEmail);
    expect(res.body.data.activeRole).toBe(ROLES.SCHOLAR);

    // Refresh token should be in httpOnly cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
  });

  it('2. Account Lockout: 5 failed login attempts should lock account for 15 minutes', async () => {
    const lockoutEmail = 'lockout-test@kannur.ac.in';
    const testUser = await User.create({
      email: lockoutEmail,
      password_hash: 'SecurePassword123!',
      full_name: 'Lockout Test User',
      status: USER_STATUS.ACTIVE,
    });

    try {
      // 4 failed attempts
      for (let i = 1; i <= 4; i++) {
        const failRes = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: lockoutEmail, password: 'WrongPassword' });

        expect(failRes.status).toBe(401);
        expect(failRes.body.code).toBe(ERROR_CODES.AUTH_INVALID);
      }

      // 5th failed attempt triggers lockout
      const fifthRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: lockoutEmail, password: 'WrongPassword' });

      expect(fifthRes.status).toBe(401);

      // 6th attempt even with correct password is now locked out
      const lockedRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: lockoutEmail, password: 'SecurePassword123!' });

      expect(lockedRes.status).toBe(401);
      expect(lockedRes.body.code).toBe(ERROR_CODES.AUTH_LOCKED);
      expect(lockedRes.body.message).toContain('Account is temporarily locked');
    } finally {
      await testUser.destroy();
    }
  });

  it('3. Refresh Token Rotation & Family Reuse Detection', async () => {
    // Perform initial login to get refresh token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@kannur.ac.in', password: validPassword });

    const cookieHeader = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookieHeader.find((c) => c.startsWith('refreshToken='));
    const initialToken = refreshTokenCookie.split(';')[0].split('=')[1];

    // First refresh: Successful rotation
    const refreshRes1 = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${initialToken}`);

    expect(refreshRes1.status).toBe(200);
    expect(refreshRes1.body.success).toBe(true);
    expect(refreshRes1.body.data.accessToken).toBeDefined();

    // Old token was rotated. Reusing old initialToken should trigger reuse detection!
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refreshToken=${initialToken}`);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.code).toBe(ERROR_CODES.AUTH_INVALID);
    expect(reuseRes.body.message).toContain('Compromised refresh token detected');
  });

  it('4. Scope Helper Unit Tests (Tenancy Isolation)', () => {
    // Scholar Scope
    const scholarUser = { sub: 42, activeRole: ROLES.SCHOLAR, departmentId: 5 };
    const scholarScope = buildScope(scholarUser, 'scholar');
    expect(scholarScope).toEqual({ user_id: 42 });

    // Guide Scope
    const guideUser = { sub: 10, activeRole: ROLES.GUIDE };
    const guideScope = buildScope(guideUser, 'scholar');
    expect(guideScope).toEqual({ guide_user_id: 10 });

    // Centre Head Scope
    const centreHead = { sub: 12, activeRole: ROLES.CENTRE_HEAD, researchCentreId: 99 };
    const centreScope = buildScope(centreHead, 'application');
    expect(centreScope).toEqual({ research_centre_id: 99 });

    // DRC Convenor Scope
    const drcUser = { sub: 8, activeRole: ROLES.DRC_CONVENOR, departmentId: 7 };
    const drcScope = buildScope(drcUser, 'equipment');
    expect(drcScope).toEqual({ department_id: 7 });

    // Admin Scope
    const adminUser = { sub: 1, activeRole: ROLES.ADMIN };
    expect(buildScope(adminUser, 'anything')).toEqual({});

    // assertInScope checks: Read out-of-scope throws 404 per 07 §2
    const otherApplication = { id: 100, subject_user_id: 999 };
    expect(() => assertInScope(scholarUser, otherApplication, 'Application', false)).toThrowError(
      'Application not found'
    );

    // assertInScope checks: Write out-of-scope throws 403 SCOPE_VIOLATION
    expect(() => assertInScope(scholarUser, otherApplication, 'Application', true)).toThrowError(
      'You do not have institutional authority'
    );
  });

  it('5. Pending User Gate: Users with status PENDING_APPROVAL cannot access protected routes', async () => {
    const pendingUser = {
      id: 999,
      email: 'pending@kannur.ac.in',
      status: USER_STATUS.PENDING_APPROVAL,
      department_id: 1,
      research_centre_id: 1,
    };

    const token = generateAccessToken(pendingUser, ROLES.SCHOLAR, ['scholar:read']);

    // Attempting to access protected endpoint (/change-password) should be rejected
    const blockedRes = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'old', newPassword: 'NewPassword123!' });

    expect(blockedRes.status).toBe(403);
    expect(blockedRes.body.code).toBe(ERROR_CODES.ACCOUNT_NOT_ACTIVE);

    // Allowed endpoints for pending user: /api/v1/auth/me
    const allowedRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    // If user not in DB, 404, but auth middleware passed without ACCOUNT_NOT_ACTIVE error
    expect(allowedRes.body.code).not.toBe(ERROR_CODES.ACCOUNT_NOT_ACTIVE);
  });
});

