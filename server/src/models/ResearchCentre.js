import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';
import { INSTITUTION_TYPE } from '../config/constants.js';

export class ResearchCentre extends Model {
  /**
   * Evaluates if this centre is permitted to accept scholar/guide signups.
   * Affiliated colleges require an appointed centre head before signups can be approved.
   */
  canAcceptSignups() {
    if (!this.is_active) return false;
    if (this.institution_type === INSTITUTION_TYPE.AFFILIATED_COLLEGE) {
      return this.centre_head_user_id !== null && this.centre_head_user_id !== undefined;
    }
    return true;
  }
}

ResearchCentre.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    institution_type: {
      type: DataTypes.ENUM(
        INSTITUTION_TYPE.UNIVERSITY_DEPARTMENT,
        INSTITUTION_TYPE.AFFILIATED_COLLEGE
      ),
      allowNull: false,
    },
    centre_head_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    college_name: {
      type: DataTypes.STRING(255),
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
    tableName: 'research_centres',
    timestamps: true,
    underscored: true,
  }
);

export default ResearchCentre;

