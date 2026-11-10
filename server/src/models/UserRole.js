import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class UserRole extends Model {}

UserRole.init(
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: true,
    underscored: true,
  }
);

export default UserRole;

