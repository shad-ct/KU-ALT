import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Designation extends Model {}

Designation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'designations',
    timestamps: true,
    underscored: true,
  }
);

export default Designation;

