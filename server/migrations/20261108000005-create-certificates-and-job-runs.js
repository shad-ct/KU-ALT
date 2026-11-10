import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  // 1. certificate_templates
  await queryInterface.createTable('certificate_templates', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    type_code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    html_body: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
    },
    placeholders: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // 2. certificates
  await queryInterface.createTable('certificates', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    certificate_no: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    template_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'certificate_templates',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'scholars',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    guide_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'guides',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    data_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'file_assets',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    generated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    generated_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('ISSUED', 'REVOKED'),
      allowNull: false,
      defaultValue: 'ISSUED',
    },
    revoked_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    revocation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    revoked_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // 3. job_runs
  await queryInterface.createTable('job_runs', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    job_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    run_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    finished_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('RUNNING', 'SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'RUNNING',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex('job_runs', ['job_key', 'run_date'], {
    unique: true,
    name: 'uq_job_runs_key_date',
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('job_runs');
  await queryInterface.dropTable('certificates');
  await queryInterface.dropTable('certificate_templates');
};

