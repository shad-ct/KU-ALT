import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class Scholar extends Model {}

Scholar.init(
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
    registration_no: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
    },
    programme_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    guide_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    co_guide_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    research_topic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    research_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    research_area: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    registration_status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'scholars',
    timestamps: true,
    underscored: true,
  }
);

export default Scholar;
