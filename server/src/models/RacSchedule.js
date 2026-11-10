import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class RacSchedule extends Model {}

RacSchedule.init(
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
    meeting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'DONE', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'SCHEDULED',
    },
    minutes_file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'rac_schedule',
    timestamps: true,
    underscored: true,
  }
);

export default RacSchedule;
