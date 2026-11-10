import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import RolePermission from './RolePermission.js';
import UserRole from './UserRole.js';
import UserPermission from './UserPermission.js';
import RefreshToken from './RefreshToken.js';
import PasswordReset from './PasswordReset.js';
import AuditLog from './AuditLog.js';

// Phase 2 Master Data, Files, Notifications, Settings
import Department from './Department.js';
import ResearchCentre from './ResearchCentre.js';
import ResearchProgramme from './ResearchProgramme.js';
import AcademicYear from './AcademicYear.js';
import Designation from './Designation.js';
import CertificateType from './CertificateType.js';
import ApplicationType from './ApplicationType.js';
import FileAsset from './FileAsset.js';
import Notification, { NotificationBroadcast } from './Notification.js';
import Setting from './Setting.js';

// Phase 3 People Models
import Guide from './Guide.js';
import GuideQualification from './GuideQualification.js';
import GuideSpecialization from './GuideSpecialization.js';
import Scholar from './Scholar.js';
import ScholarQualification from './ScholarQualification.js';
import ScholarTimeline from './ScholarTimeline.js';
import ScholarMilestone from './ScholarMilestone.js';
import RacSchedule from './RacSchedule.js';
import StaffCentre from './StaffCentre.js';

// Phase 3 Workflow & Applications Models
import WorkflowDefinition from './WorkflowDefinition.js';
import WorkflowStep from './WorkflowStep.js';
import Application from './Application.js';
import WorkflowInstanceStep from './WorkflowInstanceStep.js';
import ApplicationDocument from './ApplicationDocument.js';
import ApplicationHistory from './ApplicationHistory.js';
import OfficialReply from './OfficialReply.js';
import OfficialReplyFile from './OfficialReplyFile.js';

// Phase 7 Certificates & Jobs
import CertificateTemplate from './CertificateTemplate.js';
import Certificate from './Certificate.js';
import JobRun from './JobRun.js';

// Phase 8 Equipment
import EquipmentCategory from './EquipmentCategory.js';
import Equipment from './Equipment.js';
import EquipmentFile from './EquipmentFile.js';
import EquipmentUnit from './EquipmentUnit.js';
import EquipmentMaintenanceLog from './EquipmentMaintenanceLog.js';
import EquipmentRequest from './EquipmentRequest.js';
import EquipmentAllocation from './EquipmentAllocation.js';
import EquipmentRequestHistory from './EquipmentRequestHistory.js';

// Identity & Access Associations
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
});

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'direct_permissions',
});

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refresh_tokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'password_resets' });
PasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'actor_user_id', as: 'audit_logs' });
AuditLog.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' });

// Master Data Associations
Department.hasMany(ResearchCentre, { foreignKey: 'department_id', as: 'research_centres' });
ResearchCentre.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Department.belongsTo(User, { foreignKey: 'drc_convenor_user_id', as: 'drc_convenor' });
ResearchCentre.belongsTo(User, { foreignKey: 'centre_head_user_id', as: 'centre_head' });

// File Asset Associations
User.hasMany(FileAsset, { foreignKey: 'uploaded_by', as: 'uploaded_files' });
FileAsset.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Notification Associations
User.hasMany(Notification, { foreignKey: 'recipient_user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipient_user_id', as: 'recipient' });

NotificationBroadcast.hasMany(Notification, { foreignKey: 'broadcast_id', as: 'recipient_notifications' });
Notification.belongsTo(NotificationBroadcast, { foreignKey: 'broadcast_id', as: 'broadcast' });

// People Associations
User.hasOne(Guide, { foreignKey: 'user_id', as: 'guide_profile' });
Guide.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Guide.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Guide.belongsTo(ResearchCentre, { foreignKey: 'research_centre_id', as: 'research_centre' });
Guide.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });

Guide.hasMany(GuideQualification, { foreignKey: 'guide_id', as: 'qualifications' });
GuideQualification.belongsTo(Guide, { foreignKey: 'guide_id', as: 'guide' });

Guide.hasMany(GuideSpecialization, { foreignKey: 'guide_id', as: 'specializations' });
GuideSpecialization.belongsTo(Guide, { foreignKey: 'guide_id', as: 'guide' });

Guide.hasMany(Scholar, { foreignKey: 'guide_id', as: 'scholars' });

