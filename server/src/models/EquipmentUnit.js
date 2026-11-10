import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentUnit extends Model {}

EquipmentUnit.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    equipment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    asset_tag: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    serial_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    condition: {
      type: DataTypes.ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'),
      allowNull: false,
      defaultValue: 'NEW',
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    warranty_until: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment_units',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentUnit;
