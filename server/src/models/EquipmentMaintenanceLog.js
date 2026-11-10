import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentMaintenanceLog extends Model {}

EquipmentMaintenanceLog.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    unit_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    logged_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    next_due: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment_maintenance_log',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentMaintenanceLog;
