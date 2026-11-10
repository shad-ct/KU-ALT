import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class WorkflowInstanceStep extends Model {}

WorkflowInstanceStep.init(
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
    scope_rule: {
      type: DataTypes.ENUM('ASSIGNED_GUIDE', 'SAME_CENTRE', 'SAME_DEPARTMENT', 'ANY'),
      allowNull: false,
      defaultValue: 'ANY',
    },
    allowed_actions: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sla_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
    },
    status: {
      type: DataTypes.ENUM('WAITING', 'ACTIVE', 'DONE', 'SKIPPED'),
      allowNull: false,
      defaultValue: 'WAITING',
    },
    acted_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    acted_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'workflow_instance_steps',
    timestamps: true,
    underscored: true,
  }
);

export default WorkflowInstanceStep;
