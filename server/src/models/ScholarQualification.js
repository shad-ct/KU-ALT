import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ScholarQualification extends Model {}

ScholarQualification.init(
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
    degree: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'scholar_qualifications',
    timestamps: true,
    underscored: true,
  }
);

export default ScholarQualification;
