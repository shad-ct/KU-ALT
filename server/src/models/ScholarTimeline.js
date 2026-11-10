import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ScholarTimeline extends Model {}

ScholarTimeline.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    date_of_registration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    commencement_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    submission_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    date_of_submission: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'scholar_timeline',
    timestamps: true,
    underscored: true,
  }
);

export default ScholarTimeline;
