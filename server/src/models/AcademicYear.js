import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class AcademicYear extends Model {}

AcademicYear.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'academic_years',
    timestamps: true,
    underscored: true,
  }
);

export default AcademicYear;

