import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES, USER_STATUS, ROLES } from '../config/constants.js';

/**
 * Authentication Middleware
 * Validates Bearer token in Authorization header, extracts user context,
 * and enforces the account status gate (only /auth/me and registration status permitted if not ACTIVE).
 */
export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token missing or malformed', ERROR_CODES.AUTH_INVALID));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      ...payload,
      id: payload.sub,
      roles: payload.activeRole ? [{ code: payload.activeRole }] : [],
    };

    // Account Status Gate:
    // If user is not ACTIVE, strictly limit access to /auth/me and /registration/*
    if (req.user.status !== USER_STATUS.ACTIVE) {
      const allowedPaths = [
        '/api/v1/auth/me',
        '/api/v1/auth/logout',
        '/api/v1/registration/status',
        '/api/v1/registration/resubmit',
        '/registration/status',
      ];

      const currentPath = req.originalUrl.split('?')[0];
      const isAllowed = allowedPaths.some((p) => currentPath === p || currentPath.startsWith('/api/v1/registration/'));

      if (!isAllowed) {
        return next(
          new ApiError(
            403,
            ERROR_CODES.ACCOUNT_NOT_ACTIVE,
            'Account is pending institutional approval. You may only view registration status.'
          )
        );
      }
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, ERROR_CODES.AUTH_INVALID, 'Authentication token expired'));
    }
    return next(ApiError.unauthorized('Invalid authentication token', ERROR_CODES.AUTH_INVALID));
  }
};

/**
 * Permission Enforcement Middleware
 * Verifies that the authenticated user possesses the specific permission (or is ADMIN).
 * @param {string} requiredPermission - e.g. "scholar:read"
 */
export const permit = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', ERROR_CODES.AUTH_INVALID));
    }

    // Super Admin has all permissions by default
    if (req.user.activeRole === ROLES.ADMIN) {
      return next();
    }

    const permissions = req.user.permissions || [];
    if (!permissions.includes(requiredPermission)) {
      return next(
        ApiError.forbidden(
          `Permission denied: Missing '${requiredPermission}' access`,
          ERROR_CODES.FORBIDDEN
        )
      );
    }

    next();
  };
};

/**
 * Role Gate Middleware
 * Verifies that the user's active role matches one of the allowed roles.
 * @param  {...string} allowedRoles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', ERROR_CODES.AUTH_INVALID));
    }

    if (!allowedRoles.includes(req.user.activeRole) && req.user.activeRole !== ROLES.ADMIN) {
      return next(
        ApiError.forbidden(
          `Access restricted to roles: ${allowedRoles.join(', ')}`,
          ERROR_CODES.FORBIDDEN
        )
      );
    }

    next();
  };
};

