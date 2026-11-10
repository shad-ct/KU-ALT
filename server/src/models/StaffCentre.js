import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class StaffCentre extends Model {}

StaffCentre.init(
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'staff_centres',
    timestamps: true,
    underscored: true,
  }
);

export default StaffCentre;
