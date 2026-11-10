import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ResearchProgramme extends Model {}

ResearchProgramme.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    duration_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'research_programmes',
    timestamps: true,
    underscored: true,
  }
);

export default ResearchProgramme;

