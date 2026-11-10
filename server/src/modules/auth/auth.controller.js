import { AuthService } from './auth.service.js';
import { successResponse } from '../../utils/response.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth',
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = await AuthService.login({ email, password, ip, userAgent });

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return successResponse(
    res,
    {
      user: result.user,
      accessToken: result.accessToken,
      activeRole: result.activeRole,
      roles: result.roles,
      permissions: result.permissions,
    },
    'Authentication successful'
  );
};

export const refresh = async (req, res) => {
  const refreshTokenString = req.cookies?.refreshToken || req.body?.refreshToken;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const result = await AuthService.refresh({ refreshTokenString, ip, userAgent });

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

  return successResponse(
    res,
    {
      user: result.user,
      accessToken: result.accessToken,
      activeRole: result.activeRole,
      roles: result.roles,
      permissions: result.permissions,
    },
    'Token refreshed successfully'
  );
};

export const logout = async (req, res) => {
  const refreshTokenString = req.cookies?.refreshToken || req.body?.refreshToken;
  const userId = req.user?.sub;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  await AuthService.logout({ refreshTokenString, userId, ip, userAgent });

  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  return successResponse(res, null, 'Logged out successfully');
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.sub;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  await AuthService.changePassword({ userId, oldPassword, newPassword, ip, userAgent });

  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  return successResponse(
    res,
    null,
    'Password changed successfully. Please log in with your new credentials.'
  );
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  const result = await AuthService.forgotPassword({ email, ip, userAgent });

  return successResponse(
    res,
    env.NODE_ENV === 'development' || env.NODE_ENV === 'test' ? { resetToken: result.resetToken } : null,
    'If an account with that email exists, password reset instructions have been dispatched.'
  );
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  await AuthService.resetPassword({ token, newPassword, ip, userAgent });

  return successResponse(
    res,
    null,
    'Password has been reset successfully. You may now log in.'
  );
};

export const getMe = async (req, res) => {
  const userId = req.user.sub;
  const result = await AuthService.getMe(userId);

  return successResponse(res, result, 'User profile retrieved successfully');
};

