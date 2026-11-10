import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Setting extends Model {}

Setting.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    group: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'general',
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'settings',
    timestamps: true,
    underscored: true,
  }
);

export default Setting;

