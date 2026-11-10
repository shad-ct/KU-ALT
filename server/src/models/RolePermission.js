import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class RolePermission extends Model {}

RolePermission.init(
  {
    role_id: {
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
    tableName: 'role_permissions',
    timestamps: true,
    underscored: true,
  }
);

export default RolePermission;

