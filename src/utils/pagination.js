const AppError = require('./AppError');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Chuan hoa & validate query param page/limit.
 * Khong bao gio cho phep limit vuot qua MAX_LIMIT, tranh load qua nhieu
 * ban ghi trong 1 request.
 */
function parsePagination(query) {
  const page = parseInt(query.page, 10);
  const limit = parseInt(query.limit, 10);

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0
    ? Math.min(limit, MAX_LIMIT)
    : DEFAULT_LIMIT;

  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}

function buildPaginationMeta({ page, limit }, total) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

module.exports = { parsePagination, buildPaginationMeta, DEFAULT_LIMIT, MAX_LIMIT };
