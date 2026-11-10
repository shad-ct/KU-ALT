import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ApplicationDocument extends Model {}

ApplicationDocument.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    doc_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'application_documents',
    timestamps: true,
    underscored: true,
  }
);

export default ApplicationDocument;
