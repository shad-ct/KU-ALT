import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    actor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    actor_role: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    before_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    after_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    request_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
  }
);

export default AuditLog;

