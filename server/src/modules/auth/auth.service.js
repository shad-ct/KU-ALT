import crypto from 'crypto';
import { Op } from 'sequelize';
import {
  User,
  Role,
  Permission,
  RefreshToken,
  PasswordReset,
  AuditLog,
} from '../../models/index.js';
import {
  generateAccessToken,
  generateRefreshTokenString,
  hashToken,
} from '../../utils/token.js';
import { ApiError } from '../../utils/ApiError.js';
import { ERROR_CODES, USER_STATUS } from '../../config/constants.js';
import { logger } from '../../middleware/logger.middleware.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export class AuthService {
  /**
   * User login with failure lockout and refresh token family issuance
   */
  static async login({ email, password, ip, userAgent }) {
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }],
        },
        {
          model: Permission,
          as: 'direct_permissions',
        },
      ],
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', ERROR_CODES.AUTH_INVALID);
    }

    // Check account lockout
    if (user.isLocked()) {
      const lockDate =
        typeof user.locked_until === 'string'
          ? new Date(user.locked_until.endsWith('Z') ? user.locked_until : user.locked_until.replace(' ', 'T') + 'Z')
          : new Date(user.locked_until);

      const remainingMinutes = Math.max(1, Math.ceil((lockDate.getTime() - Date.now()) / (1000 * 60)));
      throw new ApiError(
        401,
        ERROR_CODES.AUTH_LOCKED,
        `Account is temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minute(s).`
      );
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failed_login_count += 1;
      if (user.failed_login_count >= MAX_FAILED_ATTEMPTS) {
        user.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
        logger.warn({ email, ip }, 'Account locked due to 5 consecutive failed login attempts');
      }
      await user.save();

      await AuditLog.create({
        actor_user_id: user.id,
        action: 'LOGIN_FAILURE',
        entity_type: 'USER',
        entity_id: user.id,
        ip,
        user_agent: userAgent,
        before_json: { failedAttempts: user.failed_login_count },
      });

      throw ApiError.unauthorized('Invalid email or password', ERROR_CODES.AUTH_INVALID);
    }

    // Login successful - reset failure counters
    user.failed_login_count = 0;
    user.locked_until = null;
    user.last_login_at = new Date();
    await user.save();

    // Consolidate roles and permissions
    const roles = user.roles?.map((r) => r.code) || [];
    const activeRole = roles[0] || 'SCHOLAR';

    const permissionSet = new Set();
    user.roles?.forEach((r) => {
      r.permissions?.forEach((p) => permissionSet.add(p.code));
    });
    user.direct_permissions?.forEach((p) => permissionSet.add(p.code));
    const permissions = Array.from(permissionSet);

    // Generate Tokens
    const accessToken = generateAccessToken(user, activeRole, permissions);
    const refreshTokenString = generateRefreshTokenString();
    const tokenHash = hashToken(refreshTokenString);
    const familyId = crypto.randomUUID();

    await RefreshToken.create({
      user_id: user.id,
      family_id: familyId,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      user_agent: userAgent,
      ip,
    });

    await AuditLog.create({
      actor_user_id: user.id,
      actor_role: activeRole,
      action: 'LOGIN_SUCCESS',
      entity_type: 'USER',
      entity_id: user.id,
      ip,
      user_agent: userAgent,
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken: refreshTokenString,
      activeRole,
      roles,
      permissions,
    };
  }

  /**
   * Refreshes access token with strict refresh token rotation & reuse detection
   */
  static async refresh({ refreshTokenString, ip, userAgent }) {
    if (!refreshTokenString) {
      throw ApiError.unauthorized('Refresh token required', ERROR_CODES.AUTH_INVALID);
    }

    const tokenHash = hashToken(refreshTokenString);
    const storedToken = await RefreshToken.findOne({
      where: { token_hash: tokenHash },
    });

    // Reuse detection: If token exists but was already revoked, revoke whole family
    if (storedToken && (storedToken.isRevoked() || storedToken.replaced_by)) {
      logger.error(
        { userId: storedToken.user_id, familyId: storedToken.family_id },
        'SECURITY ALERT: Refresh token reuse detected! Invalidating all tokens in family.'
      );

      await RefreshToken.update(
        { revoked_at: new Date() },
        { where: { family_id: storedToken.family_id } }
      );

      await AuditLog.create({
        actor_user_id: storedToken.user_id,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        entity_type: 'REFRESH_TOKEN',
        entity_id: storedToken.id,
        ip,
        user_agent: userAgent,
      });

      throw ApiError.unauthorized(
        'Compromised refresh token detected. All active sessions have been invalidated.',
        ERROR_CODES.AUTH_INVALID
      );
    }

    if (!storedToken || storedToken.isExpired()) {
      throw ApiError.unauthorized('Invalid or expired refresh token', ERROR_CODES.AUTH_INVALID);
    }

    const user = await User.findByPk(storedToken.user_id, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }],
        },
        {
          model: Permission,
          as: 'direct_permissions',
        },
      ],
    });

    if (!user || user.status === USER_STATUS.DEACTIVATED) {
      throw ApiError.unauthorized('Account is not active', ERROR_CODES.AUTH_INVALID);
    }

    // Rotate token
    const newRefreshTokenString = generateRefreshTokenString();
    const newHash = hashToken(newRefreshTokenString);

    storedToken.revoked_at = new Date();
    storedToken.replaced_by = newHash;
    await storedToken.save();

    await RefreshToken.create({
      user_id: user.id,
      family_id: storedToken.family_id,
      token_hash: newHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user_agent: userAgent,
      ip,
    });

    const roles = user.roles?.map((r) => r.code) || [];
    const activeRole = roles[0] || 'SCHOLAR';

    const permissionSet = new Set();
    user.roles?.forEach((r) => {
      r.permissions?.forEach((p) => permissionSet.add(p.code));
    });
    user.direct_permissions?.forEach((p) => permissionSet.add(p.code));
    const permissions = Array.from(permissionSet);

    const accessToken = generateAccessToken(user, activeRole, permissions);

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
      user: user.toJSON(),
      activeRole,
      roles,
      permissions,
    };
  }

  /**
   * User logout - revokes the current refresh token
   */
  static async logout({ refreshTokenString, userId, ip, userAgent }) {
    if (refreshTokenString) {
      const tokenHash = hashToken(refreshTokenString);
      await RefreshToken.update(
        { revoked_at: new Date() },
        { where: { token_hash: tokenHash } }
      );
    }

    if (userId) {
      await AuditLog.create({
        actor_user_id: userId,
        action: 'LOGOUT',
        entity_type: 'USER',
        entity_id: userId,
        ip,
        user_agent: userAgent,
      });
    }

    return true;
  }

  /**
   * Password change by authenticated user
   */
  static async changePassword({ userId, oldPassword, newPassword, ip, userAgent }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw ApiError.badRequest('Current password does not match', ERROR_CODES.VALIDATION_ERROR);
    }

    user.password_hash = newPassword; // Hook hashes it
    user.must_change_password = false;
    await user.save();

    // Revoke all existing sessions for this user on password change
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: userId, revoked_at: null } }
    );

    await AuditLog.create({
      actor_user_id: userId,
      action: 'PASSWORD_CHANGE',
      entity_type: 'USER',
      entity_id: userId,
      ip,
      user_agent: userAgent,
    });

    return true;
  }

  /**
   * Initiates forgot-password workflow
   */
  static async forgotPassword({ email, ip, userAgent }) {
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // To prevent user enumeration, always return success message even if user doesn't exist
    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(resetToken);

    await PasswordReset.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
    });

    await AuditLog.create({
      actor_user_id: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity_type: 'USER',
      entity_id: user.id,
      ip,
      user_agent: userAgent,
    });

    // In local dev/test, token can be passed for test assertion
    return { success: true, resetToken };
  }

  /**
   * Resets password using single-use reset token
   */
  static async resetPassword({ token, newPassword, ip, userAgent }) {
    if (!token) {
      throw ApiError.badRequest('Reset token is required');
    }

    const tokenHash = hashToken(token);
    const resetRecord = await PasswordReset.findOne({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!resetRecord) {
      throw ApiError.badRequest(
        'Password reset link is invalid or has expired',
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const user = await User.findByPk(resetRecord.user_id);
    if (!user) {
      throw ApiError.notFound('Associated user not found');
    }

    user.password_hash = newPassword;
    user.must_change_password = false;
    await user.save();

    resetRecord.used_at = new Date();
    await resetRecord.save();

    // Revoke all refresh tokens
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: user.id, revoked_at: null } }
    );

    await AuditLog.create({
      actor_user_id: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entity_type: 'USER',
      entity_id: user.id,
      ip,
      user_agent: userAgent,
    });

    return true;
  }

  /**
   * Returns current user identity, permissions, and roles
   */
  static async getMe(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }],
        },
        {
          model: Permission,
          as: 'direct_permissions',
        },
      ],
    });

    if (!user) {
      throw ApiError.notFound('User record not found');
    }

    const roles = user.roles?.map((r) => r.code) || [];
    const permissionSet = new Set();
    user.roles?.forEach((r) => {
      r.permissions?.forEach((p) => permissionSet.add(p.code));
    });
    user.direct_permissions?.forEach((p) => permissionSet.add(p.code));

    return {
      user: user.toJSON(),
      roles,
      permissions: Array.from(permissionSet),
    };
  }
}

export default AuthService;
