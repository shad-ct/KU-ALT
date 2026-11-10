import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class PasswordReset extends Model {
  isExpired() {
    return new Date() >= new Date(this.expires_at);
  }

  isUsed() {
    return this.used_at !== null;
  }
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'password_resets',
    timestamps: true,
    underscored: true,
  }
);

export default PasswordReset;

