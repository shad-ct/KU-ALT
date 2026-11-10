import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class OfficialReply extends Model {}

OfficialReply.init(
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
    by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    visible_to_scholar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sent_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'official_replies',
    timestamps: false,
    underscored: true,
  }
);

export default OfficialReply;
