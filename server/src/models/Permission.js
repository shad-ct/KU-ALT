import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    module: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
  }
);

export default Permission;

