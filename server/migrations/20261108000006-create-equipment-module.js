import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  // 1. equipment_categories
  await queryInterface.createTable('equipment_categories', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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

  await queryInterface.addIndex('equipment_categories', ['department_id', 'name'], {
    unique: true,
    name: 'uq_equipment_categories_dept_name',
  });

  // 2. equipment
  await queryInterface.createTable('equipment', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    research_centre_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'research_centres',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'equipment_categories',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    usage_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tracking_mode: {
      type: DataTypes.ENUM('SERIALIZED', 'BULK'),
      allowNull: false,
      defaultValue: 'SERIALIZED',
    },
    total_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    available_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    max_loan_days: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 14,
    },
    requires_training: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

  await queryInterface.addIndex('equipment', ['department_id', 'code'], {
    unique: true,
    name: 'uq_equipment_dept_code',
  });

  // Add check constraint for available_quantity >= 0
  await queryInterface.sequelize.query(`
    ALTER TABLE equipment ADD CONSTRAINT chk_equipment_available_qty CHECK (available_quantity >= 0);
  `);

  // 3. equipment_files
  await queryInterface.createTable('equipment_files', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    equipment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    file_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'file_assets',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    kind: {
      type: DataTypes.ENUM('IMAGE', 'DOCUMENT'),
      allowNull: false,
      defaultValue: 'IMAGE',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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

  // 4. equipment_units
  await queryInterface.createTable('equipment_units', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    equipment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    asset_tag: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    serial_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    condition: {
      type: DataTypes.ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'),
      allowNull: false,
      defaultValue: 'NEW',
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    warranty_until: {
      type: DataTypes.DATEONLY,
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

  await queryInterface.addIndex('equipment_units', ['equipment_id', 'status'], {
    name: 'ix_equipment_units_eq_status',
  });

  // 5. equipment_maintenance_log
  await queryInterface.createTable('equipment_maintenance_log', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    unit_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'equipment_units',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    logged_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    next_due: {
      type: DataTypes.DATEONLY,
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

  // 6. equipment_requests
  await queryInterface.createTable('equipment_requests', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    request_no: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    scholar_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'scholars',
        key: 'id',
      },
      onDelete: 'RESTRICT',
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
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    equipment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requested_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_return_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'ALLOCATED', 'RETURNED', 'OVERDUE', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decided_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    decided_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    was_overdue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

  await queryInterface.addIndex('equipment_requests', ['department_id', 'status'], {
    name: 'ix_eq_req_dept_status',
  });
  await queryInterface.addIndex('equipment_requests', ['scholar_id', 'status'], {
    name: 'ix_eq_req_scholar_status',
  });
  await queryInterface.addIndex('equipment_requests', ['equipment_id'], {
    name: 'ix_eq_req_equipment',
  });

  // 7. equipment_allocations with STORED GENERATED COLUMN for MySQL 8
  await queryInterface.sequelize.query(`
    CREATE TABLE equipment_allocations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      request_id BIGINT UNSIGNED NOT NULL UNIQUE,
      equipment_id BIGINT UNSIGNED NOT NULL,
      unit_id BIGINT UNSIGNED NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      scholar_id BIGINT UNSIGNED NOT NULL,
      allotted_by BIGINT UNSIGNED NULL,
      allocated_on DATE NOT NULL,
      expected_return_date DATE NOT NULL,
      returned_on DATE NULL,
      return_condition VARCHAR(100) NULL,
      return_notes TEXT NULL,
      received_by BIGINT UNSIGNED NULL,
      status ENUM('ACTIVE', 'OVERDUE', 'RETURNED') NOT NULL DEFAULT 'ACTIVE',
      active_unit_id BIGINT UNSIGNED GENERATED ALWAYS AS (IF(status IN ('ACTIVE','OVERDUE'), unit_id, NULL)) STORED,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_one_active_allocation_per_unit (active_unit_id),
      CONSTRAINT fk_eq_alloc_request FOREIGN KEY (request_id) REFERENCES equipment_requests(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_eq_alloc_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_eq_alloc_unit FOREIGN KEY (unit_id) REFERENCES equipment_units(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT fk_eq_alloc_scholar FOREIGN KEY (scholar_id) REFERENCES scholars(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT fk_eq_alloc_allotted_by FOREIGN KEY (allotted_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_eq_alloc_received_by FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8. equipment_request_history
  await queryInterface.createTable('equipment_request_history', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    request_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'equipment_requests',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    from_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    to_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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
  await queryInterface.dropTable('equipment_request_history');
  await queryInterface.dropTable('equipment_allocations');
  await queryInterface.dropTable('equipment_requests');
  await queryInterface.dropTable('equipment_maintenance_log');
  await queryInterface.dropTable('equipment_units');
  await queryInterface.dropTable('equipment_files');
  await queryInterface.dropTable('equipment');
  await queryInterface.dropTable('equipment_categories');
};
