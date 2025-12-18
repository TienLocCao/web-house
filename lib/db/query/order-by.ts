const SORT_WHITELIST: Record<string, string> = {
  price: "p.price",
  stock: "p.stock",
  createdAt: "p.created_at",
}

export function buildOrderBy(sort: { key: string; order: "asc" | "desc" }[]) {
  if (!sort?.length) return "ORDER BY p.created_at DESC"

  const clauses = sort
    .filter(s => SORT_WHITELIST[s.key])
    .map(s => `${SORT_WHITELIST[s.key]} ${s.order.toUpperCase()}`)

  return clauses.length
    ? `ORDER BY ${clauses.join(", ")}`
    : "ORDER BY p.created_at DESC"
}
