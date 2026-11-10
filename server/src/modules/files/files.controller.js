import { FilesService } from './files.service.js';
import { successResponse } from '../../utils/response.js';

export const uploadFile = async (req, res) => {
  const file = req.file;
  const userId = req.user?.sub || null;
  const ownerType = req.body.ownerType || 'USER';
  const ownerId = req.body.ownerId || userId || 0;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  const asset = await FilesService.processUpload({
    file,
    userId,
    ownerType,
    ownerId,
    ip,
    userAgent,
  });

  return successResponse(
    res,
    {
      id: asset.id,
      originalName: asset.original_name,
      mimeType: asset.mime_type,
      sizeBytes: asset.size_bytes,
      storedName: asset.stored_name,
    },
    'File uploaded successfully',
    201
  );
};

export const downloadFile = async (req, res) => {
  const { fileId } = req.params;
  const user = req.user;

  const asset = await FilesService.getFileForDownload({ fileId, user });

  res.setHeader('Content-Type', asset.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${asset.original_name}"`);
  return res.sendFile(asset.storage_path);
};

