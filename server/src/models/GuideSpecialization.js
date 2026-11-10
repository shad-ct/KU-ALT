import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class GuideSpecialization extends Model {}

GuideSpecialization.init(
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
    area: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'guide_specializations',
    timestamps: true,
    underscored: true,
  }
);

export default GuideSpecialization;
