export function buildWhere(filter: Record<string, any>) {
  const conditions: string[] = []
  const values: any[] = []

  if (filter.name) {
    values.push(`%${filter.name}%`)
    conditions.push(`p.name ILIKE $${values.length}`)
  }

  if (filter.categoryId) {
    values.push(filter.categoryId)
    conditions.push(`p.category_id = $${values.length}`)
  }

  if (filter.isAvailable !== undefined) {
    values.push(filter.isAvailable)
    conditions.push(`p.is_available = $${values.length}`)
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  }
}
