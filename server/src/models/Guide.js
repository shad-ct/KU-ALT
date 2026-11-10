import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Guide extends Model {}

Guide.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    designation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    registration_status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    approved_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    valid_till: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    max_scholars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8,
    },
    phone_alt: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'guides',
    timestamps: true,
    underscored: true,
  }
);

export default Guide;
