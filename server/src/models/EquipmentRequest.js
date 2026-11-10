import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentRequest extends Model {}

EquipmentRequest.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    request_no: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    guide_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    equipment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requested_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_return_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'ALLOCATED', 'RETURNED', 'OVERDUE', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decided_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    decided_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    was_overdue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'equipment_requests',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentRequest;
