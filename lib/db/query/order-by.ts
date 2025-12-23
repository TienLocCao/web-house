const SORT_WHITELIST: Record<string, string> = {
  name: "p.name",
  slug: "p.slug",
  category_name: "c.name",
  price: "p.price",
  stock: "p.stock",
  rating: "p.rating",
  review_count: "p.review_count",
  is_featured: "p.is_featured",
  is_available: "p.is_available",
  updatedAt: "p.updated_at",
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