User.hasOne(Scholar, { foreignKey: 'user_id', as: 'scholar_profile' });
Scholar.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Scholar.belongsTo(ResearchProgramme, { foreignKey: 'programme_id', as: 'programme' });
Scholar.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Scholar.belongsTo(ResearchCentre, { foreignKey: 'research_centre_id', as: 'research_centre' });
Scholar.belongsTo(Guide, { foreignKey: 'guide_id', as: 'guide' });
Scholar.belongsTo(Guide, { foreignKey: 'co_guide_id', as: 'co_guide' });

Scholar.hasMany(ScholarQualification, { foreignKey: 'scholar_id', as: 'qualifications' });
ScholarQualification.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });

Scholar.hasOne(ScholarTimeline, { foreignKey: 'scholar_id', as: 'timeline' });
ScholarTimeline.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });

Scholar.hasMany(ScholarMilestone, { foreignKey: 'scholar_id', as: 'milestones' });
ScholarMilestone.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });

Scholar.hasMany(RacSchedule, { foreignKey: 'scholar_id', as: 'rac_schedules' });
RacSchedule.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });
RacSchedule.belongsTo(FileAsset, { foreignKey: 'minutes_file_id', as: 'minutes_file' });

Scholar.hasMany(Application, { foreignKey: 'scholar_id', as: 'applications' });

ResearchCentre.hasMany(Scholar, { foreignKey: 'research_centre_id', as: 'scholars' });
ResearchCentre.hasMany(Guide, { foreignKey: 'research_centre_id', as: 'guides' });
Department.hasMany(Scholar, { foreignKey: 'department_id', as: 'scholars' });
Department.hasMany(Guide, { foreignKey: 'department_id', as: 'guides' });

User.belongsToMany(ResearchCentre, {
  through: StaffCentre,
  foreignKey: 'user_id',
  otherKey: 'research_centre_id',
  as: 'assigned_centres',
});
ResearchCentre.belongsToMany(User, {
  through: StaffCentre,
  foreignKey: 'research_centre_id',
  otherKey: 'user_id',
  as: 'assigned_staff',
});

// Workflow & Applications Associations
WorkflowDefinition.hasMany(WorkflowStep, { foreignKey: 'definition_id', as: 'steps' });
WorkflowStep.belongsTo(WorkflowDefinition, { foreignKey: 'definition_id', as: 'definition' });

ApplicationType.belongsTo(WorkflowDefinition, { foreignKey: 'workflow_definition_id', as: 'workflow_definition' });
WorkflowDefinition.hasMany(ApplicationType, { foreignKey: 'workflow_definition_id', as: 'application_types' });

Application.belongsTo(ApplicationType, { foreignKey: 'application_type_id', as: 'application_type' });
Application.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });
Application.belongsTo(Guide, { foreignKey: 'guide_id', as: 'guide' });
Application.belongsTo(User, { foreignKey: 'subject_user_id', as: 'subject_user' });
Application.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Application.belongsTo(ResearchCentre, { foreignKey: 'research_centre_id', as: 'research_centre' });

Application.hasMany(WorkflowInstanceStep, { foreignKey: 'application_id', as: 'instance_steps' });
WorkflowInstanceStep.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
WorkflowInstanceStep.belongsTo(User, { foreignKey: 'acted_by', as: 'actor' });

Application.hasMany(ApplicationDocument, { foreignKey: 'application_id', as: 'documents' });
ApplicationDocument.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
ApplicationDocument.belongsTo(FileAsset, { foreignKey: 'file_id', as: 'file' });

Application.hasMany(ApplicationHistory, { foreignKey: 'application_id', as: 'history' });
ApplicationHistory.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
ApplicationHistory.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' });

Application.hasMany(OfficialReply, { foreignKey: 'application_id', as: 'official_replies' });
OfficialReply.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
OfficialReply.belongsTo(User, { foreignKey: 'by_user_id', as: 'sender' });

OfficialReply.hasMany(OfficialReplyFile, { foreignKey: 'reply_id', as: 'files' });
OfficialReplyFile.belongsTo(OfficialReply, { foreignKey: 'reply_id', as: 'reply' });
OfficialReplyFile.belongsTo(FileAsset, { foreignKey: 'file_id', as: 'file' });

