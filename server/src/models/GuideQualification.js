import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class GuideQualification extends Model {}

GuideQualification.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    guide_id: {
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
  },
  {
    sequelize,
    tableName: 'guide_qualifications',
    timestamps: true,
    underscored: true,
  }
);

export default GuideQualification;
