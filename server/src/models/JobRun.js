import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class JobRun extends Model {}

JobRun.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    job_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    run_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    finished_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('RUNNING', 'SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'RUNNING',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'job_runs',
    timestamps: true,
    underscored: true,
  }
);

export default JobRun;
