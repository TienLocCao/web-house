export function buildPagination(page: number, limit: number) {
  return {
    offset: (page - 1) * limit,
  }
}