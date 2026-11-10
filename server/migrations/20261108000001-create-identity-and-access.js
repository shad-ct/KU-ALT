import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  // 1. users
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'PENDING_APPROVAL',
    },
    must_change_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verified_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    failed_login_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
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

  await queryInterface.addIndex('users', ['status'], { name: 'ix_users_status' });
  await queryInterface.addIndex('users', ['department_id'], { name: 'ix_users_department_id' });
  await queryInterface.addIndex('users', ['research_centre_id'], { name: 'ix_users_research_centre_id' });

  // 2. roles
  await queryInterface.createTable('roles', {
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
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    is_system: {
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

  // 3. permissions
  await queryInterface.createTable('permissions', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    module: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
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

  // 4. role_permissions (Composite PK)
  await queryInterface.createTable('role_permissions', {
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
  await queryInterface.addConstraint('role_permissions', {
    fields: ['role_id', 'permission_id'],
    type: 'primary key',
    name: 'pk_role_permissions',
  });

  // 5. user_roles (Composite PK)
  await queryInterface.createTable('user_roles', {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
  await queryInterface.addConstraint('user_roles', {
    fields: ['user_id', 'role_id'],
    type: 'primary key',
    name: 'pk_user_roles',
  });

  // 6. user_permissions (Extra direct permissions - Composite PK)
  await queryInterface.createTable('user_permissions', {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
  await queryInterface.addConstraint('user_permissions', {
    fields: ['user_id', 'permission_id'],
    type: 'primary key',
    name: 'pk_user_permissions',
  });

  // 7. refresh_tokens
  await queryInterface.createTable('refresh_tokens', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    family_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    replaced_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
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
  await queryInterface.addIndex('refresh_tokens', ['user_id', 'family_id'], {
    name: 'ix_refresh_tokens_user_family',
  });

  // 8. password_resets
  await queryInterface.createTable('password_resets', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    used_at: {
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

  // 9. audit_logs (Append-only)
  await queryInterface.createTable('audit_logs', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    actor_role: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    before_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    after_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    request_id: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
  await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], { name: 'ix_audit_logs_entity' });
  await queryInterface.addIndex('audit_logs', ['actor_user_id'], { name: 'ix_audit_logs_actor' });
  await queryInterface.addIndex('audit_logs', ['at'], { name: 'ix_audit_logs_at' });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('audit_logs');
  await queryInterface.dropTable('password_resets');
  await queryInterface.dropTable('refresh_tokens');
  await queryInterface.dropTable('user_permissions');
  await queryInterface.dropTable('user_roles');
  await queryInterface.dropTable('role_permissions');
  await queryInterface.dropTable('permissions');
  await queryInterface.dropTable('roles');
  await queryInterface.dropTable('users');
};

