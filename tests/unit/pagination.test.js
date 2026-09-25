const { parsePagination, buildPaginationMeta, MAX_LIMIT } = require('../../src/utils/pagination');

describe('pagination utils', () => {
  test('gia tri mac dinh khi khong truyen page/limit', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  test('gioi han limit toi da, khong cho phep xin qua nhieu ban ghi 1 luc', () => {
    const result = parsePagination({ limit: '99999' });
    expect(result.limit).toBe(MAX_LIMIT);
  });

  test('gia tri khong hop le (chu, so am) -> fallback ve mac dinh', () => {
    expect(parsePagination({ page: 'abc', limit: '-5' })).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  test('tinh dung offset va totalPages', () => {
    const p = parsePagination({ page: '3', limit: '10' });
    expect(p.offset).toBe(20);
    expect(buildPaginationMeta(p, 45)).toEqual({ page: 3, limit: 10, total: 45, totalPages: 5 });
  });
});
