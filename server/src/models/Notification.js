import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class NotificationBroadcast extends Model {}

NotificationBroadcast.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audience: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    channels: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'INAPP',
    },
    scheduled_for: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notification_broadcasts',
    timestamps: true,
    underscored: true,
  }
);

export class Notification extends Model {
  isRead() {
    return this.read_at !== null;
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recipient_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    broadcast_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'GENERAL',
        'INDIVIDUAL',
        'APPLICATION_STATUS',
        'RAC_ALERT',
        'ANNOUNCEMENT',
        'EQUIPMENT'
      ),
      allowNull: false,
      defaultValue: 'GENERAL',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
  }
);

export default Notification;

