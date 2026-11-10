import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromFile } from 'file-type';
import { FileAsset, AuditLog } from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { ERROR_CODES, ROLES } from '../../config/constants.js';
import { env } from '../../config/env.js';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export class FilesService {
  /**
   * Processes an uploaded file with magic-byte verification and structured storage.
   */
  static async processUpload({ file, userId, ownerType, ownerId, ip, userAgent }) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded', ERROR_CODES.UPLOAD_REJECTED);
    }

    const tempPath = file.path;

    try {
      // 1. Magic-byte MIME detection
      const detected = await fileTypeFromFile(tempPath);
      // For plain office XML documents or PDFs, ensure mime matches
      const mime = detected ? detected.mime : file.mimetype;

      if (!ALLOWED_MIME_TYPES.includes(mime)) {
        throw new ApiError(
          400,
          ERROR_CODES.UPLOAD_REJECTED,
          `File rejected: Disguised or unsupported MIME type (${mime}). Genuine PDF or approved documents required.`
        );
      }

      // 2. Compute SHA-256 checksum
      const fileBuffer = fs.readFileSync(tempPath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // 3. Prepare target directory: UPLOAD_DIR/<yyyy>/<mm>/
      const now = new Date();
      const year = String(now.getUTCFullYear());
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const targetDir = path.resolve(env.UPLOAD_DIR, year, month);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 4. Generate random stored filename
      const ext = path.extname(file.originalname).toLowerCase();
      const storedName = `${crypto.randomUUID()}${ext}`;
      const finalPath = path.join(targetDir, storedName);

      // 5. Move from temp to permanent storage
      fs.copyFileSync(tempPath, finalPath);
      fs.unlinkSync(tempPath);

      // 6. Record in file_assets table
      const asset = await FileAsset.create({
        original_name: file.originalname,
        stored_name: storedName,
        mime_type: mime,
        size_bytes: file.size,
        checksum_sha256: checksum,
        uploaded_by: userId,
        owner_type: ownerType,
        owner_id: ownerId,
        storage_path: finalPath,
      });

      await AuditLog.create({
        actor_user_id: userId,
        action: 'FILE_UPLOAD',
        entity_type: 'FILE_ASSET',
        entity_id: asset.id,
        before_json: null,
        after_json: { originalName: asset.original_name, size: asset.size_bytes },
        ip,
        user_agent: userAgent,
      });

      return asset;
    } catch (err) {
      // Clean up temp file if still present
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw err;
    }
  }

  /**
   * Retrieves file path for download after checking caller scope
   */
  static async getFileForDownload({ fileId, user }) {
    const asset = await FileAsset.findByPk(fileId);
    if (!asset) {
      throw ApiError.notFound('File not found');
    }

    // Admin has global access
    if (user.activeRole === ROLES.ADMIN) {
      return asset;
    }

    // Uploader has access
    if (asset.uploaded_by && asset.uploaded_by.toString() === user.sub.toString()) {
      return asset;
    }

    // Check scope on the owning record
    if (user.activeRole === ROLES.SCHOLAR) {
      if (asset.owner_type === 'USER' && asset.owner_id.toString() !== user.sub.toString()) {
        throw ApiError.notFound('File not found');
      }
    }

    return asset;
  }
}

export default FilesService;

