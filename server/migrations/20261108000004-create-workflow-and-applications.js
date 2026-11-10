import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  // 1. Workflow definitions
  await queryInterface.createTable('workflow_definitions', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

  // 2. Workflow steps (definition templates)
  await queryInterface.createTable('workflow_steps', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    definition_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'workflow_definitions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    role_code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    institution_type: {
      type: DataTypes.ENUM('ANY', 'UNIVERSITY_DEPARTMENT', 'AFFILIATED_COLLEGE'),
      allowNull: false,
      defaultValue: 'ANY',
    },
    scope_rule: {
      type: DataTypes.ENUM('ASSIGNED_GUIDE', 'SAME_CENTRE', 'SAME_DEPARTMENT', 'ANY'),
      allowNull: false,
      defaultValue: 'ANY',
    },
    allowed_actions: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'VERIFY,FORWARD,REJECT,RETURN',
    },
    require_remarks_on_reject: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sla_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

  await queryInterface.addConstraint('workflow_steps', {
    fields: ['definition_id', 'step_order'],
    type: 'unique',
    name: 'uq_workflow_steps_def_order',
  });

  // 3. Applications table
  await queryInterface.createTable('applications', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    application_no: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    application_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'application_types',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'scholars',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    guide_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'guides',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    subject_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'research_centres',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    institution_type: {
      type: DataTypes.ENUM('UNIVERSITY_DEPARTMENT', 'AFFILIATED_COLLEGE'),
      allowNull: false,
    },
    form_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'RETURNED', 'APPROVED', 'REJECTED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    current_step_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    current_role_code: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    decided_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
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

  await queryInterface.addIndex('applications', ['status', 'current_role_code'], { name: 'idx_applications_status_role' });
  await queryInterface.addIndex('applications', ['department_id'], { name: 'idx_applications_department' });
  await queryInterface.addIndex('applications', ['research_centre_id'], { name: 'idx_applications_centre' });
  await queryInterface.addIndex('applications', ['scholar_id'], { name: 'idx_applications_scholar' });
  await queryInterface.addIndex('applications', ['application_type_id'], { name: 'idx_applications_type' });

  // 4. Workflow instance steps (runtime snapshot table)
  await queryInterface.createTable('workflow_instance_steps', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    role_code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    scope_rule: {
      type: DataTypes.ENUM('ASSIGNED_GUIDE', 'SAME_CENTRE', 'SAME_DEPARTMENT', 'ANY'),
      allowNull: false,
      defaultValue: 'ANY',
    },
    allowed_actions: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_final: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    sla_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
    },
    status: {
      type: DataTypes.ENUM('WAITING', 'ACTIVE', 'DONE', 'SKIPPED'),
      allowNull: false,
      defaultValue: 'WAITING',
    },
    acted_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    acted_at: {
      type: DataTypes.DATE(3),
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

  await queryInterface.addConstraint('workflow_instance_steps', {
    fields: ['application_id', 'step_order'],
    type: 'unique',
    name: 'uq_instance_steps_app_order',
  });

  // 5. Application documents
  await queryInterface.createTable('application_documents', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    doc_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'file_assets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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

  // 6. Application history (append-only audit)
  await queryInterface.createTable('application_history', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    step_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    from_status: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    to_status: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    actor_role: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  await queryInterface.addIndex('application_history', ['application_id', 'at'], {
    name: 'idx_app_history_app_at',
  });

  // 7. Official replies
  await queryInterface.createTable('official_replies', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    application_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    visible_to_scholar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sent_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // 8. Official reply files
  await queryInterface.createTable('official_reply_files', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    reply_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'official_replies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'file_assets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('official_reply_files');
  await queryInterface.dropTable('official_replies');
  await queryInterface.dropTable('application_history');
  await queryInterface.dropTable('application_documents');
  await queryInterface.dropTable('workflow_instance_steps');
  await queryInterface.dropTable('applications');
  await queryInterface.dropTable('workflow_steps');
  await queryInterface.dropTable('workflow_definitions');
};

