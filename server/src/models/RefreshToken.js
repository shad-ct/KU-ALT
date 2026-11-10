import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class RefreshToken extends Model {
  isExpired() {
    return new Date() >= new Date(this.expires_at);
  }

  isRevoked() {
    return this.revoked_at !== null;
  }
}

RefreshToken.init(
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
    family_id: {
      type: DataTypes.STRING(64),
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
    revoked_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    replaced_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
  }
);

export default RefreshToken;

