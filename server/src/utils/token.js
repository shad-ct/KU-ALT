import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Generates short-lived Access Token (15 mins)
 */
export const generateAccessToken = (user, activeRole, permissions = []) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      status: user.status,
      activeRole,
      departmentId: user.department_id,
      researchCentreId: user.research_centre_id,
      permissions,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
};

/**
 * Generates an opaque Refresh Token string
 */
export const generateRefreshTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Generates SHA-256 hash for secure token storage
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verifies and decodes Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

