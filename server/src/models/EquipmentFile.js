import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentFile extends Model {}

EquipmentFile.init(
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
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    kind: {
      type: DataTypes.ENUM('IMAGE', 'DOCUMENT'),
      allowNull: false,
      defaultValue: 'IMAGE',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'equipment_files',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentFile;
