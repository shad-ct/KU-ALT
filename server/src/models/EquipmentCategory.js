import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class EquipmentCategory extends Model {}

EquipmentCategory.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment_categories',
    timestamps: true,
    underscored: true,
  }
);

export default EquipmentCategory;
