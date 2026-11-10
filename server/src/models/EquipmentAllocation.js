import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentAllocation extends Model {}

EquipmentAllocation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    equipment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    unit_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    allotted_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    allocated_on: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expected_return_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    return_condition: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    return_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    received_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'OVERDUE', 'RETURNED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    active_unit_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment_allocations',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentAllocation;
