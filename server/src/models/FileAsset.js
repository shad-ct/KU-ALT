import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class FileAsset extends Model {}

FileAsset.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    stored_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    mime_type: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    size_bytes: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    checksum_sha256: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    uploaded_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    owner_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    storage_path: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'file_assets',
    timestamps: true,
    underscored: true,
  }
);

export default FileAsset;

