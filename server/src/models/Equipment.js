import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Equipment extends Model {}

Equipment.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    usage_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tracking_mode: {
      type: DataTypes.ENUM('SERIALIZED', 'BULK'),
      allowNull: false,
      defaultValue: 'SERIALIZED',
    },
    total_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    available_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    max_loan_days: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 14,
    },
    requires_training: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment',
    timestamps: true,
    underscored: true,
  }
);

export default Equipment;
