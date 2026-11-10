import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
import { ERROR_CODES } from '../config/constants.js';

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 10 : 200, // relaxed for local dev/testing
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        ERROR_CODES.RATE_LIMITED,
        'Too many authentication attempts. Please wait 1 minute before trying again.'
      )
    );
  },
});

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // relaxed for development
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        ERROR_CODES.RATE_LIMITED,
        'High request volume detected. Please slow down.'
      )
    );
  },
});
