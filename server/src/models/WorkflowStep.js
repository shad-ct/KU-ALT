import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class WorkflowStep extends Model {}

WorkflowStep.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    definition_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    role_code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    institution_type: {
      type: DataTypes.ENUM('ANY', 'UNIVERSITY_DEPARTMENT', 'AFFILIATED_COLLEGE'),
      allowNull: false,
      defaultValue: 'ANY',
    },
    scope_rule: {
      type: DataTypes.ENUM('ASSIGNED_GUIDE', 'SAME_CENTRE', 'SAME_DEPARTMENT', 'ANY'),
      allowNull: false,
      defaultValue: 'ANY',
    },
    allowed_actions: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'VERIFY,FORWARD,REJECT,RETURN',
    },
    require_remarks_on_reject: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sla_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'workflow_steps',
    timestamps: true,
    underscored: true,
  }
);

export default WorkflowStep;
