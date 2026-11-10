import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class UserPermission extends Model {}

UserPermission.init(
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'user_permissions',
    timestamps: true,
    underscored: true,
  }
);

export default UserPermission;

