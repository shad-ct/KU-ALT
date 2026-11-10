import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class OfficialReplyFile extends Model {}

OfficialReplyFile.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    reply_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'official_reply_files',
    timestamps: true,
    underscored: true,
  }
);

export default OfficialReplyFile;
