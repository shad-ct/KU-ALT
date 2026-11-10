/**
 * Standard API Response Envelope
 * Format: { success: boolean, data: any, message: string, errors?: any, meta?: any }
 */

export const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    data,
    message,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null, code = 'INTERNAL_ERROR') => {
  const payload = {
    success: false,
    message,
    code,
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

export const sendResponse = (res, { message = 'Success', data = null, status = 200, statusCode, meta = null }) => {
  return successResponse(res, data, message, statusCode || status, meta);
};
