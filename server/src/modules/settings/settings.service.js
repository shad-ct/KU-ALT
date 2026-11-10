import { Setting, AuditLog } from '../../models/index.js';

const cache = new Map();

export class SettingsService {
  /**
   * Reads a setting key from memory cache or database
   */
  static async get(key, defaultValue = null) {
    if (cache.has(key)) {
      return cache.get(key);
    }

    const record = await Setting.findOne({ where: { key } });
    if (!record) {
      return defaultValue;
    }

    cache.set(key, record.value);
    return record.value;
  }

  /**
   * Sets a setting key in DB and updates memory cache
   */
  static async set(key, value, group = 'general', updatedBy = null, ip = null, userAgent = null) {
    let record = await Setting.findOne({ where: { key } });
    const beforeValue = record ? record.value : null;

    if (record) {
      record.value = value;
      record.group = group;
      record.updated_by = updatedBy;
      await record.save();
    } else {
      record = await Setting.create({
        key,
        value,
        group,
        updated_by: updatedBy,
      });
    }

    // Update in-memory cache
    cache.set(key, value);

    // Audit log
    await AuditLog.create({
      actor_user_id: updatedBy,
      action: 'SETTING_UPDATE',
      entity_type: 'SETTING',
      entity_id: record.id,
      before_json: beforeValue,
      after_json: value,
      ip,
      user_agent: userAgent,
    });

    return record.value;
  }

  /**
   * Retrieves all settings belonging to a group
   */
  static async getByGroup(group) {
    const records = await Setting.findAll({ where: { group } });
    const result = {};
    for (const r of records) {
      result[r.key] = r.value;
      cache.set(r.key, r.value);
    }
    return result;
  }

  /**
   * Clears the in-memory cache (e.g. for testing)
   */
  static clearCache() {
    cache.clear();
  }
}

export default SettingsService;

