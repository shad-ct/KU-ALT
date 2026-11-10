import { MasterDataService } from './masterdata.service.js';
import { successResponse } from '../../utils/response.js';

export const getPublicDepartments = async (req, res) => {
  const departments = await MasterDataService.listDepartments({ activeOnly: 'true' });
  return successResponse(res, departments, 'Active departments retrieved');
};

export const getPublicCentres = async (req, res) => {
  const departmentId = req.params.departmentId || req.query.departmentId;
  const centres = await MasterDataService.listCentres({
    departmentId,
    activeOnly: 'true',
  });
  return successResponse(res, centres, 'Active research centres retrieved');
};

export const getDepartments = async (req, res) => {
  const departments = await MasterDataService.listDepartments(req.query);
  return successResponse(res, departments, 'Departments retrieved');
};

export const createDepartment = async (req, res) => {
  const { name, code, drcConvenorUserId } = req.body;
  const dept = await MasterDataService.createDepartment({
    name,
    code,
    drcConvenorUserId,
    userId: req.user.sub,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return successResponse(res, dept, 'Department created successfully', 201);
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const dept = await MasterDataService.updateDepartment(id, req.body, {
    userId: req.user.sub,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return successResponse(res, dept, 'Department updated successfully');
};

export const getCentres = async (req, res) => {
  const centres = await MasterDataService.listCentres(req.query);
  return successResponse(res, centres, 'Research centres retrieved');
};

export const createCentre = async (req, res) => {
  const { name, code, departmentId, institutionType, centreHeadUserId, collegeName } = req.body;
  const centre = await MasterDataService.createCentre({
    name,
    code,
    departmentId,
    institutionType,
    centreHeadUserId,
    collegeName,
    userId: req.user.sub,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return successResponse(res, centre, 'Research centre created successfully', 201);
};

export const updateCentre = async (req, res) => {
  const { id } = req.params;
  const centre = await MasterDataService.updateCentre(id, req.body, {
    userId: req.user.sub,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return successResponse(res, centre, 'Research centre updated successfully');
};

export const getProgrammes = async (req, res) => {
  const programmes = await MasterDataService.listProgrammes();
  return successResponse(res, programmes, 'Programmes retrieved');
};

export const getAcademicYears = async (req, res) => {
  const years = await MasterDataService.listAcademicYears();
  return successResponse(res, years, 'Academic years retrieved');
};

export const getDesignations = async (req, res) => {
  const designations = await MasterDataService.listDesignations();
  return successResponse(res, designations, 'Designations retrieved');
};

export const getCertificateTypes = async (req, res) => {
  const types = await MasterDataService.listCertificateTypes();
  return successResponse(res, types, 'Certificate types retrieved');
};

export const getApplicationTypes = async (req, res) => {
  const types = await MasterDataService.listApplicationTypes(req.query.kind);
  return successResponse(res, types, 'Application types retrieved');
};
