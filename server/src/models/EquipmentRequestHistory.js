import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentRequestHistory extends Model {}

EquipmentRequestHistory.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    from_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    to_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'equipment_request_history',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentRequestHistory;
