import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Department extends Model {}

Department.init(
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
    drc_convenor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
    underscored: true,
  }
);

export default Department;

