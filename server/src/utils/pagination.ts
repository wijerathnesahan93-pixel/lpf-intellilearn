import { PaginationParams } from '../types';

export function parsePagination(query: any): PaginationParams {
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit) || 20)),
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
    search: query.search || undefined,
  };
}

export function buildPaginationMeta(total: number, pageOrParams: number | PaginationParams, limit?: number) {
  const p = typeof pageOrParams === 'number' ? pageOrParams : pageOrParams.page;
  const l = typeof pageOrParams === 'number' ? limit! : pageOrParams.limit;
  return {
    total,
    page: p,
    limit: l,
    totalPages: Math.ceil(total / l),
  };
}
