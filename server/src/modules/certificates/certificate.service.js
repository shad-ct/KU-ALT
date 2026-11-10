import {
  Certificate,
  CertificateTemplate,
  Scholar,
  Guide,
  User,
  Department,
  ResearchCentre,
  FileAsset,
} from '../../models/index.js';
import { getNextSequence } from '../../utils/counter.js';
import { ApiError } from '../../utils/ApiError.js';
import { withTx } from '../../db/transaction.js';

export class CertificateService {
  /**
   * Safely replaces {{key}} placeholders in template HTML.
   */
  renderTemplate(htmlTemplate, data = {}) {
    let output = htmlTemplate;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      output = output.replace(regex, value != null ? String(value) : '');
    }
    return output;
  }

  /**
   * Generates a new official certificate.
   */
  async generateCertificate({ templateId, scholarId, guideId, data = {}, generatedByUserId }) {
    return withTx(async (tx) => {
      const template = await CertificateTemplate.findByPk(templateId, { transaction: tx });
      if (!template || !template.is_active) {
        throw ApiError.badRequest('Invalid or inactive certificate template', 'INVALID_TEMPLATE');
      }

      let scholar = null;
      let guide = null;
      const snapshot = { ...data };

      if (scholarId) {
        scholar = await Scholar.findByPk(scholarId, {
          include: [
            { model: User, as: 'user' },
            { model: Department, as: 'department' },
            { model: ResearchCentre, as: 'research_centre' },
            { model: Guide, as: 'guide', include: [{ model: User, as: 'user' }] },
          ],
          transaction: tx,
        });

        if (scholar) {
          snapshot.scholar_name = scholar.user?.full_name || '';
          snapshot.registration_no = scholar.registration_no || '';
          snapshot.department = scholar.department?.name || '';
          snapshot.centre = scholar.research_centre?.name || '';
          snapshot.research_title = scholar.research_title || '';
          snapshot.guide_name = scholar.guide?.user?.full_name || '';
        }
      }

      if (guideId && !scholarId) {
        guide = await Guide.findByPk(guideId, {
          include: [
            { model: User, as: 'user' },
            { model: Department, as: 'department' },
            { model: ResearchCentre, as: 'research_centre' },
          ],
          transaction: tx,
        });

        if (guide) {
          snapshot.guide_name = guide.user?.full_name || '';
          snapshot.department = guide.department?.name || '';
          snapshot.centre = guide.research_centre?.name || '';
        }
      }

      const certificateNo = await getNextSequence(tx, 'cert_no', 'KU-CERT', 5);
      const todayStr = new Date().toISOString().split('T')[0];

      snapshot.certificate_no = certificateNo;
      snapshot.issue_date = todayStr;

      const renderedHtml = this.renderTemplate(template.html_body, snapshot);
      snapshot.rendered_html = renderedHtml;

      const certificate = await Certificate.create(
        {
          certificate_no: certificateNo,
          template_id: template.id,
          scholar_id: scholarId || null,
          guide_id: guideId || null,
          data_snapshot: snapshot,
          generated_by: generatedByUserId,
          generated_at: new Date(),
          status: 'ISSUED',
        },
        { transaction: tx }
      );

      return certificate;
    });
  }

  /**
   * Revokes a previously issued certificate.
   */
  async revokeCertificate(certificateId, { reason, revokedByUserId }) {
    const certificate = await Certificate.findByPk(certificateId);
    if (!certificate) {
      throw ApiError.notFound('Certificate not found');
    }

    if (certificate.status === 'REVOKED') {
      throw ApiError.badRequest('Certificate has already been revoked', 'ALREADY_REVOKED');
    }

    certificate.status = 'REVOKED';
    certificate.revocation_reason = reason || 'Revoked by authority';
    certificate.revoked_at = new Date();
    certificate.revoked_by = revokedByUserId;
    await certificate.save();

    return certificate;
  }

  /**
   * Public validation of a certificate.
   */
  async verifyCertificate(certificateNo) {
    const certificate = await Certificate.findOne({
      where: { certificate_no: certificateNo },
      include: [
        { model: CertificateTemplate, as: 'template', attributes: ['name', 'type_code'] },
        { model: Scholar, as: 'scholar', include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
        { model: Guide, as: 'guide', include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
      ],
    });

    if (!certificate) {
      return {
        isValid: false,
        message: 'No record found with this certificate number in Kannur University R&D Cell registry.',
      };
    }

    if (certificate.status === 'REVOKED') {
      return {
        isValid: false,
        status: 'REVOKED',
        certificateNo: certificate.certificate_no,
        revokedAt: certificate.revoked_at,
        reason: certificate.revocation_reason,
        message: 'This certificate was formally revoked by Kannur University.',
      };
    }

    return {
      isValid: true,
      status: 'ISSUED',
      certificateNo: certificate.certificate_no,
      issuedTo: certificate.scholar?.user?.full_name || certificate.guide?.user?.full_name || 'Authorized Recipient',
      templateName: certificate.template?.name,
      issueDate: certificate.generated_at,
      snapshot: {
        registrationNo: certificate.data_snapshot?.registration_no,
        department: certificate.data_snapshot?.department,
        centre: certificate.data_snapshot?.centre,
      },
    };
  }
}

export const certificateService = new CertificateService();
export default certificateService;
