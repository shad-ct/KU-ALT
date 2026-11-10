import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ApplicationType extends Model { }

ApplicationType.init(
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
    kind: {
      type: DataTypes.ENUM('REGISTRATION', 'SERVICE'),
      allowNull: false,
    },
    form_schema: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    required_docs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    workflow_definition_id: {
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
    tableName: 'application_types',
    timestamps: true,
    underscored: true,
  }
);

export default ApplicationType;
