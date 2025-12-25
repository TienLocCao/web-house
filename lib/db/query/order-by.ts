type OrderOpts = { alias?: string; categoryAlias?: string }

const SORT_WHITELIST: Record<string, (o: OrderOpts) => string> = {
  name: o => `${o.alias ? o.alias + '.' : ''}name`,
  slug: o => `${o.alias ? o.alias + '.' : ''}slug`,
  category_name: o => `${o.categoryAlias ? o.categoryAlias + '.' : ''}name`,
  price: o => `${o.alias ? o.alias + '.' : ''}price`,
  stock: o => `${o.alias ? o.alias + '.' : ''}stock`,
  rating: o => `${o.alias ? o.alias + '.' : ''}rating`,
  review_count: o => `${o.alias ? o.alias + '.' : ''}review_count`,
  is_featured: o => `${o.alias ? o.alias + '.' : ''}is_featured`,
  is_available: o => `${o.alias ? o.alias + '.' : ''}is_available`,
  updatedAt: o => `${o.alias ? o.alias + '.' : ''}updated_at`,
  createdAt: o => `${o.alias ? o.alias + '.' : ''}created_at`,
}

export function buildOrderBy(
  sort: { key: string; order: "asc" | "desc" }[],
  opts: OrderOpts = {}
) {
  if (!sort?.length) return `ORDER BY ${opts.alias ? opts.alias + '.created_at' : 'created_at'} DESC`

  const clauses = sort
    .filter(s => SORT_WHITELIST[s.key])
    .map(s => `${SORT_WHITELIST[s.key](opts)} ${s.order.toUpperCase()}`)

  return clauses.length
    ? `ORDER BY ${clauses.join(", ")}`
    : `ORDER BY ${opts.alias ? opts.alias + '.created_at' : 'created_at'} DESC`
}