// Certificate Associations
CertificateTemplate.hasMany(Certificate, { foreignKey: 'template_id', as: 'certificates' });
Certificate.belongsTo(CertificateTemplate, { foreignKey: 'template_id', as: 'template' });
Certificate.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });
Certificate.belongsTo(Guide, { foreignKey: 'guide_id', as: 'guide' });
Certificate.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });
Certificate.belongsTo(User, { foreignKey: 'revoked_by', as: 'revoker' });
Certificate.belongsTo(FileAsset, { foreignKey: 'file_id', as: 'file' });

// Equipment Associations
Department.hasMany(EquipmentCategory, { foreignKey: 'department_id', as: 'equipment_categories' });
EquipmentCategory.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
EquipmentCategory.hasMany(Equipment, { foreignKey: 'category_id', as: 'equipment' });
Equipment.belongsTo(EquipmentCategory, { foreignKey: 'category_id', as: 'category' });
Equipment.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Equipment.belongsTo(ResearchCentre, { foreignKey: 'research_centre_id', as: 'research_centre' });
Equipment.hasMany(EquipmentUnit, { foreignKey: 'equipment_id', as: 'units' });
EquipmentUnit.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
Equipment.hasMany(EquipmentFile, { foreignKey: 'equipment_id', as: 'files' });
EquipmentFile.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
EquipmentFile.belongsTo(FileAsset, { foreignKey: 'file_id', as: 'file' });
Equipment.hasMany(EquipmentAllocation, { foreignKey: 'equipment_id', as: 'allocations' });
Equipment.hasMany(EquipmentRequest, { foreignKey: 'equipment_id', as: 'requests' });
EquipmentUnit.hasMany(EquipmentMaintenanceLog, { foreignKey: 'unit_id', as: 'maintenance_logs' });
EquipmentMaintenanceLog.belongsTo(EquipmentUnit, { foreignKey: 'unit_id', as: 'unit' });
EquipmentMaintenanceLog.belongsTo(User, { foreignKey: 'by_user_id', as: 'logger' });
EquipmentRequest.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });
EquipmentRequest.belongsTo(Guide, { foreignKey: 'guide_id', as: 'guide' });
EquipmentRequest.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
EquipmentRequest.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
EquipmentRequest.belongsTo(User, { foreignKey: 'decided_by', as: 'decider' });
EquipmentRequest.hasOne(EquipmentAllocation, { foreignKey: 'request_id', as: 'allocation' });
EquipmentAllocation.belongsTo(EquipmentRequest, { foreignKey: 'request_id', as: 'request' });
EquipmentAllocation.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
EquipmentAllocation.belongsTo(EquipmentUnit, { foreignKey: 'unit_id', as: 'unit' });
EquipmentAllocation.belongsTo(Scholar, { foreignKey: 'scholar_id', as: 'scholar' });
EquipmentAllocation.belongsTo(User, { foreignKey: 'allotted_by', as: 'allotter' });
EquipmentAllocation.belongsTo(User, { foreignKey: 'received_by', as: 'receiver' });
EquipmentRequest.hasMany(EquipmentRequestHistory, { foreignKey: 'request_id', as: 'history' });
EquipmentRequestHistory.belongsTo(EquipmentRequest, { foreignKey: 'request_id', as: 'request' });
EquipmentRequestHistory.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' });

export {
  User,
  Role,
  Permission,
  RolePermission,
  UserRole,
  UserPermission,
  RefreshToken,
  PasswordReset,
  AuditLog,
  Department,
  ResearchCentre,
  ResearchProgramme,
  AcademicYear,
  Designation,
  CertificateType,
  ApplicationType,
  FileAsset,
  Notification,
  NotificationBroadcast,
  Setting,
  Guide,
  GuideQualification,
  GuideSpecialization,
  Scholar,
  ScholarQualification,
  ScholarTimeline,
  ScholarMilestone,
  RacSchedule,
  StaffCentre,
  WorkflowDefinition,
  WorkflowStep,
  Application,
  WorkflowInstanceStep,
  ApplicationDocument,
  ApplicationHistory,
  OfficialReply,
  OfficialReplyFile,
  CertificateTemplate,
  Certificate,
  JobRun,
  EquipmentCategory,
  Equipment,
  EquipmentFile,
  EquipmentUnit,
  EquipmentMaintenanceLog,
  EquipmentRequest,
  EquipmentAllocation,
  EquipmentRequestHistory,
};
