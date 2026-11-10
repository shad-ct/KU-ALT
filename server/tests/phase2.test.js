import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/app.js';
import { MasterDataService } from '../src/modules/masterdata/masterdata.service.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';
import { SettingsService } from '../src/modules/settings/settings.service.js';
import { ResearchCentre, Notification, FileAsset } from '../src/models/index.js';
import { generateAccessToken } from '../src/utils/token.js';
import { ROLES, USER_STATUS, INSTITUTION_TYPE } from '../src/config/constants.js';

describe('Phase 2: Master Data, Settings, Files & Notifications Verification', () => {
  // Test Tokens
  const adminToken = generateAccessToken(
    { id: 6, email: 'admin@kannur.ac.in', status: USER_STATUS.ACTIVE },
    ROLES.ADMIN,
    ['master:manage', 'notification:send']
  );

  const scholarToken = generateAccessToken(
    { id: 1, email: 'scholar@kannur.ac.in', status: USER_STATUS.ACTIVE, department_id: 1, research_centre_id: 1 },
    ROLES.SCHOLAR,
    ['profile:read']
  );

  const otherScholarToken = generateAccessToken(
    { id: 99, email: 'other@kannur.ac.in', status: USER_STATUS.ACTIVE, department_id: 2, research_centre_id: 4 },
    ROLES.SCHOLAR,
    ['profile:read']
  );

  // 1. CENTRE-HEAD REQUIREMENT & APPROVAL PATH BRANCHING
  describe('1. Centre Head Requirement & Approval Path Preview', () => {
    it('Affiliated centre without a head must reject signups with CENTRE_NOT_ACCEPTING_SIGNUPS', async () => {
      const vacantCentre = await ResearchCentre.findOne({
        where: { code: 'SJC-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
      });

      expect(vacantCentre).toBeDefined();
      expect(vacantCentre.centre_head_user_id).toBeNull();
      expect(vacantCentre.canAcceptSignups()).toBe(false);

      try {
        MasterDataService.assertCentreAcceptsSignups(vacantCentre);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.code).toBe('CENTRE_NOT_ACCEPTING_SIGNUPS');
      }
    });

    it('Affiliated centre with an appointed head must be eligible to accept signups', async () => {
      const activeCentre = await ResearchCentre.findOne({
        where: { code: 'GCK-CHEM', institution_type: INSTITUTION_TYPE.AFFILIATED_COLLEGE },
      });

      expect(activeCentre).toBeDefined();
      expect(activeCentre.centre_head_user_id).not.toBeNull();
      expect(activeCentre.canAcceptSignups()).toBe(true);

      expect(() => MasterDataService.assertCentreAcceptsSignups(activeCentre)).not.toThrow();
    });

    it('Public approval path endpoint returns 1-step chain for University Dept (Guide Signup)', async () => {
      const res = await request(app).get('/api/v1/public/approval-path?centreId=1&as=GUIDE');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.institutionType).toBe(INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT);
      expect(res.body.data.approvalPath).toHaveLength(1);
      expect(res.body.data.approvalPath[0].role).toBe(ROLES.DRC_CONVENOR);
    });

    it('Public approval path endpoint returns 2-step chain for Affiliated College (Guide Signup)', async () => {
      const res = await request(app).get('/api/v1/public/approval-path?centreId=2&as=GUIDE');
      expect(res.status).toBe(200);
      expect(res.body.data.institutionType).toBe(INSTITUTION_TYPE.AFFILIATED_COLLEGE);
      expect(res.body.data.approvalPath).toHaveLength(2);
      expect(res.body.data.approvalPath[0].role).toBe(ROLES.CENTRE_HEAD);
      expect(res.body.data.approvalPath[1].role).toBe(ROLES.DRC_CONVENOR);
    });

    it('Public approval path endpoint returns 3-step chain for Affiliated College (Scholar Signup)', async () => {
      const res = await request(app).get('/api/v1/public/approval-path?centreId=2&as=SCHOLAR');
      expect(res.status).toBe(200);
      expect(res.body.data.approvalPath).toHaveLength(3);
      expect(res.body.data.approvalPath[0].role).toBe(ROLES.GUIDE);
      expect(res.body.data.approvalPath[1].role).toBe(ROLES.CENTRE_HEAD);
      expect(res.body.data.approvalPath[2].role).toBe(ROLES.DRC_CONVENOR);
    });
  });

  // 2. FILE UPLOADS & MAGIC-BYTE VERIFICATION
  describe('2. File Upload Pipeline & Magic-Byte Verification', () => {
    const tempTestPdf = path.join(process.cwd(), 'temp-test-doc.pdf');
    const tempDisguisedExe = path.join(process.cwd(), 'temp-fake.exe');

    beforeAll(() => {
      // Genuine PDF header magic bytes: %PDF-1.4
      fs.writeFileSync(tempTestPdf, '%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
      // Executable binary file
      fs.writeFileSync(tempDisguisedExe, 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff');
    });

    it('Disallowed file extension (.exe) is rejected by upload filter', async () => {
      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${scholarToken}`)
        .attach('file', tempDisguisedExe);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('UPLOAD_REJECTED');
      expect(res.body.message).toContain('not permitted');
    });

    it('Genuine PDF document is verified, stored in directory structure, and recorded in file_assets', async () => {
      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${scholarToken}`)
        .field('ownerType', 'USER')
        .field('ownerId', '1')
        .attach('file', tempTestPdf);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.originalName).toBe('temp-test-doc.pdf');
      expect(res.body.data.mimeType).toBe('application/pdf');

      const fileId = res.body.data.id;

      // Owner can download
      const downloadRes = await request(app)
        .get(`/api/v1/files/${fileId}/download`)
        .set('Authorization', `Bearer ${scholarToken}`);
      expect(downloadRes.status).toBe(200);

      // Another unauthorized scholar receives 404 (per 07 §2 privacy rules)
      const deniedRes = await request(app)
        .get(`/api/v1/files/${fileId}/download`)
        .set('Authorization', `Bearer ${otherScholarToken}`);
      expect(deniedRes.status).toBe(404);

      // Clean up asset row
      await FileAsset.destroy({ where: { id: fileId } });
    });

    // Cleanup temp local test fixtures
    it('Clean test fixtures', () => {
      if (fs.existsSync(tempTestPdf)) fs.unlinkSync(tempTestPdf);
      if (fs.existsSync(tempDisguisedExe)) fs.unlinkSync(tempDisguisedExe);
    });
  });

  // 3. NOTIFICATION SYSTEM & BELL INBOX
  describe('3. Notification Delivery & Inbox Operations', () => {
    it('Creates in-app notification row and increments unread count', async () => {
      const testNotice = await NotificationsService.send({
        recipientUserId: 1, // Scholar
        type: 'RAC_ALERT',
        title: 'Upcoming RAC Meeting Scheduled',
        body: 'Your 3rd RAC review has been scheduled for 15 Dec 2026.',
        link: '/timeline',
        sendEmail: false,
      });

      expect(testNotice.id).toBeDefined();

      // Scholar fetches inbox
      const inboxRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${scholarToken}`);

      expect(inboxRes.status).toBe(200);
      expect(inboxRes.body.success).toBe(true);
      expect(inboxRes.body.meta.unreadCount).toBeGreaterThan(0);

      // Mark single notification as read
      const markRes = await request(app)
        .patch(`/api/v1/notifications/${testNotice.id}/read`)
        .set('Authorization', `Bearer ${scholarToken}`);

      expect(markRes.status).toBe(200);

      // Verify read state in DB
      const updatedNotice = await Notification.findByPk(testNotice.id);
      expect(updatedNotice.read_at).not.toBeNull();

      // Clean up
      await testNotice.destroy();
    });
  });

  // 4. SETTINGS SERVICE & IN-MEMORY CACHE
  describe('4. Settings Service with In-Memory Caching', () => {
    it('Reads, writes and invalidates cache reliably', async () => {
      const testKey = 'portal.maintenanceMode';

      // Set value
      await SettingsService.set(testKey, { enabled: false }, 'portal', 6);

      // First read: Populates cache
      const val1 = await SettingsService.get(testKey);
      expect(val1).toEqual({ enabled: false });

      // Update value: Must invalidate cache and return new value
      await SettingsService.set(testKey, { enabled: true, reason: 'Scheduled DB upgrade' }, 'portal', 6);
      const val2 = await SettingsService.get(testKey);
      expect(val2).toEqual({ enabled: true, reason: 'Scheduled DB upgrade' });

      // Fallback default
      const nonExistent = await SettingsService.get('non.existent.key', 'DEFAULT_FALLBACK');
      expect(nonExistent).toBe('DEFAULT_FALLBACK');
    });
  });
});
