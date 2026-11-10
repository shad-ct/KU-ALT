import bcrypt from 'bcryptjs';
import { ROLES, USER_STATUS } from '../src/config/constants.js';

export const up = async (queryInterface) => {
  const now = new Date();

  // 1. Seed Roles
  const rolesData = [
    { code: ROLES.SCHOLAR, name: 'Research Scholar', is_system: true, created_at: now, updated_at: now },
    { code: ROLES.GUIDE, name: 'Research Guide', is_system: true, created_at: now, updated_at: now },
    { code: ROLES.CENTRE_HEAD, name: 'Research Centre Head', is_system: true, created_at: now, updated_at: now },
    { code: ROLES.DRC_CONVENOR, name: 'DRC Convenor / Department Head', is_system: true, created_at: now, updated_at: now },
    { code: ROLES.STAFF, name: 'Section Staff / Administrative Officer', is_system: true, created_at: now, updated_at: now },
    { code: ROLES.ADMIN, name: 'Super Administrator', is_system: true, created_at: now, updated_at: now },
  ];

  await queryInterface.bulkInsert('roles', rolesData);

  // 2. Seed Permissions
  const permissionsData = [
    // Profile
    { code: 'profile:read', module: 'profile', action: 'read', description: 'Read own user profile', created_at: now, updated_at: now },
    { code: 'profile:update', module: 'profile', action: 'update', description: 'Update own user profile', created_at: now, updated_at: now },
    // Registration
    { code: 'registration:submit', module: 'registration', action: 'submit', description: 'Submit registration application', created_at: now, updated_at: now },
    { code: 'registration:verify', module: 'registration', action: 'verify', description: 'Verify registration file', created_at: now, updated_at: now },
    // Application
    { code: 'application:create', module: 'application', action: 'create', description: 'Create service application', created_at: now, updated_at: now },
    { code: 'application:cancel', module: 'application', action: 'cancel', description: 'Cancel own application', created_at: now, updated_at: now },
    { code: 'application:verify', module: 'application', action: 'verify', description: 'Verify scholar application', created_at: now, updated_at: now },
    { code: 'application:forward', module: 'application', action: 'forward', description: 'Forward application to next authority', created_at: now, updated_at: now },
    { code: 'application:reject', module: 'application', action: 'reject', description: 'Reject application with remarks', created_at: now, updated_at: now },
    { code: 'application:return', module: 'application', action: 'return', description: 'Return application for corrections', created_at: now, updated_at: now },
    { code: 'application:reply', module: 'application', action: 'reply', description: 'Send official university reply', created_at: now, updated_at: now },
    { code: 'status:update', module: 'application', action: 'update_status', description: 'Update application status directly', created_at: now, updated_at: now },
    // People
    { code: 'scholar:read', module: 'scholar', action: 'read', description: 'Read scholar records in scope', created_at: now, updated_at: now },
    { code: 'guide:read', module: 'guide', action: 'read', description: 'Read guide records in scope', created_at: now, updated_at: now },
    // Certificates
    { code: 'certificate:generate', module: 'certificate', action: 'generate', description: 'Generate formal certificate', created_at: now, updated_at: now },
    { code: 'certificate-template:manage', module: 'certificate', action: 'manage_template', description: 'Manage certificate templates', created_at: now, updated_at: now },
    // Notifications
    { code: 'notification:send', module: 'notification', action: 'send', description: 'Send broadcast or individual notice', created_at: now, updated_at: now },
    // Reports
    { code: 'report:view', module: 'report', action: 'view', description: 'View institutional report data', created_at: now, updated_at: now },
    { code: 'report:export', module: 'report', action: 'export', description: 'Export report data to PDF/Excel', created_at: now, updated_at: now },
    // Governance
    { code: 'user:manage', module: 'governance', action: 'manage_users', description: 'Create and edit user accounts', created_at: now, updated_at: now },
    { code: 'role:manage', module: 'governance', action: 'manage_roles', description: 'Configure roles and permissions', created_at: now, updated_at: now },
    { code: 'master:manage', module: 'governance', action: 'manage_master', description: 'Manage master academic data', created_at: now, updated_at: now },
    { code: 'settings:manage', module: 'governance', action: 'manage_settings', description: 'Manage system settings', created_at: now, updated_at: now },
    { code: 'audit:manage', module: 'governance', action: 'manage_audit', description: 'Inspect system audit trail', created_at: now, updated_at: now },
    // Equipment
    { code: 'equipment:browse', module: 'equipment', action: 'browse', description: 'Browse research equipment catalog', created_at: now, updated_at: now },
    { code: 'equipment-request:create', module: 'equipment', action: 'request', description: 'Request equipment loan', created_at: now, updated_at: now },
    { code: 'equipment-request:cancel', module: 'equipment', action: 'cancel_request', description: 'Cancel equipment request', created_at: now, updated_at: now },
    { code: 'equipment:manage', module: 'equipment', action: 'manage', description: 'Manage departmental equipment inventory', created_at: now, updated_at: now },
    { code: 'equipment-request:review', module: 'equipment', action: 'review', description: 'Review equipment requests', created_at: now, updated_at: now },
    { code: 'equipment-request:allocate', module: 'equipment', action: 'allocate', description: 'Allocate unit to scholar', created_at: now, updated_at: now },
    { code: 'equipment-request:return', module: 'equipment', action: 'return', description: 'Process equipment check-in', created_at: now, updated_at: now },
    { code: 'equipment:monitor', module: 'equipment', action: 'monitor', description: 'Monitor university-wide equipment', created_at: now, updated_at: now },
  ];

  await queryInterface.bulkInsert('permissions', permissionsData);

  // Query back IDs for mapping
  const [roles] = await queryInterface.sequelize.query('SELECT id, code FROM roles');
  const [permissions] = await queryInterface.sequelize.query('SELECT id, code FROM permissions');

  const roleMap = Object.fromEntries(roles.map((r) => [r.code, r.id]));
  const permMap = Object.fromEntries(permissions.map((p) => [p.code, p.id]));

  // 3. Map Role Permissions per 07 §2 Matrix
  const rolePermissionsMap = {
    [ROLES.SCHOLAR]: [
      'profile:read',
      'profile:update',
      'registration:submit',
      'application:create',
      'application:cancel',
      'scholar:read',
      'equipment:browse',
      'equipment-request:create',
      'equipment-request:cancel',
    ],
    [ROLES.GUIDE]: [
      'profile:read',
      'profile:update',
      'registration:submit',
      'application:verify',
      'application:forward',
      'application:reject',
      'application:return',
      'scholar:read',
      'guide:read',
      'equipment:browse',
    ],
    [ROLES.CENTRE_HEAD]: [
      'profile:read',
      'profile:update',
      'registration:verify',
      'application:verify',
      'application:forward',
      'application:reject',
      'application:return',
      'scholar:read',
      'guide:read',
      'equipment:browse',
    ],
    [ROLES.DRC_CONVENOR]: [
      'profile:read',
      'profile:update',
      'registration:verify',
      'application:verify',
      'application:forward',
      'application:reject',
      'application:return',
      'scholar:read',
      'guide:read',
      'report:view',
      'report:export',
      'equipment:browse',
      'equipment:manage',
      'equipment-request:review',
      'equipment-request:allocate',
      'equipment-request:return',
    ],
    [ROLES.STAFF]: [
      'profile:read',
      'profile:update',
      'registration:verify',
      'application:verify',
      'application:forward',
      'application:reject',
      'application:return',
      'application:reply',
      'status:update',
      'scholar:read',
      'guide:read',
      'certificate:generate',
      'notification:send',
      'report:view',
      'report:export',
      'equipment:browse',
    ],
    [ROLES.ADMIN]: Object.keys(permMap), // Admin holds all permissions
  };

  const rolePermissionsData = [];
  for (const [roleCode, permCodes] of Object.entries(rolePermissionsMap)) {
    const roleId = roleMap[roleCode];
    for (const permCode of permCodes) {
      if (roleId && permMap[permCode]) {
        rolePermissionsData.push({
          role_id: roleId,
          permission_id: permMap[permCode],
          created_at: now,
          updated_at: now,
        });
      }
    }
  }

  await queryInterface.bulkInsert('role_permissions', rolePermissionsData);

  // 4. Seed One ACTIVE Demo User Per Role
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const demoUsers = [
    {
      email: 'scholar@kannur.ac.in',
      password_hash: passwordHash,
      full_name: 'Deepa V. K. (Scholar)',
      phone: '9847012345',
      status: USER_STATUS.ACTIVE,
      department_id: 1,
      research_centre_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'guide@kannur.ac.in',
      password_hash: passwordHash,
      full_name: 'Dr. K. Raman (Guide)',
      phone: '9847012346',
      status: USER_STATUS.ACTIVE,
      department_id: 1,
      research_centre_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'centrehead@kannur.ac.in',
      password_hash: passwordHash,
      full_name: 'Dr. S. Nambiar (Centre Head)',
      phone: '9847012347',
      status: USER_STATUS.ACTIVE,
      department_id: 1,
      research_centre_id: 2,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'drc@kannur.ac.in',
      password_hash: passwordHash,
      full_name: 'Dr. V. Menon (DRC Convenor)',
      phone: '9847012348',
      status: USER_STATUS.ACTIVE,
      department_id: 1,
      research_centre_id: 1,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'staff@kannur.ac.in',
      password_hash: passwordHash,
      full_name: 'Suresh Kumar (Section Staff)',
      phone: '9847012349',
      status: USER_STATUS.ACTIVE,
      created_at: now,
      updated_at: now,
    },
    {
      email: 'admin@kannur.ac.in',
      password_hash: passwordHash,
      full_name: 'Super Administrator',
      phone: '9847012350',
      status: USER_STATUS.ACTIVE,
      created_at: now,
      updated_at: now,
    },
  ];

  await queryInterface.bulkInsert('users', demoUsers);

  // Link demo users to their roles
  const [users] = await queryInterface.sequelize.query('SELECT id, email FROM users');
  const userMap = Object.fromEntries(users.map((u) => [u.email, u.id]));

  const userRolesData = [
    { user_id: userMap['scholar@kannur.ac.in'], role_id: roleMap[ROLES.SCHOLAR], created_at: now, updated_at: now },
    { user_id: userMap['guide@kannur.ac.in'], role_id: roleMap[ROLES.GUIDE], created_at: now, updated_at: now },
    { user_id: userMap['centrehead@kannur.ac.in'], role_id: roleMap[ROLES.CENTRE_HEAD], created_at: now, updated_at: now },
    { user_id: userMap['drc@kannur.ac.in'], role_id: roleMap[ROLES.DRC_CONVENOR], created_at: now, updated_at: now },
    { user_id: userMap['staff@kannur.ac.in'], role_id: roleMap[ROLES.STAFF], created_at: now, updated_at: now },
    { user_id: userMap['admin@kannur.ac.in'], role_id: roleMap[ROLES.ADMIN], created_at: now, updated_at: now },
  ];

  await queryInterface.bulkInsert('user_roles', userRolesData);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('user_roles', null, {});
  await queryInterface.bulkDelete('users', null, {});
  await queryInterface.bulkDelete('role_permissions', null, {});
  await queryInterface.bulkDelete('permissions', null, {});
  await queryInterface.bulkDelete('roles', null, {});
};

