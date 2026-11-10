import { ApiError } from './ApiError.js';
import { ERROR_CODES } from '../config/constants.js';

/**
 * Whitelist-based SQL Sort parser to prevent injection via order by clauses.
 * 
 * @param {string} [sortParam] - e.g. "created_at:desc" or "-created_at" or "name:asc"
 * @param {string[]} allowedColumns - Array of permissible column names
 * @param {string} [defaultColumn='created_at'] - Fallback column
 * @param {'ASC' | 'DESC'} [defaultOrder='DESC'] - Fallback direction
 * @returns {Array<[string, 'ASC' | 'DESC']>} Sequelize order array
 */
export const parseSort = (
  sortParam,
  allowedColumns = ['created_at', 'updated_at', 'id'],
  defaultColumn = 'created_at',
  defaultOrder = 'DESC'
) => {
  if (!sortParam) {
    return [[defaultColumn, defaultOrder]];
  }

  let column = sortParam;
  let direction = defaultOrder;

  if (sortParam.includes(':')) {
    const parts = sortParam.split(':');
    column = parts[0].trim();
    direction = parts[1].trim().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  } else if (sortParam.startsWith('-')) {
    column = sortParam.substring(1).trim();
    direction = 'DESC';
  } else if (sortParam.startsWith('+')) {
    column = sortParam.substring(1).trim();
    direction = 'ASC';
  }

  if (!allowedColumns.includes(column)) {
    throw ApiError.badRequest(
      `Invalid sort parameter '${column}'. Allowed sort columns: ${allowedColumns.join(', ')}`,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  return [[column, direction]];
};

