import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class ApplicationHistory extends Model {}

ApplicationHistory.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    from_status: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    to_status: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    actor_role: {
      type: DataTypes.STRING(64),
      allowNull: false,
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
    tableName: 'application_history',
    timestamps: false,
    underscored: true,
  }
);

export default ApplicationHistory;
