import { Op } from 'sequelize';
import {
  Certificate,
  CertificateTemplate,
  Scholar,
  Guide,
  User,
  Role,
} from '../../models/index.js';
import { certificateService } from './certificate.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { sendResponse } from '../../utils/response.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';
import { ROLES } from '../../config/constants.js';

export class CertificatesController {
  /**
   * GET /certificate-templates
   */
  async getTemplates(req, res) {
    const templates = await CertificateTemplate.findAll({
      order: [['name', 'ASC']],
    });
    return sendResponse(res, {
      message: 'Certificate templates retrieved successfully',
      data: templates,
    });
  }

  /**
   * POST /certificate-templates
   */
  async createTemplate(req, res) {
    const { typeCode, name, htmlBody, placeholders } = req.body;
    if (!typeCode || !name || !htmlBody) {
      throw ApiError.badRequest('typeCode, name, and htmlBody are required');
    }

    const template = await CertificateTemplate.create({
      type_code: typeCode,
      name,
      html_body: htmlBody,
      placeholders: placeholders || [],
      is_active: true,
      version: 1,
    });

    return sendResponse(res, {
      status: 201,
      message: 'Certificate template created successfully',
      data: template,
    });
  }

  /**
   * PATCH /certificate-templates/:id
   */
  async updateTemplate(req, res) {
    const { id } = req.params;
    const { name, htmlBody, placeholders, isActive } = req.body;

    const template = await CertificateTemplate.findByPk(id);
    if (!template) {
      throw ApiError.notFound('Certificate template not found');
    }

    if (name) template.name = name;
    if (htmlBody) template.html_body = htmlBody;
    if (placeholders) template.placeholders = placeholders;
    if (isActive !== undefined) template.is_active = isActive;
    template.version += 1;
    await template.save();

    return sendResponse(res, {
      message: 'Certificate template updated successfully',
      data: template,
    });
  }

  /**
   * GET /certificates
   * Scoped certificates list.
   */
  async getCertificates(req, res) {
    const user = req.user;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const { scholarId, guideId, status, q } = req.query;

    const where = {};
    if (scholarId) where.scholar_id = scholarId;
    if (guideId) where.guide_id = guideId;
    if (status) where.status = status;
    if (q) {
      where.certificate_no = { [Op.like]: `%${q}%` };
    }

    const userRoles = (user.roles || []).map((r) => r.code);
    const isAdmin = userRoles.includes(ROLES.ADMIN);
    const isStaff = userRoles.includes(ROLES.STAFF);

    if (!isAdmin && !isStaff) {
      if (userRoles.includes(ROLES.SCHOLAR)) {
        const scholar = await Scholar.findOne({ where: { user_id: user.id } });
        where.scholar_id = scholar ? scholar.id : -1;
      } else if (userRoles.includes(ROLES.GUIDE)) {
        const guide = await Guide.findOne({ where: { user_id: user.id } });
        where.guide_id = guide ? guide.id : -1;
      }
    }

    const certificates = await Certificate.findAndCountAll({
      where,
      include: [
        { model: CertificateTemplate, as: 'template', attributes: ['name', 'type_code'] },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] },
        { model: User, as: 'generator', attributes: ['full_name'] },
      ],
      order: [['generated_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(certificates, page, limit);

    return sendResponse(res, {
      message: 'Certificates retrieved successfully',
      data: pagingData.items,
      meta: pagingData.meta,
    });
  }

  /**
   * POST /certificates
   * Generate official certificate.
   */
  async generateCertificate(req, res) {
    const user = req.user;
    const { templateId, scholarId, guideId, data } = req.body;

    if (!templateId) {
      throw ApiError.badRequest('templateId is required');
    }

    const cert = await certificateService.generateCertificate({
      templateId,
      scholarId,
      guideId,
      data,
      generatedByUserId: user.id,
    });

    return sendResponse(res, {
      status: 201,
      message: 'Certificate generated successfully',
      data: cert,
    });
  }

  /**
   * GET /certificates/:id
   */
  async getCertificateById(req, res) {
    const { id } = req.params;

    const cert = await Certificate.findByPk(id, {
      include: [
        { model: CertificateTemplate, as: 'template' },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] },
        { model: User, as: 'generator', attributes: ['full_name'] },
        { model: User, as: 'revoker', attributes: ['full_name'] },
      ],
    });

    if (!cert) {
      throw ApiError.notFound('Certificate not found');
    }

    return sendResponse(res, {
      message: 'Certificate details retrieved successfully',
      data: cert,
    });
  }

  /**
   * GET /certificates/:id/download
   * Streams printable HTML view or PDF representation.
   */
  async downloadCertificate(req, res) {
    const { id } = req.params;

    const cert = await Certificate.findByPk(id, {
      include: [{ model: CertificateTemplate, as: 'template' }],
    });

    if (!cert) {
      throw ApiError.notFound('Certificate not found');
    }

    const html = cert.data_snapshot?.rendered_html || cert.template?.html_body || '<p>Official Certificate</p>';

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="${cert.certificate_no}.html"`);
    return res.send(html);
  }

  /**
   * POST /certificates/:id/revoke
   */
  async revokeCertificate(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const revoked = await certificateService.revokeCertificate(id, {
      reason,
      revokedByUserId: user.id,
    });

    return sendResponse(res, {
      message: 'Certificate revoked successfully',
      data: revoked,
    });
  }

  /**
   * GET /public/verify-certificate/:certificateNo
   */
  async verifyCertificate(req, res) {
    const { certificateNo } = req.params;
    const result = await certificateService.verifyCertificate(certificateNo);
    return sendResponse(res, {
      message: 'Certificate validation completed',
      data: result,
    });
  }
}

export const certificatesController = new CertificatesController();
export default certificatesController;
