import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Certificate extends Model {}

Certificate.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    certificate_no: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    template_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    guide_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    data_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    generated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    generated_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('ISSUED', 'REVOKED'),
      allowNull: false,
      defaultValue: 'ISSUED',
    },
    revoked_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    revocation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    revoked_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'certificates',
    timestamps: true,
    underscored: true,
  }
);

export default Certificate;
