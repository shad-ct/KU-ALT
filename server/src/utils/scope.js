import { Op } from 'sequelize';
import { ROLES, ERROR_CODES } from '../config/constants.js';
import { ApiError } from './ApiError.js';

/**
 * Builds a Sequelize WHERE clause fragment enforcing data tenancy & scoping by role.
 * 
 * @param {object} user - User token payload ({ sub, activeRole, departmentId, researchCentreId, assignedCentres })
 * @param {string} resource - 'scholar' | 'guide' | 'application' | 'equipment' | 'centre' | 'department'
 * @returns {object} Sequelize WHERE condition object
 */
export const buildScope = (user, resource) => {
  if (!user) {
    throw ApiError.unauthorized('User context required for scope resolution');
  }

  // 1. Super Admin has unrestricted scope across all resources
  if (user.activeRole === ROLES.ADMIN) {
    return {};
  }

  switch (user.activeRole) {
    case ROLES.SCHOLAR:
      if (resource === 'scholar') {
        return { user_id: user.sub };
      }
      if (resource === 'application') {
        return { subject_user_id: user.sub };
      }
      if (resource === 'equipment_request') {
        return { scholar_user_id: user.sub };
      }
      // Scholars can view equipment in their own department
      if (resource === 'equipment') {
        return user.departmentId ? { department_id: user.departmentId } : {};
      }
      return { user_id: user.sub };

    case ROLES.GUIDE:
      if (resource === 'scholar') {
        // Scholar is supervised by this guide
        return { guide_user_id: user.sub };
      }
      if (resource === 'application') {
        return { guide_user_id: user.sub };
      }
      if (resource === 'guide') {
        return { user_id: user.sub };
      }
      return {};

    case ROLES.CENTRE_HEAD:
      if (!user.researchCentreId) {
        throw new ApiError(403, ERROR_CODES.SCOPE_VIOLATION, 'Centre Head has no research centre assigned');
      }
      // Scoped strictly to their affiliated college research centre
      return { research_centre_id: user.researchCentreId };

    case ROLES.DRC_CONVENOR:
      if (!user.departmentId) {
        throw new ApiError(403, ERROR_CODES.SCOPE_VIOLATION, 'DRC Convenor has no subject department assigned');
      }
      // Scoped to the entire department (all affiliated and campus centres in this subject)
      return { department_id: user.departmentId };

    case ROLES.STAFF:
      // Staff assigned to specific research centres
      if (user.assignedCentres && Array.isArray(user.assignedCentres) && user.assignedCentres.length > 0) {
        return { research_centre_id: { [Op.in]: user.assignedCentres } };
      }
      // Empty list means all centres handled
      return {};

    default:
      throw new ApiError(403, ERROR_CODES.SCOPE_VIOLATION, `Unknown role scope: ${user.activeRole}`);
  }
};

/**
 * Asserts that a loaded resource is within the user's institutional scope.
 * If not, throws 404 (for reads) or 403 (for writes) per 07 §2.
 * 
 * @param {object} user - User token payload
 * @param {object} record - Sequelize instance or plain object
 * @param {string} resourceType - Resource name
 * @param {boolean} [isWrite=false] - Whether this is a mutating write action
 */
export const assertInScope = (user, record, resourceType, isWrite = false) => {
  if (!record) {
    throw ApiError.notFound(`${resourceType} not found`);
  }

  if (user.activeRole === ROLES.ADMIN) {
    return;
  }

  let inScope = true;

  if (user.activeRole === ROLES.SCHOLAR) {
    const ownerId = record.subject_user_id || record.user_id || record.scholar_user_id;
    if (ownerId && ownerId.toString() !== user.sub.toString()) {
      inScope = false;
    }
  } else if (user.activeRole === ROLES.GUIDE) {
    const guideId = record.guide_user_id || record.user_id;
    if (guideId && guideId.toString() !== user.sub.toString()) {
      inScope = false;
    }
  } else if (user.activeRole === ROLES.CENTRE_HEAD) {
    if (record.research_centre_id && record.research_centre_id.toString() !== user.researchCentreId?.toString()) {
      inScope = false;
    }
  } else if (user.activeRole === ROLES.DRC_CONVENOR) {
    if (record.department_id && record.department_id.toString() !== user.departmentId?.toString()) {
      inScope = false;
    }
  }

  if (!inScope) {
    if (isWrite) {
      throw new ApiError(
        403,
        ERROR_CODES.SCOPE_VIOLATION,
        `You do not have institutional authority to act on this ${resourceType}`
      );
    } else {
      // 404 for reads per 07 §2 to avoid leaking existence
      throw ApiError.notFound(`${resourceType} not found`);
    }
  }
};

