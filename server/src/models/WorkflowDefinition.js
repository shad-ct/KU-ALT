import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class WorkflowDefinition extends Model {}

WorkflowDefinition.init(
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
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'workflow_definitions',
    timestamps: true,
    underscored: true,
  }
);

export default WorkflowDefinition;
