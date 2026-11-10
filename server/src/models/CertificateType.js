import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class CertificateType extends Model {}

CertificateType.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    template_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'certificate_types',
    timestamps: true,
    underscored: true,
  }
);

export default CertificateType;

