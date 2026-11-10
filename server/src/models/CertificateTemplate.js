import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class CertificateTemplate extends Model {}

CertificateTemplate.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    type_code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    html_body: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
    },
    placeholders: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'certificate_templates',
    timestamps: true,
    underscored: true,
  }
);

export default CertificateTemplate;
