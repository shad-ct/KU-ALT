import { ZodError } from 'zod';
import { 
  UniqueConstraintError, 
  ForeignKeyConstraintError, 
  DatabaseError 
} from 'sequelize';
import { ApiError } from '../utils/ApiError.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_CODES } from '../config/constants.js';
import { logger } from './logger.middleware.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handled Operational Errors (ApiError)
  if (err instanceof ApiError) {
    logger.warn({
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
      url: req.originalUrl,
      method: req.method,
    }, 'Operational API error handled');

    return errorResponse(res, err.message, err.statusCode, err.details, err.code);
  }

  // 2. Zod Request Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      rule: e.code,
    }));

    logger.warn({
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
    }, 'Zod request validation failure');

    return errorResponse(
      res,
      'Validation failed for incoming payload',
      400,
      formattedErrors,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // 3. Sequelize Unique Constraint Violations
  if (err instanceof UniqueConstraintError) {
    const fields = Object.keys(err.fields || {});
    const fieldName = fields.length > 0 ? fields.join(', ') : 'field';
    const message = `A record with this ${fieldName} already exists in the system.`;

    logger.warn({
      url: req.originalUrl,
      fields: err.fields,
    }, 'Sequelize unique constraint violation');

    return errorResponse(res, message, 409, { fields: err.fields }, ERROR_CODES.CONFLICT);
  }

  // 4. Sequelize Foreign Key Constraint Violations
  if (err instanceof ForeignKeyConstraintError) {
    const message = 'Referenced related record does not exist or cannot be modified due to dependent constraints.';

    logger.warn({
      url: req.originalUrl,
      table: err.table,
      parent: err.parent?.message,
    }, 'Sequelize foreign key constraint violation');

    return errorResponse(res, message, 400, { table: err.table }, ERROR_CODES.VALIDATION_ERROR);
  }

  // 5. Sequelize Database General Errors
  if (err instanceof DatabaseError) {
    logger.error({
      url: req.originalUrl,
      sql: err.sql,
      message: err.message,
    }, 'Database execution error');

    return errorResponse(
      res,
      'A database operational error occurred',
      500,
      env.NODE_ENV === 'development' ? err.message : null,
      ERROR_CODES.INTERNAL_ERROR
    );
  }

  // 6. JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authentication token is invalid or expired', 401, null, ERROR_CODES.AUTH_INVALID);
  }

  // 7. Unhandled Server Exceptions (500)
  logger.error({
    err,
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
  }, 'Unhandled internal application error');

  return errorResponse(
    res,
    env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message,
    500,
    null,
    ERROR_CODES.INTERNAL_ERROR
  );
};

