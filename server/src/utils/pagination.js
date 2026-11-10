/**
 * Standard Pagination Utilities
 */

export const parsePagination = (query = {}, defaultLimit = 20, maxLimit = 100) => {
  let page = parseInt(query?.page, 10);
  let limit = parseInt(query?.limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const formatPaginationMeta = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getPagination = (page, limit, defaultLimit = 20, maxLimit = 100) => {
  return parsePagination({ page, limit }, defaultLimit, maxLimit);
};

export const getPagingData = (data, page, limit) => {
  const total = data.count || (data.rows ? data.rows.length : 0);
  const items = data.rows || data.items || [];
  return {
    items,
    meta: formatPaginationMeta(total, page, limit),
  };
};
