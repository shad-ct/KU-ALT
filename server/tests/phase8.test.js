import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import {
  Equipment,
  EquipmentUnit,
  EquipmentRequest,
  EquipmentAllocation,
  Scholar,
} from '../src/models/index.js';
import { equipmentService } from '../src/modules/equipment/equipment.service.js';

describe('Phase 8: Research Equipment Management (Module 11 & Spec 06)', () => {
  let scholarToken;
  let drcToken;
  let adminToken;
  let serializedEq;
  let bulkEq;
  let unit1;
  let unit2;
  let firstRequestId;

  beforeAll(async () => {
    const sLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'scholar@kannur.ac.in',
      password: 'Password123!',
    });
    scholarToken = sLogin.body.data.accessToken;

    const dLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'drc@kannur.ac.in',
      password: 'Password123!',
    });
    drcToken = dLogin.body.data.accessToken;

    const aLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@kannur.ac.in',
      password: 'Password123!',
    });
    adminToken = aLogin.body.data.accessToken;

    serializedEq = await Equipment.findOne({ where: { tracking_mode: 'SERIALIZED' } });
    bulkEq = await Equipment.findOne({ where: { tracking_mode: 'BULK' } });

    // Reset any lingering allocations from previous test runs
    await EquipmentAllocation.destroy({ where: { equipment_id: [serializedEq.id, bulkEq.id] } });
    await EquipmentRequest.destroy({ where: { equipment_id: [serializedEq.id, bulkEq.id] } });
    await EquipmentUnit.update({ status: 'AVAILABLE' }, { where: { equipment_id: serializedEq.id } });
    await Equipment.update({ available_quantity: bulkEq.total_quantity }, { where: { id: bulkEq.id } });

    unit1 = await EquipmentUnit.findOne({ where: { equipment_id: serializedEq.id, asset_tag: 'KU-EQ-CHEM-01-A' } });
    unit2 = await EquipmentUnit.findOne({ where: { equipment_id: serializedEq.id, asset_tag: 'KU-EQ-CHEM-01-B' } });
  });

  it('1. GET /equipment catalogs equipment with computed availability status', async () => {
    const res = await request(app)
      .get('/api/v1/equipment')
      .set('Authorization', `Bearer ${scholarToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const item = res.body.data[0];
    expect(item).toHaveProperty('availableCount');
    expect(item).toHaveProperty('availabilityStatus');
  });

  it('2. Scholar submits request and DRC approves it', async () => {
    const reqRes = await request(app)
      .post('/api/v1/equipment-requests')
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        equipmentId: serializedEq.id,
        purpose: 'Synthesis of chiral organocatalysts for Ph.D. objective 2',
        expectedReturnDate: '2026-11-12',
      });

    expect(reqRes.status).toBe(201);
    expect(reqRes.body.data.request_no).toMatch(/^EQR(-\d{4})?-\d{6}$/);
    expect(reqRes.body.data.status).toBe('PENDING');

    firstRequestId = reqRes.body.data.id;

    // DRC approves
    const appRes = await request(app)
      .post(`/api/v1/drc/equipment-requests/${firstRequestId}/approve`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        remarks: 'Approved for research experiment',
      });

    expect(appRes.status).toBe(200);
    expect(appRes.body.data.status).toBe('APPROVED');
  });

  it('3. DRC allocates unit to approved request and updates unit status to ALLOCATED', async () => {
    const allocRes = await request(app)
      .post(`/api/v1/drc/equipment-requests/${firstRequestId}/allocate`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        unitId: unit1.id,
        expectedReturnDate: '2026-11-12',
      });

    expect(allocRes.status).toBe(200);
    expect(allocRes.body.data.request.status).toBe('ALLOCATED');

    // Verify unit status updated
    await unit1.reload();
    expect(unit1.status).toBe('ALLOCATED');
  });

  it('4. Concurrent double-allocation prevention (Spec 06 §0): Attempting to allocate the same unit fails', async () => {
    // Submit second request
    const req2 = await request(app)
      .post('/api/v1/equipment-requests')
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        equipmentId: serializedEq.id,
        purpose: 'Secondary analysis for validation of optical rotation',
        expectedReturnDate: '2026-11-13',
      });

    const reqId = req2.body.data.id;

    await request(app)
      .post(`/api/v1/drc/equipment-requests/${reqId}/approve`)
      .set('Authorization', `Bearer ${drcToken}`);

    // Try to allocate unit1 (already allocated)
    const failAlloc = await request(app)
      .post(`/api/v1/drc/equipment-requests/${reqId}/allocate`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        unitId: unit1.id, // unit1 is already ALLOCATED
      });

    expect(failAlloc.status).toBe(400);
    expect(failAlloc.body.message).toContain('already allocated');

    // Allocate unit2 instead -> succeeds
    const okAlloc = await request(app)
      .post(`/api/v1/drc/equipment-requests/${reqId}/allocate`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        unitId: unit2.id,
      });

    if (okAlloc.status !== 200) {
      console.error('OKALLOC ERROR:', okAlloc.status, okAlloc.body);
    }

    expect(okAlloc.status).toBe(200);
    expect(okAlloc.body.data.request.status).toBe('ALLOCATED');
  });

  it('5. Equipment return check-in restores unit status to AVAILABLE', async () => {
    const allocation = await EquipmentAllocation.findOne({ where: { unit_id: unit1.id, status: 'ACTIVE' } });
    expect(allocation).not.toBeNull();

    const returnRes = await request(app)
      .post(`/api/v1/drc/equipment-allocations/${allocation.id}/return`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        returnCondition: 'GOOD',
        returnNotes: 'Returned in clean working order',
      });

    expect(returnRes.status).toBe(200);
    expect(returnRes.body.data.allocation.status).toBe('RETURNED');

    await unit1.reload();
    expect(unit1.status).toBe('AVAILABLE');
  });

  it('6. BULK equipment allocation decrements available quantity and return restores it', async () => {
    const initialQty = bulkEq.available_quantity;

    // Submit request for 5 units
    const bReq = await request(app)
      .post('/api/v1/equipment-requests')
      .set('Authorization', `Bearer ${scholarToken}`)
      .send({
        equipmentId: bulkEq.id,
        quantity: 5,
        purpose: 'Standard chemical reagent packs for column chromatography',
      });

    const bReqId = bReq.body.data.id;

    await request(app)
      .post(`/api/v1/drc/equipment-requests/${bReqId}/approve`)
      .set('Authorization', `Bearer ${drcToken}`);

    // Allocate
    const bAlloc = await request(app)
      .post(`/api/v1/drc/equipment-requests/${bReqId}/allocate`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        quantity: 5,
      });

    expect(bAlloc.status).toBe(200);

    await bulkEq.reload();
    expect(bulkEq.available_quantity).toBe(initialQty - 5);

    // Return
    const allocId = bAlloc.body.data.allocation.id;
    await request(app)
      .post(`/api/v1/drc/equipment-allocations/${allocId}/return`)
      .set('Authorization', `Bearer ${drcToken}`)
      .send({
        returnCondition: 'USED',
      });

    await bulkEq.reload();
    expect(bulkEq.available_quantity).toBe(initialQty);
  });
});
