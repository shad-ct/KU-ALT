export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Machine-readable error code (from constants.ERROR_CODES)
   * @param {string} message - Human-readable explanation
   * @param {any} [details=null] - Additional validation or error context
   */
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'VALIDATION_ERROR', details = null) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = 'Authentication required', code = 'AUTH_INVALID') {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'Permission denied', code = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message = 'State conflict', code = 'CONFLICT', details = null) {
    return new ApiError(409, code, message, details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message);
  }
}

