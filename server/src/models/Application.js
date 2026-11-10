import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Application extends Model {}

Application.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    application_no: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    application_type_id: {
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
    subject_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    institution_type: {
      type: DataTypes.ENUM('UNIVERSITY_DEPARTMENT', 'AFFILIATED_COLLEGE'),
      allowNull: false,
    },
    form_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'RETURNED', 'APPROVED', 'REJECTED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    current_step_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_role_code: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    decided_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'applications',
    timestamps: true,
    underscored: true,
  }
);

export default Application;
