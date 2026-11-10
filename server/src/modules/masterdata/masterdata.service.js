import {
  Department,
  ResearchCentre,
  ResearchProgramme,
  AcademicYear,
  Designation,
  CertificateType,
  ApplicationType,
  User,
  AuditLog,
} from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { INSTITUTION_TYPE, ERROR_CODES } from '../../config/constants.js';

export class MasterDataService {
  // ==========================================
  // 1. DEPARTMENTS
  // ==========================================
  static async listDepartments(query = {}) {
    const where = {};
    if (query.activeOnly === 'true') {
      where.is_active = true;
    }
    return Department.findAll({
      where,
      include: [{ model: User, as: 'drc_convenor', attributes: ['id', 'full_name', 'email'] }],
      order: [['name', 'ASC']],
    });
  }

  static async createDepartment({ name, code, drcConvenorUserId, userId, ip, userAgent }) {
    const dept = await Department.create({
      name,
      code: code.toUpperCase().trim(),
      drc_convenor_user_id: drcConvenorUserId || null,
    });

    await AuditLog.create({
      actor_user_id: userId,
      action: 'DEPARTMENT_CREATE',
      entity_type: 'DEPARTMENT',
      entity_id: dept.id,
      after_json: dept.toJSON(),
      ip,
      user_agent: userAgent,
    });

    return dept;
  }

  static async updateDepartment(id, data, { userId, ip, userAgent }) {
    const dept = await Department.findByPk(id);
    if (!dept) throw ApiError.notFound('Department not found');

    const before = dept.toJSON();
    if (data.name) dept.name = data.name;
    if (data.code) dept.code = data.code.toUpperCase().trim();
    if (data.drcConvenorUserId !== undefined) dept.drc_convenor_user_id = data.drcConvenorUserId;
    if (data.isActive !== undefined) dept.is_active = data.isActive;

    await dept.save();

    await AuditLog.create({
      actor_user_id: userId,
      action: 'DEPARTMENT_UPDATE',
      entity_type: 'DEPARTMENT',
      entity_id: dept.id,
      before_json: before,
      after_json: dept.toJSON(),
      ip,
      user_agent: userAgent,
    });

    return dept;
  }

  // ==========================================
  // 2. RESEARCH CENTRES
  // ==========================================
  static async listCentres(query = {}) {
    const where = {};
    if (query.departmentId) where.department_id = query.departmentId;
    if (query.institutionType) where.institution_type = query.institutionType;
    if (query.activeOnly === 'true') where.is_active = true;

    return ResearchCentre.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'centre_head', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['name', 'ASC']],
    });
  }

  static async createCentre({
    name,
    code,
    departmentId,
    institutionType,
    centreHeadUserId,
    collegeName,
    userId,
    ip,
    userAgent,
  }) {
    const dept = await Department.findByPk(departmentId);
    if (!dept) throw ApiError.badRequest('Referenced department does not exist');

    const centre = await ResearchCentre.create({
      name,
      code: code.toUpperCase().trim(),
      department_id: departmentId,
      institution_type: institutionType,
      centre_head_user_id: centreHeadUserId || null,
      college_name: collegeName || null,
    });

    await AuditLog.create({
      actor_user_id: userId,
      action: 'RESEARCH_CENTRE_CREATE',
      entity_type: 'RESEARCH_CENTRE',
      entity_id: centre.id,
      after_json: centre.toJSON(),
      ip,
      user_agent: userAgent,
    });

    return centre;
  }

  static async updateCentre(id, data, { userId, ip, userAgent }) {
    const centre = await ResearchCentre.findByPk(id);
    if (!centre) throw ApiError.notFound('Research centre not found');

    const before = centre.toJSON();
    if (data.name) centre.name = data.name;
    if (data.code) centre.code = data.code.toUpperCase().trim();
    if (data.departmentId) centre.department_id = data.departmentId;
    if (data.institutionType) centre.institution_type = data.institutionType;
    if (data.centreHeadUserId !== undefined) centre.centre_head_user_id = data.centreHeadUserId;
    if (data.collegeName !== undefined) centre.college_name = data.collegeName;
    if (data.isActive !== undefined) centre.is_active = data.isActive;

    await centre.save();

    await AuditLog.create({
      actor_user_id: userId,
      action: 'RESEARCH_CENTRE_UPDATE',
      entity_type: 'RESEARCH_CENTRE',
      entity_id: centre.id,
      before_json: before,
      after_json: centre.toJSON(),
      ip,
      user_agent: userAgent,
    });

    return centre;
  }

  /**
   * Asserts whether an affiliated centre is eligible to accept candidate signups
   * per rule in 01 & 03 §2: AFFILIATED_COLLEGE requires centre_head_user_id != null.
   */
  static assertCentreAcceptsSignups(centre) {
    if (!centre.is_active) {
      throw new ApiError(
        400,
        ERROR_CODES.VALIDATION_ERROR,
        `Research centre '${centre.name}' is currently inactive and cannot accept registrations.`
      );
    }

    if (centre.institution_type === INSTITUTION_TYPE.AFFILIATED_COLLEGE && !centre.centre_head_user_id) {
      throw new ApiError(
        400,
        'CENTRE_NOT_ACCEPTING_SIGNUPS',
        `Affiliated research centre '${centre.name}' does not have an appointed Research Centre Head. Candidate signups cannot be accepted until a head is designated by the university.`
      );
    }
  }

  // ==========================================
  // 3. PROGRAMMES, YEARS, DESIGNATIONS, TYPES
  // ==========================================
  static async listProgrammes() {
    return ResearchProgramme.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
  }

  static async listAcademicYears() {
    return AcademicYear.findAll({ order: [['start_date', 'DESC']] });
  }

  static async listDesignations() {
    return Designation.findAll({ order: [['name', 'ASC']] });
  }

  static async listCertificateTypes() {
    return CertificateType.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
  }

  static async listApplicationTypes(kind = null) {
    const where = { is_active: true };
    if (kind) where.kind = kind;
    return ApplicationType.findAll({ where, order: [['name', 'ASC']] });
  }
}

export default MasterDataService;

