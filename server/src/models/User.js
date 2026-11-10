import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../db/index.js';
import { USER_STATUS } from '../config/constants.js';

export class User extends Model {
  /**
   * Compares plain password with stored hash
   * @param {string} candidatePassword
   * @returns {Promise<boolean>}
   */
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  /**
   * Checks if user account is currently locked out
   * Handles UTC timestamps correctly when dateStrings is true.
   * @returns {boolean}
   */
  isLocked() {
    if (!this.locked_until) return false;
    const lockDate =
      typeof this.locked_until === 'string'
        ? new Date(this.locked_until.endsWith('Z') ? this.locked_until : this.locked_until.replace(' ', 'T') + 'Z')
        : new Date(this.locked_until);
    return lockDate.getTime() > Date.now();
  }

  /**
   * Safe JSON representation stripping sensitive hashes
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('full_name');
      },
      set(val) {
        this.setDataValue('full_name', val);
      },
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        USER_STATUS.PENDING_APPROVAL,
        USER_STATUS.ACTIVE,
        USER_STATUS.REJECTED,
        USER_STATUS.INACTIVE
      ),
      allowNull: false,
      defaultValue: USER_STATUS.PENDING_APPROVAL,
    },
    must_change_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verified_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    failed_login_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password_hash') && !user.password_hash.startsWith('$2')) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  }
);

export default User;
