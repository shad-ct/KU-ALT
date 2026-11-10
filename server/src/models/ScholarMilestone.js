import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ScholarMilestone extends Model {}

ScholarMilestone.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'scholar_milestones',
    timestamps: true,
    underscored: true,
  }
);

export default ScholarMilestone;
